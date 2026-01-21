package handler

import (
	"aliciapceramics/server/orders"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type BulkCodeValidationRequest struct {
	Code string `json:"code"`
}

type BulkCodeData struct {
	ID                      string `json:"id"`
	Code                    string `json:"code"`
	Name                    string `json:"name"`
	EarliestCompletionDate  string `json:"earliestCompletionDate"`
	RedeemedAt              string `json:"redeemedAt,omitempty"`
}

type BulkCodeValidationResponse struct {
	Success bool          `json:"success"`
	Valid   bool          `json:"valid"`
	Data    *BulkCodeData `json:"data,omitempty"`
	Message string        `json:"message,omitempty"`
}

func ValidateBulkCodeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		LogError("invalid_method", fmt.Errorf("method %s not allowed", r.Method), map[string]any{
			"method": r.Method,
		})
		RespondWithError(w, http.StatusMethodNotAllowed, "Method not allowed", "INVALID_METHOD")
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		LogError("read_body", err, map[string]any{
			"content_length": r.ContentLength,
		})
		RespondWithError(w, http.StatusBadRequest, "Failed to read request body", "INVALID_REQUEST")
		return
	}
	defer r.Body.Close()

	var req BulkCodeValidationRequest
	if err := json.Unmarshal(body, &req); err != nil {
		LogError("parse_json", err, map[string]any{
			"body_length": len(body),
		})
		RespondWithError(w, http.StatusBadRequest, "Invalid request format", "INVALID_JSON")
		return
	}

	service := orders.NewBulkCodeService()
	bulkCodeDTO, err := service.ValidateCode(req.Code)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(BulkCodeValidationResponse{
			Success: true,
			Valid:   false,
			Message: err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(BulkCodeValidationResponse{
		Success: true,
		Valid:   true,
		Data: &BulkCodeData{
			ID:                     bulkCodeDTO.ID,
			Code:                   bulkCodeDTO.Code,
			Name:                   bulkCodeDTO.Name,
			EarliestCompletionDate: bulkCodeDTO.EarliestCompletionDate,
			RedeemedAt:             bulkCodeDTO.RedeemedAt,
		},
	})
}
