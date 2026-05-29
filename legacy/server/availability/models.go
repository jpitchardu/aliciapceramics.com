package availability

import "time"

type availabilityRow struct {
	ID             string    `json:"id,omitempty"`
	Date           string    `json:"date"`
	AvailableHours float64   `json:"available_hours"`
	Notes          *string   `json:"notes,omitempty"`
	CreatedAt      time.Time `json:"created_at,omitempty"`
	UpdatedAt      time.Time `json:"updated_at,omitempty"`
}

type AvailabilityDTO struct {
	Date           string  `json:"date"`
	AvailableHours float64 `json:"available_hours"`
	Notes          *string `json:"notes,omitempty"`
	IsDefault      bool    `json:"is_default"`
}

type UpdateAvailabilityItem struct {
	Date           string  `json:"date"`
	AvailableHours float64 `json:"available_hours"`
	Notes          *string `json:"notes,omitempty"`
}
