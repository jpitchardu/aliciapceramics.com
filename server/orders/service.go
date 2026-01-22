package orders

import (
	"aliciapceramics/server/database"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type IOrderService interface {
	GetOrdersWithDeadlines() (OrdersDTO, error)
	GetNonDeadlineOrders() (OrdersDTO, error)
	CreateOrder(payload CreateOrderDTO) (OrderDTO, error)
}

type OrderService struct {
}

func (s *OrderService) GetOrdersWithDeadlines() (OrdersDTO, error) {

	body, statusCode, err := database.MakeDBCall("GET", "orders?select=*,order_details(*)&due_date=not.is.null&status=neq.delivered&status=neq.cancelled&status=neq.completed&order=due_date.asc", nil)

	if err != nil {
		return OrdersDTO{}, fmt.Errorf("error in GetOrders: %w", err)
	}

	if statusCode != http.StatusOK {
		return OrdersDTO{}, fmt.Errorf("failed to fetch orders with status %d and response %s", statusCode, string(body))
	}

	var orders []orderRow

	err = json.Unmarshal(body, &orders)

	if err != nil {
		return OrdersDTO{}, fmt.Errorf("[GetOrdersWithDeadlines] failed to parse response into orders with error: %w response %s", err, string(body))
	}

	dto := OrdersDTO{
		Orders: []OrderDTO{},
	}

	for _, orderRow := range orders {

		orderDTO := OrderDTO{
			ID:           orderRow.ID,
			CustomerID:   orderRow.CustomerID,
			Type:         orderRow.Type,
			DueDate:      orderRow.DueDate,
			Timeline:     orderRow.Timeline,
			Status:       orderRow.Status,
			OrderDetails: []OrderDetailDTO{},
		}

		for _, orderDetailRow := range orderRow.OrderDetails {
			orderDTO.OrderDetails = append(orderDTO.OrderDetails, OrderDetailDTO{
				ID:                orderDetailRow.ID,
				Type:              orderDetailRow.Type,
				Size:              orderDetailRow.Size,
				Quantity:          orderDetailRow.Quantity,
				Description:       orderDetailRow.Description,
				Status:            orderDetailRow.Status,
				CompletedQuantity: orderDetailRow.CompletedQuantity,
			})
		}

		dto.Orders = append(dto.Orders, orderDTO)
	}

	return dto, nil
}

func (s *OrderService) GetNonDeadlineOrders() (OrdersDTO, error) {

	body, statusCode, err := database.MakeDBCall("GET", "orders?select=*,order_details(*)&due_date=not.is.null&status=neq.delivered&status=neq.cancelled&status=neq.completed&order=due_date.asc", nil)

	if err != nil {
		return OrdersDTO{}, fmt.Errorf("error in GetOrders: %w", err)
	}

	if statusCode != http.StatusOK {
		return OrdersDTO{}, fmt.Errorf("failed to fetch orders with status %d and response %s", statusCode, string(body))
	}

	var orders []orderRow

	err = json.Unmarshal(body, &orders)

	if err != nil {
		return OrdersDTO{}, fmt.Errorf("[GetNonDeadlineOrders] failed to parse response into orders with error: %w response %s", err, string(body))
	}

	dto := OrdersDTO{
		Orders: []OrderDTO{},
	}

	for _, orderRow := range orders {

		orderDTO := OrderDTO{
			ID:           orderRow.ID,
			CustomerID:   orderRow.CustomerID,
			Type:         orderRow.Type,
			DueDate:      orderRow.DueDate,
			Timeline:     orderRow.Timeline,
			Status:       orderRow.Status,
			OrderDetails: []OrderDetailDTO{},
		}

		for _, orderDetailRow := range orderRow.OrderDetails {
			orderDTO.OrderDetails = append(orderDTO.OrderDetails, OrderDetailDTO{
				ID:                orderDetailRow.ID,
				Type:              orderDetailRow.Type,
				Size:              orderDetailRow.Size,
				Quantity:          orderDetailRow.Quantity,
				Description:       orderDetailRow.Description,
				Status:            orderDetailRow.Status,
				CompletedQuantity: orderDetailRow.CompletedQuantity,
			})
		}

		dto.Orders = append(dto.Orders, orderDTO)
	}

	return dto, nil

}

func (s *OrderService) CreateOrder(payload CreateOrderDTO) (OrderDTO, error) {

	accessToken := uuid.New().String()

	orderToCreate := orderRow{
		CustomerID:            payload.CustomerID,
		Timeline:              payload.Timeline,
		Inspiration:           payload.Inspiration,
		SpecialConsiderations: payload.SpecialConsiderations,
		Consent:               payload.Consent,
		Status:                "pending",
		AccessToken:           accessToken,
	}

	orderJSON, err := json.Marshal(orderToCreate)

	if err != nil {
		return OrderDTO{}, fmt.Errorf("[CreateOrder] failed to marshal order: %w", err)
	}

	body, statusCode, err := database.MakeDBCall("POST", "orders", bytes.NewBuffer(orderJSON))

	if err != nil {
		return OrderDTO{}, fmt.Errorf("[CreateOrder] failed to create order, error: %w", err)
	}

	if statusCode != http.StatusCreated {
		return OrderDTO{}, fmt.Errorf("failed to create order: status %d", statusCode)
	}

	result := []orderRow{}

	if err := json.Unmarshal(body, &result); err != nil {
		return OrderDTO{}, fmt.Errorf("[CreateOrder] failed to parse response with error: %w, response: %s", err, string(body))
	}

	if len(result) == 0 {
		return OrderDTO{}, fmt.Errorf("[CreateOrder] create orders returned with empty, status code %d, response %s", statusCode, string(body))
	}

	orderCreated := result[0]

	dto := OrderDTO{
		ID:           orderCreated.ID,
		CustomerID:   orderCreated.CustomerID,
		Type:         orderCreated.Type,
		DueDate:      orderCreated.DueDate,
		Timeline:     orderCreated.Timeline,
		Status:       orderCreated.Status,
		OrderDetails: []OrderDetailDTO{},
	}

	for _, orderDetailRow := range orderCreated.OrderDetails {
		dto.OrderDetails = append(dto.OrderDetails, OrderDetailDTO{
			ID:                orderDetailRow.ID,
			Type:              orderDetailRow.Type,
			Size:              orderDetailRow.Size,
			Quantity:          orderDetailRow.Quantity,
			Description:       orderDetailRow.Description,
			Status:            orderDetailRow.Status,
			CompletedQuantity: orderDetailRow.CompletedQuantity,
		})
	}

	return dto, nil
}

func GetNextStatus(taskType string) (string, error) {
	statusMap := map[string]string{
		"task_build_base":    "build",
		"task_build_bowl":    "build",
		"task_trim":          "trim",
		"task_attach_handle": "attach",
		"task_attach_lid":    "attach",
		"task_bisque":        "bisque",
		"task_glaze":         "glaze",
		"task_fire":          "completed",
	}

	nextStatus, ok := statusMap[taskType]
	if !ok {
		return "", fmt.Errorf("unknown task type: %s", taskType)
	}

	return nextStatus, nil
}

type BulkCodeService struct {
	repository bulkCodeRepository
}

func NewBulkCodeService() *BulkCodeService {
	return &BulkCodeService{
		repository: &supabaseBulkCodeRepository{},
	}
}

func (s *BulkCodeService) ValidateCode(code string) (*BulkCodeDTO, error) {
	if code == "" {
		return nil, fmt.Errorf("code is required")
	}

	bulkCodes, err := s.repository.GetByCode(code)
	if err != nil {
		return nil, err
	}

	if len(bulkCodes) == 0 {
		return nil, fmt.Errorf("invalid code")
	}

	bulkCode := bulkCodes[0]

	if bulkCode.RedeemedAt != nil {
		return nil, fmt.Errorf("code has already been redeemed")
	}

	redeemedAt := ""
	if bulkCode.RedeemedAt != nil {
		redeemedAt = *bulkCode.RedeemedAt
	}

	return &BulkCodeDTO{
		ID:                     bulkCode.ID,
		Code:                   bulkCode.Code,
		Name:                   bulkCode.Name,
		EarliestCompletionDate: bulkCode.EarliestCompletionDate,
		RedeemedAt:             redeemedAt,
	}, nil
}

func (s *BulkCodeService) MarkAsRedeemed(bulkCodeID string) error {
	if bulkCodeID == "" {
		return fmt.Errorf("bulk code ID is required")
	}

	return s.repository.MarkAsRedeemed(bulkCodeID)
}

func CalculateOrderStatus(ctx context.Context, tx pgx.Tx, orderID string) (string, error) {
	rows, err := tx.Query(ctx, `
		SELECT status
		FROM order_details
		WHERE order_id = $1
	`, orderID)

	if err != nil {
		return "", fmt.Errorf("failed to query order details: %w", err)
	}
	defer rows.Close()

	var statuses []string
	for rows.Next() {
		var status string
		if err := rows.Scan(&status); err != nil {
			return "", fmt.Errorf("failed to scan status: %w", err)
		}
		statuses = append(statuses, status)
	}

	if err := rows.Err(); err != nil {
		return "", fmt.Errorf("error iterating rows: %w", err)
	}

	if len(statuses) == 0 {
		return "pending", nil
	}

	statusPriority := map[string]int{
		"pending":    0,
		"build":      1,
		"trim":       2,
		"attach":     3,
		"trim_final": 4,
		"bisque":     5,
		"glaze":      6,
		"fire":       7,
		"completed":  8,
	}

	statusToOrderStatus := map[string]string{
		"pending":    "pending",
		"build":      "building",
		"trim":       "trimming",
		"attach":     "building",
		"trim_final": "trimming",
		"bisque":     "bisque_firing",
		"glaze":      "glazing",
		"fire":       "glaze_firing",
		"completed":  "completed",
	}

	leastAdvancedStatus := "completed"
	minPriority := statusPriority["completed"]

	for _, status := range statuses {
		priority, exists := statusPriority[status]
		if !exists {
			priority = 0
		}

		if priority < minPriority {
			minPriority = priority
			leastAdvancedStatus = status
		}
	}

	orderStatus, exists := statusToOrderStatus[leastAdvancedStatus]
	if !exists {
		return "pending", nil
	}

	return orderStatus, nil
}
