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

type SyncOrderStatusesResponse struct {
	Success       bool   `json:"success"`
	Message       string `json:"message"`
	OrdersUpdated int    `json:"ordersUpdated"`
}

func SyncOrderStatusesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(SyncOrderStatusesResponse{
			Success: false,
			Message: "Method not allowed",
		})
		return
	}

	dbURL := os.Getenv("SUPABASE_DB_URL")
	if dbURL == "" {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(SyncOrderStatusesResponse{
			Success: false,
			Message: "Database configuration error",
		})
		return
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(SyncOrderStatusesResponse{
			Success: false,
			Message: "Failed to connect to database",
		})
		return
	}
	defer pool.Close()

	ordersUpdated, err := syncAllOrderStatuses(ctx, pool)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(SyncOrderStatusesResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(SyncOrderStatusesResponse{
		Success:       true,
		Message:       fmt.Sprintf("Successfully synced %d orders", ordersUpdated),
		OrdersUpdated: ordersUpdated,
	})
}

func syncAllOrderStatuses(ctx context.Context, db *pgxpool.Pool) (int, error) {
	rows, err := db.Query(ctx, `
		SELECT id
		FROM orders
		WHERE status NOT IN ('cancelled', 'completed')
	`)

	if err != nil {
		return 0, fmt.Errorf("failed to query orders: %w", err)
	}
	defer rows.Close()

	var orderIDs []string
	for rows.Next() {
		var orderID string
		if err := rows.Scan(&orderID); err != nil {
			return 0, fmt.Errorf("failed to scan order ID: %w", err)
		}
		orderIDs = append(orderIDs, orderID)
	}

	if err := rows.Err(); err != nil {
		return 0, fmt.Errorf("error iterating rows: %w", err)
	}

	ordersUpdated := 0

	for _, orderID := range orderIDs {
		tx, err := db.Begin(ctx)
		if err != nil {
			return ordersUpdated, fmt.Errorf("failed to begin transaction for order %s: %w", orderID, err)
		}

		orderStatus, err := orders.CalculateOrderStatus(ctx, tx, orderID)
		if err != nil {
			tx.Rollback(ctx)
			return ordersUpdated, fmt.Errorf("failed to calculate order status for order %s: %w", orderID, err)
		}

		now := time.Now()
		result, err := tx.Exec(ctx, `
			UPDATE orders
			SET status = $1, status_updated_at = $2, updated_at = $2
			WHERE id = $3 AND status != $1
		`, orderStatus, now, orderID)

		if err != nil {
			tx.Rollback(ctx)
			return ordersUpdated, fmt.Errorf("failed to update order %s: %w", orderID, err)
		}

		rowsAffected := result.RowsAffected()

		if err := tx.Commit(ctx); err != nil {
			return ordersUpdated, fmt.Errorf("failed to commit transaction for order %s: %w", orderID, err)
		}

		if rowsAffected > 0 {
			ordersUpdated++
		}
	}

	return ordersUpdated, nil
}
