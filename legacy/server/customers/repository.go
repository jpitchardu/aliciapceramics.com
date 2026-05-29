package customers

import (
	"aliciapceramics/server/database"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type customerRepository interface {
	GetByEmail(email string) ([]customerRow, error)
	Create(customer customerRow) ([]customerRow, error)
}

type supabaseCustomerRepository struct{}

func (r *supabaseCustomerRepository) GetByEmail(email string) ([]customerRow, error) {
	body, statusCode, err := database.MakeDBCall("GET", fmt.Sprintf("customers?select=*&email=eq.%s", email), nil)

	if err != nil {
		return nil, fmt.Errorf("[CustomerRepository:GetByEmail] request failed: %w", err)
	}

	if statusCode != http.StatusOK {
		return nil, fmt.Errorf("[CustomerRepository:GetByEmail] failed with status code %d: %s", statusCode, string(body))
	}

	var customers []customerRow

	if err := json.Unmarshal(body, &customers); err != nil {
		return nil, fmt.Errorf("[CustomerRepository:GetByEmail] failed to parse body: %w", err)
	}

	return customers, nil
}

func (r *supabaseCustomerRepository) Create(customer customerRow) ([]customerRow, error) {
	payload, err := json.Marshal(customer)

	if err != nil {
		return nil, fmt.Errorf("[CustomerRepository:Create] marshal failed: %w", err)
	}

	body, statusCode, err := database.MakeDBCall("POST", "customers", bytes.NewBuffer(payload))

	if err != nil {
		return nil, fmt.Errorf("[CustomerRepository:Create] request failed: %w", err)
	}

	if statusCode != http.StatusCreated {
		return nil, fmt.Errorf("[CustomerRepository:Create] failed with status code %d: %s", statusCode, string(body))
	}

	var customers []customerRow

	if err := json.Unmarshal(body, &customers); err != nil {
		return nil, fmt.Errorf("[CustomerRepository:Create] failed to parse body: %w", err)
	}

	return customers, nil
}
