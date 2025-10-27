package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CompleteTaskResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(CompleteTaskResponse{
			Success: false,
			Message: "Method not allowed",
		})
		return
	}

	taskID := r.URL.Query().Get("id")
	if taskID == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(CompleteTaskResponse{
			Success: false,
			Message: "Task ID is required",
		})
		return
	}

	dbURL := os.Getenv("SUPABASE_DB_URL")
	if dbURL == "" {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(CompleteTaskResponse{
			Success: false,
			Message: "Database configuration error",
		})
		return
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(CompleteTaskResponse{
			Success: false,
			Message: "Failed to connect to database",
		})
		return
	}
	defer pool.Close()

	if err := completeTask(ctx, pool, taskID); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(CompleteTaskResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(CompleteTaskResponse{
		Success: true,
		Message: "Task completed successfully",
	})
}

func completeTask(ctx context.Context, db *pgxpool.Pool, taskID string) error {
	tx, err := db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var task struct {
		ID            string
		OrderDetailID string
		TaskType      string
		Quantity      int
		Status        string
	}

	err = tx.QueryRow(ctx, `
		SELECT id, order_detail_id, task_type, quantity, status
		FROM tasks
		WHERE id = $1
	`, taskID).Scan(&task.ID, &task.OrderDetailID, &task.TaskType, &task.Quantity, &task.Status)

	if err != nil {
		if err == pgx.ErrNoRows {
			return fmt.Errorf("task not found: %s", taskID)
		}
		return fmt.Errorf("failed to fetch task: %w", err)
	}

	if task.Status == "completed" {
		return fmt.Errorf("task %s is already completed", taskID)
	}

	completedAt := time.Now()

	_, err = tx.Exec(ctx, `
		UPDATE tasks
		SET status = 'completed', completed_at = $1, updated_at = $1
		WHERE id = $2
	`, completedAt, taskID)

	if err != nil {
		return fmt.Errorf("failed to update task status: %w", err)
	}

	var orderDetail struct {
		ID                string
		OrderID           string
		Quantity          int
		Status            string
		CompletedQuantity int
	}

	err = tx.QueryRow(ctx, `
		SELECT id, order_id, quantity, status, completed_quantity
		FROM order_details
		WHERE id = $1
	`, task.OrderDetailID).Scan(
		&orderDetail.ID,
		&orderDetail.OrderID,
		&orderDetail.Quantity,
		&orderDetail.Status,
		&orderDetail.CompletedQuantity,
	)

	if err != nil {
		return fmt.Errorf("failed to fetch order detail: %w", err)
	}

	newCompletedQuantity := orderDetail.CompletedQuantity + task.Quantity

	_, err = tx.Exec(ctx, `
		UPDATE order_details
		SET completed_quantity = $1
		WHERE id = $2
	`, newCompletedQuantity, orderDetail.ID)

	if err != nil {
		return fmt.Errorf("failed to update order detail completed quantity: %w", err)
	}

	if newCompletedQuantity >= orderDetail.Quantity {
		nextStatus, err := getNextStatus(task.TaskType)
		if err != nil {
			return fmt.Errorf("failed to determine next status: %w", err)
		}

		_, err = tx.Exec(ctx, `
			UPDATE order_details
			SET status = $1, completed_quantity = 0, status_changed_at = $2
			WHERE id = $3
		`, nextStatus, completedAt, orderDetail.ID)

		if err != nil {
			return fmt.Errorf("failed to update order detail status: %w", err)
		}
	}

	orderStatus, err := calculateOrderStatus(ctx, tx, orderDetail.OrderID)
	if err != nil {
		return fmt.Errorf("failed to calculate order status: %w", err)
	}

	_, err = tx.Exec(ctx, `
		UPDATE orders
		SET status = $1, status_updated_at = $2, updated_at = $2
		WHERE id = $3
	`, orderStatus, completedAt, orderDetail.OrderID)

	if err != nil {
		return fmt.Errorf("failed to update order status: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func getNextStatus(taskType string) (string, error) {
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

func calculateOrderStatus(ctx context.Context, tx pgx.Tx, orderID string) (string, error) {
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

	allCompleted := true
	anyInProgress := false

	for _, status := range statuses {
		if status != "completed" {
			allCompleted = false
		}
		if status != "pending" && status != "completed" {
			anyInProgress = true
		}
	}

	if allCompleted {
		return "completed", nil
	}

	if anyInProgress {
		return "in_progress", nil
	}

	return "confirmed", nil
}
