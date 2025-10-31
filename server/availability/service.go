package availability

import (
	"fmt"
	"time"
)

type AvailabilityService struct {
	repo AvailabilityRepository
}

func NewAvailabilityService(repo AvailabilityRepository) *AvailabilityService {
	return &AvailabilityService{repo: repo}
}

var DefaultWeeklySchedule = map[time.Weekday]float64{
	time.Monday:    4.0,
	time.Tuesday:   2.0,
	time.Wednesday: 2.0,
	time.Thursday:  4.0,
	time.Friday:    8.0,
	time.Saturday:  8.0,
	time.Sunday:    0.0,
}

func (s *AvailabilityService) GetAvailability(startDate, endDate string) ([]AvailabilityDTO, error) {
	rows, err := s.repo.GetByDateRange(startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("[AvailabilityService:GetAvailability] failed: %w", err)
	}

	dbMap := make(map[string]availabilityRow)
	for _, row := range rows {
		dbMap[row.Date] = row
	}

	start, err := time.Parse("2006-01-02", startDate)
	if err != nil {
		return nil, fmt.Errorf("[AvailabilityService:GetAvailability] invalid start date: %w", err)
	}

	end, err := time.Parse("2006-01-02", endDate)
	if err != nil {
		return nil, fmt.Errorf("[AvailabilityService:GetAvailability] invalid end date: %w", err)
	}

	result := []AvailabilityDTO{}

	for d := start; !d.After(end); d = d.AddDate(0, 0, 1) {
		dateStr := d.Format("2006-01-02")

		if row, exists := dbMap[dateStr]; exists {
			result = append(result, AvailabilityDTO{
				Date:           row.Date,
				AvailableHours: row.AvailableHours,
				Notes:          row.Notes,
				IsDefault:      false,
			})
		} else {
			defaultHours := DefaultWeeklySchedule[d.Weekday()]
			result = append(result, AvailabilityDTO{
				Date:           dateStr,
				AvailableHours: defaultHours,
				Notes:          nil,
				IsDefault:      true,
			})
		}
	}

	return result, nil
}

func (s *AvailabilityService) UpdateAvailability(items []UpdateAvailabilityItem) ([]AvailabilityDTO, error) {
	rows, err := s.repo.Upsert(items)
	if err != nil {
		return nil, fmt.Errorf("[AvailabilityService:UpdateAvailability] failed: %w", err)
	}

	result := []AvailabilityDTO{}
	for _, row := range rows {
		result = append(result, AvailabilityDTO{
			Date:           row.Date,
			AvailableHours: row.AvailableHours,
			Notes:          row.Notes,
			IsDefault:      false,
		})
	}

	return result, nil
}

func (s *AvailabilityService) GetAvailabilityForDate(date time.Time) (float64, error) {
	dateStr := date.Format("2006-01-02")

	rows, err := s.repo.GetByDateRange(dateStr, dateStr)
	if err != nil {
		return 0, fmt.Errorf("[AvailabilityService:GetAvailabilityForDate] failed: %w", err)
	}

	if len(rows) > 0 {
		return rows[0].AvailableHours, nil
	}

	return DefaultWeeklySchedule[date.Weekday()], nil
}
