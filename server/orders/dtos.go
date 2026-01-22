package orders

import "time"

type OrderDetailDTO struct {
	ID                string
	OrderID           string
	Type              string
	Size              *string
	Quantity          int
	Description       string
	Status            string
	CompletedQuantity int
	StatusChangedAt   *time.Time
	CreatedAt         *time.Time
}

type OrderDTO struct {
	ID           string
	CustomerID   string
	Type         string
	Timeline     string
	Status       string
	DueDate      *time.Time
	OrderDetails []OrderDetailDTO
}

type OrdersDTO struct {
	Orders []OrderDTO
}

type CreateOrderDetailDTO struct {
	Type        string
	Size        *string
	Quantity    int
	Description string
}

type CreateOrderDTO struct {
	CustomerID            string
	PieceDetails          []CreateOrderDetailDTO
	Timeline              string
	Inspiration           string
	SpecialConsiderations string
	Consent               bool
}

type UpdateOrderDTO struct {
}

type CancelOrderDTO struct {
}

type BulkCodeDTO struct {
	ID                      string
	Code                    string
	Name                    string
	EarliestCompletionDate  string
	RedeemedAt              string
}

type ValidateBulkCodeDTO struct {
	Code string
}
