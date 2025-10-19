package scheduler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

func GetDeadlineOrders() ([]OrderDB, error) {
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	if supabaseUrl == "" || supabaseKey == "" {
		return []OrderDB{}, fmt.Errorf("database configuration missing, has_url: %t ; has_key: %t", supabaseUrl != "", supabaseKey != "")
	}

	// First, check if customer already exists
	url := fmt.Sprintf("%s/rest/v1/orders?select=*,order_details(*)&due_date=not.is.null&status=neq.delivered&status.new.cancelled&order=due_date.asc", supabaseUrl)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return []OrderDB{}, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return []OrderDB{}, fmt.Errorf("failed to query orders: %w", err)
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return []OrderDB{}, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return []OrderDB{}, fmt.Errorf("failed to fetch orders with status %d and response %s", resp.StatusCode, string(body))
	}

	var orders []OrderDB

	err = json.Unmarshal(body, &orders)

	if err != nil {
		return []OrderDB{}, fmt.Errorf("failed to parse orders with deadlines response: %w, body: %s", err, string(body))
	}

	return orders, nil
}

func GetNonDeadlineOrders() ([]OrderDB, error) {
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	if supabaseUrl == "" || supabaseKey == "" {
		return []OrderDB{}, fmt.Errorf("database configuration missing, has_url: %t ; has_key: %t", supabaseUrl != "", supabaseKey != "")
	}

	// First, check if customer already exists
	url := fmt.Sprintf("%s/rest/v1/orders?select=*,order_details(*)&due_date=is.null&status=neq.delivered&status.neq.cancelled&order=created_at.asc", supabaseUrl)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return []OrderDB{}, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return []OrderDB{}, fmt.Errorf("failed to query orders: %w", err)
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return []OrderDB{}, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return []OrderDB{}, fmt.Errorf("failed to fetch orders with status %d and response %s", resp.StatusCode, string(body))
	}

	var orders []OrderDB

	err = json.Unmarshal(body, &orders)

	if err != nil {
		return []OrderDB{}, fmt.Errorf("failed to parse response for non deadline orders: %w", err)
	}

	return orders, nil
}

func DeletePendingTasks() error {
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	if supabaseUrl == "" || supabaseKey == "" {
		return fmt.Errorf("database configuration missing, has_url: %t ; has_key: %t", supabaseUrl != "", supabaseKey != "")
	}

	// First, check if customer already exists
	url := fmt.Sprintf("%s/rest/v1/tasks?status=eq.pending", supabaseUrl)

	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create delete pending tasks request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return fmt.Errorf("failed to query orders: %w", err)
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		return fmt.Errorf("failed to delete pending tasks with status %d and response %s", resp.StatusCode, string(body))
	}

	return nil
}

func InsertTasks(tasks []TaskToCreate) error {
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	if supabaseUrl == "" || supabaseKey == "" {
		return fmt.Errorf("database configuration missing, has_url: %t ; has_key: %t", supabaseUrl != "", supabaseKey != "")
	}

	// First, check if customer already exists
	url := fmt.Sprintf("%s/rest/v1/tasks", supabaseUrl)

	body, err := json.Marshal(tasks)

	if err != nil {
		return fmt.Errorf("failed to parse tasks into json")
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("failed to create insert tasks request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return fmt.Errorf("failed to insert tasks: %w", err)
	}

	defer resp.Body.Close()

	body, err = io.ReadAll(resp.Body)

	if err != nil {
		return fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to insert tasks with status %d and response %s", resp.StatusCode, string(body))
	}

	return nil
}
