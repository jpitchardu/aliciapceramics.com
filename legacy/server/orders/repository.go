package orders

import (
	"aliciapceramics/server/database"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type bulkCodeRepository interface {
	GetByCode(code string) ([]bulkCodeRow, error)
	MarkAsRedeemed(bulkCodeID string) error
}

type supabaseBulkCodeRepository struct{}

func (r *supabaseBulkCodeRepository) GetByCode(code string) ([]bulkCodeRow, error) {
	body, statusCode, err := database.MakeDBCall("GET", fmt.Sprintf("bulk_commission_codes?select=*&code=eq.%s", code), nil)

	if err != nil {
		return nil, fmt.Errorf("[BulkCodeRepository:GetByCode] request failed: %w", err)
	}

	if statusCode != http.StatusOK {
		return nil, fmt.Errorf("[BulkCodeRepository:GetByCode] failed with status code %d: %s", statusCode, string(body))
	}

	var bulkCodes []bulkCodeRow

	if err := json.Unmarshal(body, &bulkCodes); err != nil {
		return nil, fmt.Errorf("[BulkCodeRepository:GetByCode] failed to parse body: %w", err)
	}

	return bulkCodes, nil
}

func (r *supabaseBulkCodeRepository) MarkAsRedeemed(bulkCodeID string) error {
	updateData := map[string]string{
		"redeemed_at": "now()",
	}

	payload, err := json.Marshal(updateData)
	if err != nil {
		return fmt.Errorf("[BulkCodeRepository:MarkAsRedeemed] marshal failed: %w", err)
	}

	body, statusCode, err := database.MakeDBCall("PATCH", fmt.Sprintf("bulk_commission_codes?id=eq.%s", bulkCodeID), bytes.NewBuffer(payload))

	if err != nil {
		return fmt.Errorf("[BulkCodeRepository:MarkAsRedeemed] request failed: %w", err)
	}

	if statusCode != http.StatusOK && statusCode != http.StatusNoContent {
		return fmt.Errorf("[BulkCodeRepository:MarkAsRedeemed] failed with status code %d: %s", statusCode, string(body))
	}

	return nil
}
