package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

type NewMessageRequest = struct {
	Body    string `json:body`
	OrderId string `json:orderId`
}

type ConversationDB = struct {
	Id            string `json:id`
	OrderId       string `json:order_id`
	CustomerPhone string `json:customer_phone`
}

type MessageDB = struct {
	Id             *string `json:id`
	ConversationId string  `json:conversation_id`
	Body           string  `json:body`
	Direction      string  `json:direction`
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
	}

	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	if supabaseUrl == "" || supabaseKey == "" {
		LogError("config_missing", fmt.Errorf("database configuration missing"), map[string]any{
			"has_url": supabaseUrl != "",
			"has_key": supabaseKey != "",
		})
		RespondWithError(w, http.StatusInternalServerError, "Service temporarily unavailable", "CONFIG_ERROR")

	}

	conversation, err := getOrCreateConversation(supabaseUrl, supabaseKey, req.OrderId)

	if err != nil {
		LogError("get_order_details", fmt.Errorf("error trying to find an order: %w", err), map[string]any{})
	}

	_, err = storeMessageInDb(supabaseUrl, supabaseKey, conversation.Id, strings.TrimSpace(req.Body))

	phoneNumber, err := getCustomerPhone(supabaseUrl, supabaseKey, req.OrderId)

	_, err = sendMessage(phoneNumber, req.Body)

}

func getCustomerPhone(supabaseUrl, supabaseKey string, orderId string) (string, error) {

}

func getOrCreateConversation(supabaseUrl, supabaseKey string, orderId string) (ConversationDB, error) {

}

func storeMessageInDb(supabaseUrl, supabaseKey string, conversationId string, body string) (string, error) {

	_ = MessageDB{
		ConversationId: strings.TrimSpace(conversationId),
		Body:           strings.TrimSpace(body),
		Direction:      "inbound",
	}
}

func sendMessage(customerPhone string, body string) (string, error) {

}
