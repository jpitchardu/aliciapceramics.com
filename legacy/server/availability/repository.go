package availability

import (
	"aliciapceramics/server/database"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

type AvailabilityRepository interface {
	GetByDateRange(startDate, endDate string) ([]availabilityRow, error)
	Upsert(items []UpdateAvailabilityItem) ([]availabilityRow, error)
}

type supabaseAvailabilityRepository struct{}

func NewSupabaseAvailabilityRepository() AvailabilityRepository {
	return &supabaseAvailabilityRepository{}
}

func (r *supabaseAvailabilityRepository) GetByDateRange(startDate, endDate string) ([]availabilityRow, error) {
	query := fmt.Sprintf("availability?select=*&date=gte.%s&date=lte.%s&order=date.asc",
		url.QueryEscape(startDate),
		url.QueryEscape(endDate))

	body, statusCode, err := database.MakeDBCall("GET", query, nil)

	if err != nil {
		return nil, fmt.Errorf("[AvailabilityRepository:GetByDateRange] request failed: %w", err)
	}

	if statusCode != http.StatusOK {
		return nil, fmt.Errorf("[AvailabilityRepository:GetByDateRange] failed with status code %d: %s", statusCode, string(body))
	}

	var availability []availabilityRow

	if err := json.Unmarshal(body, &availability); err != nil {
		return nil, fmt.Errorf("[AvailabilityRepository:GetByDateRange] failed to parse body: %w", err)
	}

	return availability, nil
}

func (r *supabaseAvailabilityRepository) Upsert(items []UpdateAvailabilityItem) ([]availabilityRow, error) {
	payload, err := json.Marshal(items)

	if err != nil {
		return nil, fmt.Errorf("[AvailabilityRepository:Upsert] marshal failed: %w", err)
	}

	body, statusCode, err := database.MakeDBCall("POST", "availability?on_conflict=date", bytes.NewBuffer(payload))

	if err != nil {
		return nil, fmt.Errorf("[AvailabilityRepository:Upsert] request failed: %w", err)
	}

	if statusCode != http.StatusCreated {
		return nil, fmt.Errorf("[AvailabilityRepository:Upsert] failed with status code %d: %s", statusCode, string(body))
	}

	var availability []availabilityRow

	if err := json.Unmarshal(body, &availability); err != nil {
		return nil, fmt.Errorf("[AvailabilityRepository:Upsert] failed to parse body: %w", err)
	}

	return availability, nil
}
