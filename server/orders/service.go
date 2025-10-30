package orders

import (
	"aliciapceramics/server/database"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
)

type IOrderService interface {
	GetOrdersWithDeadlines() (OrdersDTO, error)
	GetNonDeadlineOrders() (OrdersDTO, error)
	CreateOrder(payload CreateOrderDTO) (OrderDTO, error)
}

type OrderService struct {
}

func (s *OrderService) GetOrdersWithDeadlines() (OrdersDTO, error) {

	body, statusCode, err := database.MakeDBCall("GET", "orders?select=*,order_details(*)&due_date=not.is.null&status=neq.delivered&status.new.cancelled&order=due_date.asc", nil)

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

	body, statusCode, err := database.MakeDBCall("GET", "orders?select=*,order_details(*)&due_date=not.is.null&status=neq.delivered&status.new.cancelled&order=due_date.asc", nil)

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
