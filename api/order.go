package handler

import (
	"aliciapceramics/server/orders"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
)

type Customer struct {
	Name                     string  `json:"name"`
	Email                    string  `json:"email"`
	Phone                    string  `json:"phone"`
	CommunicationPreferences *string `json:"communicationPreferences,omitempty"`
}

type PieceDetail struct {
	Type        string  `json:"type"`
	Size        *string `json:"size,omitempty"`
	Quantity    int     `json:"quantity"`
	Description string  `json:"description"`
}

type Order struct {
	Client                Customer      `json:"client"`
	PieceDetails          []PieceDetail `json:"pieceDetails"`
	Timeline              string        `json:"timeline"`
	Inspiration           string        `json:"inspiration"`
	SpecialConsiderations string        `json:"specialConsiderations"`
	Consent               bool          `json:"consent"`
}

type OrderRequest struct {
	Order Order `json:"order"`
}

type CustomerDB struct {
	ID                       string  `json:"id,omitempty"`
	Name                     string  `json:"name"`
	Email                    string  `json:"email"`
	Phone                    string  `json:"phone"`
	CommunicationPreferences *string `json:"communication_preferences,omitempty"`
}

type OrderDB struct {
	ID                    string `json:"id,omitempty"`
	CustomerID            string `json:"customer_id"`
	Timeline              string `json:"timeline"`
	Inspiration           string `json:"inspiration"`
	SpecialConsiderations string `json:"special_considerations"`
	Consent               bool   `json:"consent"`
	Status                string `json:"status"`
	AccessToken           string `json:"access_token"`
}

type OrderDetailDB struct {
	ID          string  `json:"id,omitempty"`
	OrderID     string  `json:"order_id"`
	Type        string  `json:"type"`
	Size        *string `json:"size,omitempty"`
	Quantity    int     `json:"quantity"`
	Description string  `json:"description"`
}

type CustomerSMSConsentRecord struct {
	ID               string  `json:"id,omitempty"`
	CustomerID       string  `json:"customer_id"`
	PhoneNumber      string  `json:"phone_number"`
	ConsentType      string  `json:"consent_type"`
	ConsentGiven     bool    `json:"consent_given"`
	ConsentLanguage  string  `json:"consent_language"`
	ConsentMethod    string  `json:"consent_method"`
	RevocationMethod *string `json:"revocation_method,omitempty"`
	IPAddress        *string `json:"ip_address,omitempty"`
	UserAgent        *string `json:"user_agent,omitempty"`
}

type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Code    string `json:"code"`
}

type SuccessResponse struct {
	Success bool           `json:"success"`
	Message string         `json:"message"`
	Data    map[string]any `json:"data,omitempty"`
}

func LogError(operation string, err error, context map[string]any) {
	safeContext := make(map[string]any)
	for k, v := range context {
		if k != "email" && k != "phone" && k != "name" && k != "customerName" {
			safeContext[k] = v
		} else {
			if str, ok := v.(string); ok {
				safeContext[k+"_length"] = len(str)
				safeContext[k+"_has_value"] = str != ""
			}
		}
	}

	log.Printf("ERROR [%s]: %v | Context: %+v", operation, err, safeContext)
}

func LogInfo(logBody string, context map[string]any) {
	safeContext := make(map[string]any)
	for k, v := range context {
		if k != "email" && k != "phone" && k != "name" && k != "customerName" {
			safeContext[k] = v
		} else {
			if str, ok := v.(string); ok {
				safeContext[k+"_length"] = len(str)
				safeContext[k+"_has_value"] = str != ""
			}
		}
	}

	log.Printf("LOG [%s] | Context: %+v", logBody, safeContext)

}

func RespondWithError(w http.ResponseWriter, statusCode int, message string, code string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(ErrorResponse{
		Success: false,
		Error:   message,
		Code:    code,
	})
}

func RespondWithSuccess(w http.ResponseWriter, message string, data map[string]any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(SuccessResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func OrderHandler(w http.ResponseWriter, r *http.Request) {
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

	var req OrderRequest
	if err := json.Unmarshal(body, &req); err != nil {
		LogError("parse_json", err, map[string]any{
			"body_length": len(body),
		})
		RespondWithError(w, http.StatusBadRequest, "Invalid request format", "INVALID_JSON")
		return
	}

	// Validate the order data
	if err := validateOrder(req.Order); err != nil {
		LogError("validation_failed", err, map[string]any{
			"piece_count": len(req.Order.PieceDetails),
			"has_consent": req.Order.Consent,
		})
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

	customerId, err := upsertCustomer(supabaseUrl, supabaseKey, req.Order.Client)
	if err != nil {
		LogError("upsert_customer", err, map[string]any{
			"email": req.Order.Client.Email,
			"name":  req.Order.Client.Name,
		})
		RespondWithError(w, http.StatusInternalServerError, "Failed to process customer information", "CUSTOMER_ERROR")
		return
	}

	orderId, err := createOrder(customerId, req.Order)
	if err != nil {
		LogError("create_order", err, map[string]any{
			"customer_id": customerId,
			"piece_count": len(req.Order.PieceDetails),
		})
		RespondWithError(w, http.StatusInternalServerError, "Failed to create order", "ORDER_ERROR")
		return
	}

	err = createOrderDetails(supabaseUrl, supabaseKey, orderId, req.Order.PieceDetails)
	if err != nil {
		LogError("create_order_details", err, map[string]any{
			"order_id":     orderId,
			"detail_count": len(req.Order.PieceDetails),
		})
		RespondWithError(w, http.StatusInternalServerError, "Failed to save order details", "ORDER_DETAILS_ERROR")
		return
	}

	// Create SMS consent record for TCPA compliance if SMS was selected
	if req.Order.Client.CommunicationPreferences != nil && *req.Order.Client.CommunicationPreferences == "sms" {
		clientIP := getClientIP(r)
		userAgent := r.Header.Get("User-Agent")
		err = createSMSConsentRecord(supabaseUrl, supabaseKey, customerId, req.Order.Client, clientIP, userAgent)
		if err != nil {
			LogError("create_sms_consent_record", err, map[string]any{
				"customer_id": customerId,
			})
			// Don't fail the order creation, but log the error
		}
	}

	log.Printf("INFO: Order created successfully | order_id: %s | customer_id: %s | piece_count: %d",
		orderId, customerId, len(req.Order.PieceDetails))

	RespondWithSuccess(w, "Order received successfully", map[string]any{
		"pieceCount": len(req.Order.PieceDetails),
		"orderId":    orderId,
	})
}

func validateOrder(order Order) error {
	// Client validation
	if strings.TrimSpace(order.Client.Name) == "" {
		return fmt.Errorf("customer name is required")
	}
	if strings.TrimSpace(order.Client.Email) == "" {
		return fmt.Errorf("customer email is required")
	}
	if !strings.Contains(order.Client.Email, "@") {
		return fmt.Errorf("customer email format is invalid")
	}

	if !strings.HasPrefix(order.Client.Phone, "+1") {
		return fmt.Errorf("phone number must have the US country code")
	}

	phoneDigits := strings.TrimPrefix(order.Client.Phone, "+1")

	if len(phoneDigits) != 10 {
		return fmt.Errorf("phone number must be a valid US phone number")
	}

	// Piece details validation
	if len(order.PieceDetails) == 0 {
		return fmt.Errorf("at least one piece detail is required")
	}

	for i, piece := range order.PieceDetails {
		if strings.TrimSpace(piece.Type) == "" {
			return fmt.Errorf("piece type is required for item %d", i+1)
		}
		if piece.Quantity < 1 {
			return fmt.Errorf("piece quantity must be at least 1 for item %d", i+1)
		}
		if piece.Quantity > 50 { // reasonable upper limit
			return fmt.Errorf("piece quantity cannot exceed 50 for item %d", i+1)
		}
	}

	// Timeline validation
	if strings.TrimSpace(order.Timeline) == "" {
		return fmt.Errorf("timeline is required")
	}

	// Consent validation
	if !order.Consent {
		return fmt.Errorf("consent is required")
	}

	return nil
}

func upsertCustomer(supabaseUrl, supabaseKey string, customer Customer) (string, error) {
	// First, check if customer already exists
	url := fmt.Sprintf("%s/rest/v1/customers?email=eq.%s&select=id", supabaseUrl, customer.Email)

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
		return "", fmt.Errorf("failed to query customer: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	var existingCustomers []CustomerDB
	if err := json.Unmarshal(body, &existingCustomers); err != nil {
		return "", fmt.Errorf("failed to parse customer data: %w", err)
	}

	if len(existingCustomers) > 0 {
		return existingCustomers[0].ID, nil
	}

	// Customer doesn't exist, create new one
	newCustomer := CustomerDB{
		Name:                     customer.Name,
		Email:                    customer.Email,
		Phone:                    customer.Phone,
		CommunicationPreferences: customer.CommunicationPreferences,
	}

	customerJSON, err := json.Marshal(newCustomer)
	if err != nil {
		return "", fmt.Errorf("failed to marshal customer: %w", err)
	}

	// Insert new customer
	url = fmt.Sprintf("%s/rest/v1/customers", supabaseUrl)
	req, err = http.NewRequest("POST", url, bytes.NewBuffer(customerJSON))
	if err != nil {
		return "", fmt.Errorf("failed to create insert request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey) //
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	resp, err = client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to create customer: %w", err)
	}
	defer resp.Body.Close()

	body, err = io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read insert response: %w", err)
	}

	if resp.StatusCode != http.StatusCreated {
		return "", fmt.Errorf("failed to create customer: status %d", resp.StatusCode)
	}

	var result []CustomerDB
	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("failed to parse created customer: %w", err)
	}

	if len(result) == 0 {
		return "", fmt.Errorf("no customer returned after insert")
	}

	return result[0].ID, nil
}

func createOrder(customerID string, order Order) (string, error) {

	createOrderDTO := orders.CreateOrderDTO{
		CustomerID:            customerID,
		Timeline:              order.Timeline,
		Inspiration:           order.Inspiration,
		SpecialConsiderations: order.SpecialConsiderations,
		Consent:               order.Consent,
		PieceDetails:          []orders.CreateOrderDetailDTO{},
	}

	for _, detail := range order.PieceDetails {
		createOrderDTO.PieceDetails = append(createOrderDTO.PieceDetails, orders.CreateOrderDetailDTO{
			Type:        detail.Type,
			Size:        detail.Size,
			Quantity:    detail.Quantity,
			Description: detail.Description,
		})
	}

	result, err := orders.CreateOrder(createOrderDTO)

	if err != nil {
		return "", fmt.Errorf("[NewOrderHandler] err %w", err)
	}

	return result.ID, nil
}

func createOrderDetails(supabaseUrl, supabaseKey, orderID string, pieceDetails []PieceDetail) error {
	orderDetailDBs := []OrderDetailDB{}

	for _, detail := range pieceDetails {
		orderDetailDBs = append(orderDetailDBs, OrderDetailDB{
			OrderID:     orderID,
			Type:        detail.Type,
			Size:        detail.Size,
			Quantity:    detail.Quantity,
			Description: detail.Description,
		})
	}

	if len(orderDetailDBs) <= 0 {
		return fmt.Errorf("no order details to insert")
	}

	orderDetailsJSON, err := json.Marshal(orderDetailDBs)
	if err != nil {
		return fmt.Errorf("failed to marshal order details: %w", err)
	}

	url := fmt.Sprintf("%s/rest/v1/order_details", supabaseUrl)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(orderDetailsJSON))
	if err != nil {
		return fmt.Errorf("failed to create order details request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to create order details: %w", err)
	}
	defer resp.Body.Close()

	_, err = io.ReadAll(resp.Body)

	if err != nil {
		return fmt.Errorf("failed to read order details response: %w", err)
	}

	if resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("failed to create order details: status %d", resp.StatusCode)
	}

	return nil
}

func getClientIP(r *http.Request) string {
	if xForwardedFor := r.Header.Get("X-Forwarded-For"); xForwardedFor != "" {
		if ips := strings.Split(xForwardedFor, ","); len(ips) > 0 {
			return strings.TrimSpace(ips[0])
		}
	}

	if xRealIP := r.Header.Get("X-Real-IP"); xRealIP != "" {
		return xRealIP
	}

	if ip, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
		return ip
	}

	return r.RemoteAddr
}

func createSMSConsentRecord(supabaseUrl, supabaseKey, customerID string, customer Customer, ipAddress, userAgent string) error {
	var ipPtr, userAgentPtr *string
	if ipAddress != "" {
		ipPtr = &ipAddress
	}
	if userAgent != "" {
		userAgentPtr = &userAgent
	}

	consentRecord := CustomerSMSConsentRecord{
		CustomerID:      customerID,
		PhoneNumber:     customer.Phone,
		ConsentType:     "sms_granted",
		ConsentGiven:    true,
		ConsentLanguage: "I want to receive automated SMS updates from Alicia P Ceramics. Msg&data rates may apply.",
		ConsentMethod:   "web_form",
		IPAddress:       ipPtr,
		UserAgent:       userAgentPtr,
	}

	recordJSON, err := json.Marshal(consentRecord)
	if err != nil {
		return fmt.Errorf("failed to marshal consent record: %w", err)
	}

	url := fmt.Sprintf("%s/rest/v1/customer_sms_consent_records", supabaseUrl)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(recordJSON))
	if err != nil {
		return fmt.Errorf("failed to create consent record request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to create consent record: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to create consent record: status %d, body: %s", resp.StatusCode, string(body))
	}

	return nil
}
