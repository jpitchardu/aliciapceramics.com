package availability

import (
	"errors"
	"reflect"
	"testing"
	"time"
)

type mockAvailabilityRepository struct {
	getByDateRangeFunc func(string, string) ([]availabilityRow, error)
	upsertFunc         func([]UpdateAvailabilityItem) ([]availabilityRow, error)
}

func (m *mockAvailabilityRepository) GetByDateRange(startDate, endDate string) ([]availabilityRow, error) {
	return m.getByDateRangeFunc(startDate, endDate)
}

func (m *mockAvailabilityRepository) Upsert(items []UpdateAvailabilityItem) ([]availabilityRow, error) {
	return m.upsertFunc(items)
}

func TestAvailabilityService_GetAvailability(t *testing.T) {
	tests := []struct {
		name        string
		repo        *mockAvailabilityRepository
		startDate   string
		endDate     string
		expectLen   int
		expectError bool
	}{
		{
			name: "returns mix of db and default values",
			repo: &mockAvailabilityRepository{
				getByDateRangeFunc: func(start, end string) ([]availabilityRow, error) {
					return []availabilityRow{
						{
							ID:             "1",
							Date:           "2025-11-03",
							AvailableHours: 6.0,
							Notes:          nil,
						},
					}, nil
				},
			},
			startDate:   "2025-11-03",
			endDate:     "2025-11-05",
			expectLen:   3,
			expectError: false,
		},
		{
			name: "returns all defaults when no db records",
			repo: &mockAvailabilityRepository{
				getByDateRangeFunc: func(start, end string) ([]availabilityRow, error) {
					return []availabilityRow{}, nil
				},
			},
			startDate:   "2025-11-03",
			endDate:     "2025-11-03",
			expectLen:   1,
			expectError: false,
		},
		{
			name: "repo error",
			repo: &mockAvailabilityRepository{
				getByDateRangeFunc: func(start, end string) ([]availabilityRow, error) {
					return nil, errors.New("db error")
				},
			},
			startDate:   "2025-11-03",
			endDate:     "2025-11-05",
			expectLen:   0,
			expectError: true,
		},
		{
			name: "invalid start date",
			repo: &mockAvailabilityRepository{
				getByDateRangeFunc: func(start, end string) ([]availabilityRow, error) {
					return []availabilityRow{}, nil
				},
			},
			startDate:   "invalid",
			endDate:     "2025-11-05",
			expectLen:   0,
			expectError: true,
		},
		{
			name: "invalid end date",
			repo: &mockAvailabilityRepository{
				getByDateRangeFunc: func(start, end string) ([]availabilityRow, error) {
					return []availabilityRow{}, nil
				},
			},
			startDate:   "2025-11-03",
			endDate:     "invalid",
			expectLen:   0,
			expectError: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			svc := NewAvailabilityService(tc.repo)
			result, err := svc.GetAvailability(tc.startDate, tc.endDate)

			if tc.expectError {
				if err == nil {
					t.Fatalf("expected error, got none")
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if len(result) != tc.expectLen {
				t.Errorf("got %d results, want %d", len(result), tc.expectLen)
			}
		})
	}
}

func TestAvailabilityService_GetAvailability_DefaultValues(t *testing.T) {
	repo := &mockAvailabilityRepository{
		getByDateRangeFunc: func(start, end string) ([]availabilityRow, error) {
			return []availabilityRow{}, nil
		},
	}

	svc := NewAvailabilityService(repo)
	result, err := svc.GetAvailability("2025-11-03", "2025-11-09")

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 7 {
		t.Fatalf("expected 7 days, got %d", len(result))
	}

	expectedDefaults := map[string]float64{
		"2025-11-03": 4.0,
		"2025-11-04": 2.0,
		"2025-11-05": 2.0,
		"2025-11-06": 4.0,
		"2025-11-07": 8.0,
		"2025-11-08": 8.0,
		"2025-11-09": 0.0,
	}

	for _, day := range result {
		if !day.IsDefault {
			t.Errorf("day %s should be marked as default", day.Date)
		}

		expected, ok := expectedDefaults[day.Date]
		if !ok {
			t.Errorf("unexpected date in result: %s", day.Date)
			continue
		}

		if day.AvailableHours != expected {
			t.Errorf("date %s: got %f hours, want %f", day.Date, day.AvailableHours, expected)
		}
	}
}

func TestAvailabilityService_GetAvailability_MixedValues(t *testing.T) {
	repo := &mockAvailabilityRepository{
		getByDateRangeFunc: func(start, end string) ([]availabilityRow, error) {
			notes := "Custom availability"
			return []availabilityRow{
				{
					ID:             "1",
					Date:           "2025-11-04",
					AvailableHours: 6.0,
					Notes:          &notes,
				},
			}, nil
		},
	}

	svc := NewAvailabilityService(repo)
	result, err := svc.GetAvailability("2025-11-03", "2025-11-05")

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(result) != 3 {
		t.Fatalf("expected 3 days, got %d", len(result))
	}

	if !result[0].IsDefault {
		t.Errorf("2025-11-03 should be default")
	}
	if result[0].AvailableHours != 4.0 {
		t.Errorf("2025-11-03 should have 4.0 hours, got %f", result[0].AvailableHours)
	}

	if result[1].IsDefault {
		t.Errorf("2025-11-04 should not be default")
	}
	if result[1].AvailableHours != 6.0 {
		t.Errorf("2025-11-04 should have 6.0 hours, got %f", result[1].AvailableHours)
	}
	if result[1].Notes == nil || *result[1].Notes != "Custom availability" {
		t.Errorf("2025-11-04 should have notes")
	}

	if !result[2].IsDefault {
		t.Errorf("2025-11-05 should be default")
	}
	if result[2].AvailableHours != 2.0 {
		t.Errorf("2025-11-05 should have 2.0 hours, got %f", result[2].AvailableHours)
	}
}

func TestAvailabilityService_UpdateAvailability(t *testing.T) {
	notes := "Updated"
	tests := []struct {
		name        string
		repo        *mockAvailabilityRepository
		updates     []UpdateAvailabilityItem
		expectLen   int
		expectError bool
	}{
		{
			name: "successful update",
			repo: &mockAvailabilityRepository{
				upsertFunc: func(items []UpdateAvailabilityItem) ([]availabilityRow, error) {
					return []availabilityRow{
						{
							ID:             "1",
							Date:           items[0].Date,
							AvailableHours: items[0].AvailableHours,
							Notes:          items[0].Notes,
						},
					}, nil
				},
			},
			updates: []UpdateAvailabilityItem{
				{
					Date:           "2025-11-03",
					AvailableHours: 5.0,
					Notes:          &notes,
				},
			},
			expectLen:   1,
			expectError: false,
		},
		{
			name: "repo error",
			repo: &mockAvailabilityRepository{
				upsertFunc: func(items []UpdateAvailabilityItem) ([]availabilityRow, error) {
					return nil, errors.New("db error")
				},
			},
			updates: []UpdateAvailabilityItem{
				{
					Date:           "2025-11-03",
					AvailableHours: 5.0,
				},
			},
			expectLen:   0,
			expectError: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			svc := NewAvailabilityService(tc.repo)
			result, err := svc.UpdateAvailability(tc.updates)

			if tc.expectError {
				if err == nil {
					t.Fatalf("expected error, got none")
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if len(result) != tc.expectLen {
				t.Errorf("got %d results, want %d", len(result), tc.expectLen)
			}

			if len(result) > 0 && result[0].IsDefault {
				t.Errorf("updated availability should not be marked as default")
			}
		})
	}
}

func TestAvailabilityService_GetAvailabilityForDate(t *testing.T) {
	tests := []struct {
		name          string
		repo          *mockAvailabilityRepository
		date          time.Time
		expectHours   float64
		expectError   bool
	}{
		{
			name: "returns db value when exists",
			repo: &mockAvailabilityRepository{
				getByDateRangeFunc: func(start, end string) ([]availabilityRow, error) {
					return []availabilityRow{
						{
							ID:             "1",
							Date:           start,
							AvailableHours: 10.0,
						},
					}, nil
				},
			},
			date:        time.Date(2025, 11, 3, 0, 0, 0, 0, time.UTC),
			expectHours: 10.0,
			expectError: false,
		},
		{
			name: "returns default when no db record",
			repo: &mockAvailabilityRepository{
				getByDateRangeFunc: func(start, end string) ([]availabilityRow, error) {
					return []availabilityRow{}, nil
				},
			},
			date:        time.Date(2025, 11, 3, 0, 0, 0, 0, time.UTC),
			expectHours: 4.0,
			expectError: false,
		},
		{
			name: "returns Sunday default (0.0) when no db record",
			repo: &mockAvailabilityRepository{
				getByDateRangeFunc: func(start, end string) ([]availabilityRow, error) {
					return []availabilityRow{}, nil
				},
			},
			date:        time.Date(2025, 11, 9, 0, 0, 0, 0, time.UTC),
			expectHours: 0.0,
			expectError: false,
		},
		{
			name: "repo error",
			repo: &mockAvailabilityRepository{
				getByDateRangeFunc: func(start, end string) ([]availabilityRow, error) {
					return nil, errors.New("db error")
				},
			},
			date:        time.Date(2025, 11, 3, 0, 0, 0, 0, time.UTC),
			expectHours: 0.0,
			expectError: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			svc := NewAvailabilityService(tc.repo)
			hours, err := svc.GetAvailabilityForDate(tc.date)

			if tc.expectError {
				if err == nil {
					t.Fatalf("expected error, got none")
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if hours != tc.expectHours {
				t.Errorf("got %f hours, want %f", hours, tc.expectHours)
			}
		})
	}
}

func TestDefaultWeeklySchedule(t *testing.T) {
	expected := map[time.Weekday]float64{
		time.Monday:    4.0,
		time.Tuesday:   2.0,
		time.Wednesday: 2.0,
		time.Thursday:  4.0,
		time.Friday:    8.0,
		time.Saturday:  8.0,
		time.Sunday:    0.0,
	}

	if !reflect.DeepEqual(DefaultWeeklySchedule, expected) {
		t.Errorf("DefaultWeeklySchedule mismatch:\ngot:  %+v\nwant: %+v", DefaultWeeklySchedule, expected)
	}
}
