package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

type NewMessageRequest = struct {
	Body    string `json:"body"`
	OrderId string `json:"orderId"`
}

type ConversationDB = struct {
	Id            string `json:"id,omitempty"`
	OrderId       string `json:"order_id"`
	CustomerPhone string `json:"customer_phone"`
}

type MessageDB = struct {
	Id             string `json:"id"`
	ConversationId string `json:"conversation_id"`
	Body           string `json:"body"`
	Direction      string `json:"direction"`
}

func NewMessageHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		LogError("invalid_method", fmt.Errorf("method %s not allowed", r.Method), map[string]any{
			"method": r.Method,
		})
		RespondWithError(w, http.StatusMethodNotAllowed, "Method not allowed", "INVALID_METHOD")
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		LogError("read_body", err, map[string]any{
			"content_length": r.ContentLength,
		})
		RespondWithError(w, http.StatusBadRequest, "Failed to read request body", "INVALID_REQUEST")
		return
	}
	defer r.Body.Close()

	var req NewMessageRequest
	if err := json.Unmarshal(body, &req); err != nil {
		LogError("parse_json", err, map[string]any{
			"body_length": len(body),
		})
		RespondWithError(w, http.StatusBadRequest, "Invalid request format", "INVALID_JSON")
		return
	}

	err = validateNewMessageRequest(req)

	if err != nil {
		LogError("validation_failed", err, map[string]any{})
		RespondWithError(w, http.StatusBadRequest, err.Error(), "VALIDATION_ERROR")
		return
	}

	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	if supabaseUrl == "" || supabaseKey == "" {
		LogError("config_missing", fmt.Errorf("database configuration missing"), map[string]any{
			"has_url": supabaseUrl != "",
			"has_key": supabaseKey != "",
		})
		RespondWithError(w, http.StatusInternalServerError, "Service temporarily unavailable", "CONFIG_ERROR")
		return
	}

	phoneNumber, err := getCustomerPhone(supabaseUrl, supabaseKey, req.OrderId)

	if err != nil {
		LogError("get_customer_phone", fmt.Errorf("error trying to find an order: %w", err), map[string]any{})
		RespondWithError(w, http.StatusInternalServerError, "We are experiencing errors", "SERVER_ERROR")
		return
	}

	conversation, err := getOrCreateConversation(supabaseUrl, supabaseKey, req.OrderId, phoneNumber)

	if err != nil {
		LogError("get_or_create_conversation", fmt.Errorf("error trying to find an order: %w", err), map[string]any{
			"order_id": req.OrderId
		})
		RespondWithError(w, http.StatusInternalServerError, "We are experiencing errors", "SERVER_ERROR")
		return
	}

	messageId, err := storeMessageInDb(supabaseUrl, supabaseKey, conversation.Id, strings.TrimSpace(req.Body))

	if err != nil {
		LogError("store_message_in_db", fmt.Errorf("error trying to find an order: %w", err), map[string]any{})
		RespondWithError(w, http.StatusInternalServerError, "We are experiencing errors", "SERVER_ERROR")
		return
	}

	err = sendMessage(messageId, conversation.Id, phoneNumber, req.Body)
	if err != nil {
		LogError("send_message", fmt.Errorf("error trying to find an order: %w", err), map[string]any{})
		RespondWithError(w, http.StatusInternalServerError, "We are experiencing errors", "SERVER_ERROR")
		return
	}

	RespondWithSuccess(w, "message sent successfully", map[string]any{
		"MessageId": messageId,
	})

}

func validateNewMessageRequest(req NewMessageRequest) error {

	trimmedBody := strings.TrimSpace(req.Body)
	if len(trimmedBody) == 0 {
		return fmt.Errorf("body is required")
	}

	trimmedOrderId := strings.TrimSpace(req.OrderId)
	if len(trimmedOrderId) == 0 {
		return fmt.Errorf("order id is required")
	}

	return nil
}

func getCustomerPhone(supabaseUrl, supabaseKey string, orderId string) (string, error) {
	url := fmt.Sprintf("%s/rest/v1/orders?id=eq.%s&select=id,customer_id", supabaseUrl, orderId)
	req, err := http.NewRequest("GET", url, nil)

	if err != nil {
		return "", fmt.Errorf("failed to create order request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return "", fmt.Errorf("failed to get order details for order: %s, with error: %w", orderId, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return "", fmt.Errorf("failed to read response for order details: %w", err)
	}

	var orders []struct {
		Id         string `json:"id"`
		CustomerId string `json:"customer_id"`
	}

	if err := json.Unmarshal(body, &orders); err != nil {
		return "", fmt.Errorf("failed to parse order with customer id response: %w", err)
	}

	if len(orders) == 0 {
		return "", fmt.Errorf("order not found for id %s", orderId)
	}

	orderWithCustomerId := orders[0]

	url = fmt.Sprintf("%s/rest/v1/customer_sms_consent_records?customer_id=eq.%s&select=phone_number,consent_given&order=created_at.desc&limit=1", supabaseUrl, orderWithCustomerId.CustomerId)
	req, err = http.NewRequest("GET", url, nil)

	if err != nil {
		return "", fmt.Errorf("failed to create consent request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err = client.Do(req)

	if err != nil {
		return "", fmt.Errorf("failed to fetch consent details for customer %s with error: %w", orderWithCustomerId.CustomerId, err)
	}
	defer resp.Body.Close()

	body, err = io.ReadAll(resp.Body)

	if err != nil {
		return "", fmt.Errorf("failed to read response order for consent details: %w", err)
	}

	var consentDetails []struct {
		PhoneNumber  string `json:"phone_number"`
		ConsentGiven bool   `json:"consent_given"`
	}

	if err := json.Unmarshal(body, &consentDetails); err != nil {
		return "", fmt.Errorf("failed to parse consent details response: %w", err)
	}

	if len(consentDetails) == 0 {
		return "", fmt.Errorf("consent details not found for customer %s", orderWithCustomerId.CustomerId)
	}

	consentDetailsForCustomer := consentDetails[0]

	if !consentDetailsForCustomer.ConsentGiven {
		return "", fmt.Errorf("customer has not given consent for text messages")
	}

	return consentDetailsForCustomer.PhoneNumber, nil
}

func getOrCreateConversation(supabaseUrl, supabaseKey string, orderId string, phoneNumber string) (*ConversationDB, error) {

	url := fmt.Sprintf("%s/rest/v1/conversations?order_id=eq.%s", supabaseUrl, orderId)

	req, err := http.NewRequest("GET", url, nil)

	if err != nil {
		return nil, fmt.Errorf("failed to create request for url %s with error: %w", url, err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")

	client := http.Client{}

	resp, err := client.Do(req)

	if err != nil {
		return nil, fmt.Errorf("failed to fetch conversation for order %s with error %w", orderId, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return nil, fmt.Errorf("failed to read response with error %w", err)
	}

	var conversations []ConversationDB

	if err := json.Unmarshal(body, &conversations); err != nil {
		return nil, fmt.Errorf("failed to parse response with error %w", err)
	}

	if len(conversations) > 0 {
		return &conversations[0], nil
	}

	newConversation := ConversationDB{
		OrderId:       orderId,
		CustomerPhone: phoneNumber,
	}

	url = fmt.Sprintf("%s/rest/v1/conversations", supabaseUrl)

	conversationJson, err := json.Marshal(newConversation)

	if err != nil {
		return nil, fmt.Errorf("failed to encode conversation json for order %s with error %w", orderId, err)
	}

	req, err = http.NewRequest("POST", url, bytes.NewBuffer(conversationJson))

	if err != nil {
		return nil, fmt.Errorf("failed to create request for url %s with error %w", url, err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation") // Add this!

	resp, err = client.Do(req)

	if err != nil {
		return nil, fmt.Errorf("failed to create a new conversation for order %s with error %w", orderId, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("failed to create conversation for order %s, check supabase logs for code %d", orderId, resp.StatusCode)
	}

	body, err = io.ReadAll(resp.Body)

	if err != nil {
		return nil, fmt.Errorf("failed to read response with error %w", err)
	}

	conversations = nil

	if err := json.Unmarshal(body, &conversations); err != nil {
		return nil, fmt.Errorf("failed to parse response when creating a conversation err: %w", err)
	}

	if len(conversations) == 0 {
		return nil, fmt.Errorf("no conversations returned after creating a conversation for order %s", orderId)
	}

	return &conversations[0], nil

}

func storeMessageInDb(supabaseUrl, supabaseKey string, conversationId string, messageBody string) (string, error) {

	message := MessageDB{
		ConversationId: strings.TrimSpace(conversationId),
		Body:           strings.TrimSpace(messageBody),
		Direction:      "outbound",
	}

	messageJson, err := json.Marshal(message)

	if err != nil {
		return "", fmt.Errorf("failed to parse message into json with error %w", err)
	}

	url := fmt.Sprintf("%s/rest/v1/messages", supabaseUrl)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(messageJson))

	if err != nil {
		return "", fmt.Errorf("failed to create request for url %s with error %w", url, err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	client := http.Client{}

	resp, err := client.Do(req)

	if err != nil {
		return "", fmt.Errorf("failed to create message with err %w", err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return "", fmt.Errorf("failed to create message with code %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return "", fmt.Errorf("failed to read response from url %s with error %w", url, err)
	}

	var createdMessages []MessageDB

	if err := json.Unmarshal(body, &createdMessages); err != nil {
		return "", fmt.Errorf("failed to parse created messages to json with err %w", err)
	}

	if len(createdMessages) == 0 {
		return "", fmt.Errorf("no messages returned on creation")
	}

	return createdMessages[0].Id, nil

}

func sendMessage(messageId, conversationId, customerPhone, body string) error {
	return enqueueUpstashMessage(messageId, conversationId, customerPhone, body)
}

func enqueueUpstashMessage(messageId, conversationId, customerPhone, messageBody string) error {
	payload := SmsQueuePayload{
		MessageId:      messageId,
		ConversationId: conversationId,
		CustomerPhone:  customerPhone,
		Body:           messageBody,
	}

	payloadJson, err := json.Marshal(payload)

	if err != nil {
		return fmt.Errorf("failed to encode message queue payload into json with err %w", err)
	}

	url := fmt.Sprintf("https://qstash.upstash.io/v2/publish/%s", "https://aliciapceramics.com/api/process-sms-queue")

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payloadJson))

	if err != nil {
		return fmt.Errorf("failed to create request for url %s with error %w", url, err)
	}

	qstashToken := os.Getenv("QSTASH_TOKEN")

	if qstashToken == "" {
		return fmt.Errorf("QSTASH_TOKEN environment variable not set")
	}

	req.Header.Set("Authorization:", fmt.Sprintf("Bearer %s", qstashToken))
	req.Header.Set("Content-type", "application/json")

	client := http.Client{}

	resp, err := client.Do(req)

	if err != nil {
		return fmt.Errorf("failed to request enqueueing a new message with error %w", err)
	}
	defer resp.Body.Close()

	_, err = io.ReadAll(resp.Body)

	if err != nil {
		return fmt.Errorf("failed to read response from qstash with err %w", err)
	}

	if resp.StatusCode != http.StatusAccepted {
		return fmt.Errorf("failed to enqueue message with id %s with status code %d", messageId, resp.StatusCode)
	}

	return nil

}
