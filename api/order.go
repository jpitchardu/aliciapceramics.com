package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/google/uuid"
)

type Customer struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
}

type PieceDetail struct {
	Type        string `json:"type"`
	Size        *int   `json:"size,omitempty"`
	Quantity    int    `json:"quantity"`
	Description string `json:"description"`
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
	ID    string `json:"id,omitempty"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
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
	ID          string `json:"id,omitempty"`
	OrderID     string `json:"order_id"`
	Type        string `json:"type"`
	Size        *int   `json:"size,omitempty"`
	Quantity    int    `json:"quantity"`
	Description string `json:"description"`
}

func Handler(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)

	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var req OrderRequest
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	if supabaseUrl == "" || supabaseKey == "" {
		http.Error(w, "Db config missing", http.StatusInternalServerError)
		return
	}

	customerId, err := upsertCustomer(supabaseUrl, supabaseKey, req.Order.Client)
	if err != nil {
		http.Error(w, "upsert customer failed: "+err.Error(), http.StatusInternalServerError)
		return
	}
	orderId, err := createOrder(supabaseUrl, supabaseKey, customerId, req.Order)
	if err != nil {
		http.Error(w, "create order failed: "+err.Error(), http.StatusInternalServerError)
		return
	}
	err = createOrderDetails(supabaseUrl, supabaseKey, orderId, req.Order.PieceDetails)
	if err != nil {
		http.Error(w, "create order details failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// For now, just log what we received and return success
	fmt.Printf("Received order: %+v\n", req.Order)

	response := map[string]interface{}{
		"success": true,
		"message": "Order received",
		"data": map[string]string{
			"customerName": req.Order.Client.Name,
			"pieceCount":   fmt.Sprintf("%d", len(req.Order.PieceDetails)),
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(response)
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
		Name:  customer.Name,
		Email: customer.Email,
		Phone: customer.Phone,
	}

	customerJSON, err := json.Marshal(newCustomer)
	if err != nil {
		return "", fmt.Errorf("failed to marshal customer: %w", err)
	}

	fmt.Printf("Creating new customer: %s\n", customerJSON)

	// Insert new customer
	url = fmt.Sprintf("%s/rest/v1/customers", supabaseUrl)
	req, err = http.NewRequest("POST", url, bytes.NewBuffer(customerJSON))
	if err != nil {
		return "", fmt.Errorf("failed to create insert request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
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

	fmt.Printf("Insert response: %s\n", string(body))

	if resp.StatusCode != http.StatusCreated {
		return "", fmt.Errorf("failed to create customer: status %d, body: %s", resp.StatusCode, string(body))
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

func createOrder(supabaseUrl, supabaseKey, customerID string, order Order) (string, error) {
	accessToken := uuid.New().String()

	orderDB := OrderDB{
		CustomerID:            customerID,
		Timeline:              order.Timeline,
		Inspiration:           order.Inspiration,
		SpecialConsiderations: order.SpecialConsiderations,
		Consent:               order.Consent,
		Status:                "pending",
		AccessToken:           accessToken,
	}

	orderJSON, err := json.Marshal(orderDB)
	if err != nil {
		return "", fmt.Errorf("failed to marshal order: %w", err)
	}

	fmt.Printf("Creating order: %s\n", orderJSON)

	url := fmt.Sprintf("%s/rest/v1/orders", supabaseUrl)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(orderJSON))
	if err != nil {
		return "", fmt.Errorf("failed to create order request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to create order: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read order response: %w", err)
	}

	if resp.StatusCode != http.StatusCreated {
		return "", fmt.Errorf("failed to create order: status %d, body: %s", resp.StatusCode, string(body))
	}

	var result []OrderDB
	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("failed to parse created order: %w", err)
	}

	if len(result) == 0 {
		return "", fmt.Errorf("no order returned after insert")
	}

	return result[0].ID, nil
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

	fmt.Printf("Creating order details: %s\n", orderDetailsJSON)

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

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read order details response: %w", err)
	}

	if resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("failed to create order details: status %d, body: %s", resp.StatusCode, string(body))
	}

	return nil
}
