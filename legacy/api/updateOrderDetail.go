package handler

import (
	"aliciapceramics/server/orders"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UpdateOrderDetailRequest struct {
	OrderDetailID     string `json:"orderDetailId"`
	Status            string `json:"status,omitempty"`
	CompletedQuantity *int   `json:"completedQuantity,omitempty"`
}

type UpdateOrderDetailResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func UpdateOrderDetailHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(UpdateOrderDetailResponse{
			Success: false,
			Message: "Method not allowed",
		})
		return
	}

	var req UpdateOrderDetailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(UpdateOrderDetailResponse{
			Success: false,
			Message: "Invalid request body",
		})
		return
	}

	if req.OrderDetailID == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(UpdateOrderDetailResponse{
			Success: false,
			Message: "Order detail ID is required",
		})
		return
	}

	dbURL := os.Getenv("SUPABASE_DB_URL")
	if dbURL == "" {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(UpdateOrderDetailResponse{
			Success: false,
			Message: "Database configuration error",
		})
		return
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(UpdateOrderDetailResponse{
			Success: false,
			Message: "Failed to connect to database",
		})
		return
	}
	defer pool.Close()

	if err := updateOrderDetail(ctx, pool, req); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(UpdateOrderDetailResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(UpdateOrderDetailResponse{
		Success: true,
		Message: "Order detail updated successfully",
	})
}

func updateOrderDetail(ctx context.Context, db *pgxpool.Pool, req UpdateOrderDetailRequest) error {
	tx, err := db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var orderDetail struct {
		ID      string
		OrderID string
	}

	err = tx.QueryRow(ctx, `
		SELECT id, order_id
		FROM order_details
		WHERE id = $1
	`, req.OrderDetailID).Scan(&orderDetail.ID, &orderDetail.OrderID)

	if err != nil {
		return fmt.Errorf("failed to fetch order detail: %w", err)
	}

	updates := make(map[string]interface{})
	updateQuery := "UPDATE order_details SET "
	args := []interface{}{}
	argCount := 1

	if req.Status != "" {
		updates["status"] = req.Status
		updates["status_changed_at"] = time.Now()
		updateQuery += fmt.Sprintf("status = $%d, status_changed_at = $%d, ", argCount, argCount+1)
		args = append(args, req.Status, time.Now())
		argCount += 2
	}

	if req.CompletedQuantity != nil {
		updates["completed_quantity"] = *req.CompletedQuantity
		updateQuery += fmt.Sprintf("completed_quantity = $%d, ", argCount)
		args = append(args, *req.CompletedQuantity)
		argCount++
	}

	if len(updates) == 0 {
		return fmt.Errorf("no fields to update")
	}

	updateQuery = updateQuery[:len(updateQuery)-2]
	updateQuery += fmt.Sprintf(" WHERE id = $%d", argCount)
	args = append(args, req.OrderDetailID)

	_, err = tx.Exec(ctx, updateQuery, args...)
	if err != nil {
		return fmt.Errorf("failed to update order detail: %w", err)
	}

	orderStatus, err := orders.CalculateOrderStatus(ctx, tx, orderDetail.OrderID)
	if err != nil {
		return fmt.Errorf("failed to calculate order status: %w", err)
	}

	now := time.Now()
	_, err = tx.Exec(ctx, `
		UPDATE orders
		SET status = $1, status_updated_at = $2, updated_at = $2
		WHERE id = $3
	`, orderStatus, now, orderDetail.OrderID)

	if err != nil {
		return fmt.Errorf("failed to update order status: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}
