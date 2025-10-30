package orders

import "time"

type orderRow struct {
	ID                    string           `json:"id,omitempty"`
	CustomerID            string           `json:"customer_id"`
	Type                  string           `json:"type"`
	Timeline              string           `json:"timeline"`
	Inspiration           string           `json:"inspiration"`
	SpecialConsiderations string           `json:"special_considerations"`
	Consent               bool             `json:"consent"`
	AccessToken           string           `json:"access_token"`
	Status                string           `json:"status"`
	DueDate               *time.Time       `json:"due_date"`
	OrderDetails          []orderDetailRow `json:"order_details"`
	StatusChangedAt       *time.Time       `json:"status_changed_at,omitempty"`
	CreatedAt             *time.Time       `json:"created_at,omitempty"`
	UpdatedAt             *time.Time       `json:"updated_at,omitempty"`
}

type orderDetailRow struct {
	ID                string     `json:"id,omitempty"`
	OrderID           string     `json:"order_id"`
	Type              string     `json:"type"`
	Size              *string    `json:"size,omitempty"`
	Quantity          int        `json:"quantity"`
	Description       string     `json:"description"`
	Status            string     `json:"status"`
	CompletedQuantity int        `json:"completed_quantity"`
	StatusChangedAt   *time.Time `json:"status_changed_at,omitempty"`
	CreatedAt         *time.Time `json:"created_at,omitempty"`
}
