package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"time"

	"github.com/google/uuid"
	"github.com/supabase-community/supabase-go"
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
	ID                    string    `json:"id,omitempty"`
	CustomerID            string    `json:"customer_id"`
	Timeline              time.Time `json:"timeline"`
	Inspiration           string    `json:"inspiration"`
	SpecialConsiderations string    `json:"special_considerations"`
	Consent               bool      `json:"consent"`
	Status                string    `json:"status"`
	AccessToken           string    `json:"access_token"`
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

	client, err := supabase.NewClient(supabaseUrl, supabaseKey, &supabase.ClientOptions{})

	if err != nil {
		http.Error(w, "failed to initialize database client: "+err.Error(), http.StatusInternalServerError)
		return
	}

	customerId, err := upsertCustomer(client, req.Order.Client)
	if err != nil {
		http.Error(w, "upsert customer failed: "+err.Error(), http.StatusInternalServerError)
		return
	}
	orderId, err := createOrder(client, customerId, req.Order)
	if err != nil {
		http.Error(w, "create order failed: "+err.Error(), http.StatusInternalServerError)
		return
	}
	err = createOrderDetails(client, orderId, req.Order.PieceDetails)
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

func upsertCustomer(client *supabase.Client, customer Customer) (string, error) {

	data, _, err := client.From("customers").Select("id", "", false).Eq("email", customer.Email).Execute()

	if err != nil {
		return "", fmt.Errorf("failed to query customer: %w", err)
	}

	var existingCustomers []CustomerDB
	if len(data) > 0 {
		err = json.Unmarshal(data, &existingCustomers)
		if err != nil {
			return "", fmt.Errorf("failed to parse customer data: %w", err)
		}
	}

	if len(existingCustomers) > 0 {
		return existingCustomers[0].ID, nil
	}

	newCustomer := CustomerDB{
		Name:  customer.Name,
		Email: customer.Email,
		Phone: customer.Phone,
	}

	customerJSON, err := json.Marshal(newCustomer)

	if err != nil {
		return "", fmt.Errorf("failed to marshal customer: %w", err)
	}

	data, _, err = client.From("customers").Insert(string(customerJSON), false, "", "*", "").Execute()

	if err != nil {
		return "", fmt.Errorf("failed to create customer: %w", err)
	}

	var result []CustomerDB
	err = json.Unmarshal(data, &result)

	if err != nil {
		return "", fmt.Errorf("failed to parse created customer: %w", err)
	}

	if len(result) == 0 {
		return "", fmt.Errorf("no customer returned after insert")
	}

	return result[0].ID, nil

}

func createOrder(client *supabase.Client, customerID string, order Order) (string, error) {

	accessToken := uuid.New().String()

	timeline, err := time.Parse("2006-01-02", order.Timeline)

	if err != nil {
		return "", fmt.Errorf("cannot parse timeline: %w", err)
	}

	orderDB := OrderDB{
		CustomerID:            customerID,
		Timeline:              timeline,
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

	data, _, err := client.From("orders").Insert(string(orderJSON), false, "", "", "").Execute()
	if err != nil {
		return "", fmt.Errorf("failed to create order: %w", err)
	}

	var result []OrderDB
	err = json.Unmarshal(data, &result)
	if err != nil {
		return "", fmt.Errorf("failed to parse created order: %w", err)
	}

	if len(result) == 0 {
		return "", fmt.Errorf("no order returned after insert")
	}

	return result[0].ID, nil
}

func createOrderDetails(client *supabase.Client, orderID string, pieceDetails []PieceDetail) error {

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

	_, _, err = client.From("order_details").Insert(string(orderDetailsJSON), false, "", "", "").Execute()

	if err != nil {
		return fmt.Errorf("failed to create order details: %w", err)
	}

	return nil

}
