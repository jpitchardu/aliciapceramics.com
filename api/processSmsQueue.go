package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/twilio/twilio-go"
	api "github.com/twilio/twilio-go/rest/api/v2010"
)

type SmsQueuePayload = struct {
	MessageId      string `json:"message_id"`
	ConversationId string `json:"conversation_id"`
	CustomerPhone  string `json:"customer_phone"`
	Body           string `json:"body"`
}

func SmsQueueMessageHandler(w http.ResponseWriter, r *http.Request) {
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

	var payload SmsQueuePayload

	if err := json.Unmarshal(body, &payload); err != nil {
		LogError("parse_sms_queue_payload", err, map[string]any{
			"content_length": r.ContentLength,
		})
		RespondWithError(w, http.StatusBadRequest, "Failed to parse payload", "INVALID_REQUEST")
		return
	}

	accountSid := os.Getenv("TWILIO_ACCOUNT_SID")
	authToken := os.Getenv("TWILIO_AUTH_TOKEN")
	fromPhone := os.Getenv("TWILIO_PHONE_NUMBER")

	if accountSid == "" || authToken == "" || fromPhone == "" {
		LogError("twilio_config_missing", fmt.Errorf("missing Twilio credentials"), map[string]any{})
		RespondWithError(w, http.StatusInternalServerError, "Twilio configuration missing", "CONFIG_ERROR")
		return
	}

	client := twilio.NewRestClient()

	params := &api.CreateMessageParams{}

	params.SetBody(payload.Body)
	params.SetTo(payload.CustomerPhone)
	params.SetFrom(fromPhone)

	resp, err := client.Api.CreateMessage(params)

	if err != nil {
		LogError("twilio_create_message", err, map[string]any{
			"mesage_id": payload.MessageId,
		})
		RespondWithError(w, http.StatusInternalServerError, "Failed to send message", "TWILIO_ERROR")
		return
	}

	if resp.ErrorCode != nil {
		LogError("twilio_send_message", err, map[string]any{
			"message_id":    payload.MessageId,
			"error_code":    *resp.ErrorCode,
			"error_message": *resp.ErrorMessage,
		})
		RespondWithError(w, http.StatusInternalServerError, "Failed to send message", "TWILIO_ERROR")
		return
	}

	err = updateMessageSidAndStatus(payload.MessageId, *resp.Sid, *resp.Status)

	if err != nil {
		LogError("update_message_with_twilio_response", err, map[string]any{
			"message_id":    payload.MessageId,
			"twilio_sid":    resp.Sid,
			"twilio_status": resp.Status,
		})
		RespondWithError(w, http.StatusInternalServerError, "Failed to update message", "INTERNAL_ERROR")
		return
	}

	RespondWithSuccess(w, "Message successfully sent", map[string]any{})

}

func updateMessageSidAndStatus(messageId, twilioSid, twilioStatus string) error {

	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	payload := struct {
		TwilioSid    string `json:"twilio_message_sid"`
		TwilioStatus string `json:"twilio_status"`
	}{
		TwilioSid:    twilioSid,
		TwilioStatus: twilioStatus,
	}

	payloadJson, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal order: %w", err)
	}

	url := fmt.Sprintf("%s/rest/v1/messages?id=eq.%s", supabaseUrl, messageId)
	req, err := http.NewRequest("	PUT", url, bytes.NewBuffer(payloadJson))

	if err != nil {
		return fmt.Errorf("failed to create update message request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to update message %s with twilio sid %s and status %s with error: %w", messageId, twilioSid, twilioStatus, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent {
		return fmt.Errorf("failed to update  message %s with twilio sid %s and status %s with error code %d", messageId, twilioSid, twilioStatus, resp.StatusCode)
	}

	return nil

}
