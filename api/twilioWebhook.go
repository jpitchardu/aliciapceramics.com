package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type TwilioWebhookPayload struct {
	MessageSid    string `json:"MessageSid"`
	From          string `json:"From"`
	To            string `json:"To"`
	Body          string `json:"Body"`
	MessageStatus string `json:"MessageStatus"`
	SmsStatus     string `json:"SmsStatus"`
	AccountSid    string `json:"AccountSid"`
}

func TwilioWebhookHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		LogError("invalid_method", fmt.Errorf("method %s not allowed", r.Method), map[string]any{
			"method": r.Method,
		})
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	err := r.ParseForm()
	if err != nil {
		LogError("parse_form", err, map[string]any{})
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	payload := TwilioWebhookPayload{
		MessageSid:    r.FormValue("MessageSid"),
		From:          r.FormValue("From"),
		To:            r.FormValue("To"),
		Body:          r.FormValue("Body"),
		MessageStatus: r.FormValue("MessageStatus"),
		SmsStatus:     r.FormValue("SmsStatus"),
		AccountSid:    r.FormValue("AccountSid"),
	}

	// Log the webhook for debugging
	LogInfo("twilio_webhook_received", map[string]any{
		"message_sid": payload.MessageSid,
		"from":        payload.From,
		"has_body":    payload.Body != "",
		"status":      payload.MessageStatus,
	})

	if payload.Body != "" {
		// This is an incoming SMS
		err = handleIncomingSMS(payload)
	} else if payload.MessageStatus != "" {
		// This is a status update
		err = handleStatusUpdate(payload)
	} else {
		LogError("unknown_webhook_type", fmt.Errorf("unrecognized webhook payload"), map[string]any{
			"payload": fmt.Sprintf("%+v", payload),
		})
		http.Error(w, "Unknown webhook type", http.StatusBadRequest)
		return
	}

	if err != nil {
		LogError("webhook_processing_failed", err, map[string]any{
			"message_sid": payload.MessageSid,
		})
		http.Error(w, "Processing failed", http.StatusInternalServerError)
		return
	}

	// Twilio expects 200 OK response
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func handleIncomingSMS(payload TwilioWebhookPayload) error {
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	// Find the conversation by customer phone number
	conversationId, err := findConversationByPhone(supabaseUrl, supabaseKey, payload.From)
	if err != nil {
		return fmt.Errorf("failed to find conversation for phone %s: %w", payload.From, err)
	}

	// Create incoming message record
	message := MessageDB{
		ConversationId:   conversationId,
		Body:             payload.Body,
		Direction:        "inbound",
		TwilioMessageSid: payload.MessageSid,
		TwilioStatus:     "received",
	}

	_, err = storeIncomingMessage(supabaseUrl, supabaseKey, message)
	if err != nil {
		return fmt.Errorf("failed to store incoming message: %w", err)
	}

	return nil
}

func handleStatusUpdate(payload TwilioWebhookPayload) error {
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	// Update message status in database
	err := updateMessageStatus(supabaseUrl, supabaseKey, payload.MessageSid, payload.MessageStatus)
	if err != nil {
		return fmt.Errorf("failed to update message status: %w", err)
	}

	return nil
}

func findConversationByPhone(supabaseUrl, supabaseKey, phoneNumber string) (string, error) {
	url := fmt.Sprintf("%s/rest/v1/conversations?customer_phone=eq.%s&select=id", supabaseUrl, phoneNumber)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to query conversations for phone %s: %w", phoneNumber, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	var conversations []struct {
		Id string `json:"id"`
	}

	if err := json.Unmarshal(body, &conversations); err != nil {
		return "", fmt.Errorf("failed to parse conversations response: %w", err)
	}

	if len(conversations) == 0 {
		return "", fmt.Errorf("no conversation found for phone number %s", phoneNumber)
	}

	return conversations[0].Id, nil
}

func storeIncomingMessage(supabaseUrl, supabaseKey string, message MessageDB) (string, error) {
	messageJson, err := json.Marshal(message)
	if err != nil {
		return "", fmt.Errorf("failed to marshal message to JSON: %w", err)
	}

	url := fmt.Sprintf("%s/rest/v1/messages", supabaseUrl)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(messageJson))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to store message: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return "", fmt.Errorf("failed to store message with status code %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	var createdMessages []MessageDB
	if err := json.Unmarshal(body, &createdMessages); err != nil {
		return "", fmt.Errorf("failed to parse created messages response: %w", err)
	}

	if len(createdMessages) == 0 {
		return "", fmt.Errorf("no messages returned after creation")
	}

	return createdMessages[0].Id, nil
}

func updateMessageStatus(supabaseUrl, supabaseKey, twilioSid, status string) error {
	updatePayload := map[string]interface{}{
		"twilio_status": status,
	}

	updateJson, err := json.Marshal(updatePayload)
	if err != nil {
		return fmt.Errorf("failed to marshal update payload: %w", err)
	}

	url := fmt.Sprintf("%s/rest/v1/messages?twilio_message_sid=eq.%s", supabaseUrl, twilioSid)

	req, err := http.NewRequest("PATCH", url, bytes.NewBuffer(updateJson))
	if err != nil {
		return fmt.Errorf("failed to create update request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to update message status for sid %s: %w", twilioSid, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		return fmt.Errorf("failed to update message status with status code %d", resp.StatusCode)
	}

	return nil
}
