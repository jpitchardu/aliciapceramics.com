package handler

import (
	"aliciapceramics/server/availability"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type GetAvailabilityRequest struct {
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
}

type UpdateAvailabilityRequest struct {
	Updates []availability.UpdateAvailabilityItem `json:"updates"`
}

func AvailabilityHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		handleGetAvailability(w, r)
	case http.MethodPatch:
		handleUpdateAvailability(w, r)
	default:
		LogError("invalid_method", fmt.Errorf("method %s not allowed", r.Method), map[string]any{
			"method": r.Method,
		})
		RespondWithError(w, http.StatusMethodNotAllowed, "Method not allowed", "INVALID_METHOD")
	}
}

func handleGetAvailability(w http.ResponseWriter, r *http.Request) {
	startDate := r.URL.Query().Get("start_date")
	endDate := r.URL.Query().Get("end_date")

	if startDate == "" || endDate == "" {
		LogError("missing_parameters", fmt.Errorf("start_date and end_date are required"), map[string]any{
			"has_start_date": startDate != "",
			"has_end_date":   endDate != "",
		})
		RespondWithError(w, http.StatusBadRequest, "start_date and end_date query parameters are required", "MISSING_PARAMETERS")
		return
	}

	repo := availability.NewSupabaseAvailabilityRepository()
	service := availability.NewAvailabilityService(repo)

	result, err := service.GetAvailability(startDate, endDate)
	if err != nil {
		LogError("get_availability", err, map[string]any{
			"start_date": startDate,
			"end_date":   endDate,
		})
		RespondWithError(w, http.StatusInternalServerError, "Failed to fetch availability", "AVAILABILITY_ERROR")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}

func handleUpdateAvailability(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		LogError("read_body", err, map[string]any{
			"content_length": r.ContentLength,
		})
		RespondWithError(w, http.StatusBadRequest, "Failed to read request body", "INVALID_REQUEST")
		return
	}
	defer r.Body.Close()

	var req UpdateAvailabilityRequest
	if err := json.Unmarshal(body, &req); err != nil {
		LogError("parse_json", err, map[string]any{
			"body_length": len(body),
		})
		RespondWithError(w, http.StatusBadRequest, "Invalid request format", "INVALID_JSON")
		return
	}

	if len(req.Updates) == 0 {
		LogError("empty_updates", fmt.Errorf("no updates provided"), map[string]any{})
		RespondWithError(w, http.StatusBadRequest, "Updates array cannot be empty", "EMPTY_UPDATES")
		return
	}

	for i, update := range req.Updates {
		if update.Date == "" {
			LogError("invalid_update", fmt.Errorf("date is required"), map[string]any{
				"index": i,
			})
			RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Date is required for update at index %d", i), "INVALID_UPDATE")
			return
		}
		if update.AvailableHours < 0 {
			LogError("invalid_update", fmt.Errorf("available_hours cannot be negative"), map[string]any{
				"index":           i,
				"available_hours": update.AvailableHours,
			})
			RespondWithError(w, http.StatusBadRequest, fmt.Sprintf("Available hours cannot be negative at index %d", i), "INVALID_UPDATE")
			return
		}
	}

	repo := availability.NewSupabaseAvailabilityRepository()
	service := availability.NewAvailabilityService(repo)

	result, err := service.UpdateAvailability(req.Updates)
	if err != nil {
		LogError("update_availability", err, map[string]any{
			"update_count": len(req.Updates),
		})
		RespondWithError(w, http.StatusInternalServerError, "Failed to update availability", "AVAILABILITY_ERROR")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}
