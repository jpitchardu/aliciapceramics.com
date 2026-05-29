package orders

import (
	"fmt"
	"testing"
)

type mockBulkCodeRepository struct {
	getByCodeFunc       func(code string) ([]bulkCodeRow, error)
	markAsRedeemedFunc  func(bulkCodeID string) error
}

func (m *mockBulkCodeRepository) GetByCode(code string) ([]bulkCodeRow, error) {
	if m.getByCodeFunc != nil {
		return m.getByCodeFunc(code)
	}
	return nil, nil
}

func (m *mockBulkCodeRepository) MarkAsRedeemed(bulkCodeID string) error {
	if m.markAsRedeemedFunc != nil {
		return m.markAsRedeemedFunc(bulkCodeID)
	}
	return nil
}

func TestValidateCode(t *testing.T) {
	t.Run("returns error when code is empty", func(t *testing.T) {
		service := &BulkCodeService{
			repository: &mockBulkCodeRepository{},
		}

		_, err := service.ValidateCode("")

		if err == nil {
			t.Error("expected error for empty code, got nil")
		}

		if err.Error() != "code is required" {
			t.Errorf("expected error 'code is required', got '%s'", err.Error())
		}
	})

	t.Run("returns error when code not found", func(t *testing.T) {
		service := &BulkCodeService{
			repository: &mockBulkCodeRepository{
				getByCodeFunc: func(code string) ([]bulkCodeRow, error) {
					return []bulkCodeRow{}, nil
				},
			},
		}

		_, err := service.ValidateCode("INVALID123")

		if err == nil {
			t.Error("expected error for invalid code, got nil")
		}

		if err.Error() != "invalid code" {
			t.Errorf("expected error 'invalid code', got '%s'", err.Error())
		}
	})

	t.Run("returns error when code already redeemed", func(t *testing.T) {
		redeemedAt := "2026-01-20T10:00:00Z"
		service := &BulkCodeService{
			repository: &mockBulkCodeRepository{
				getByCodeFunc: func(code string) ([]bulkCodeRow, error) {
					return []bulkCodeRow{
						{
							ID:                     "code-123",
							Code:                   "ABC12345",
							Name:                   "Test Code",
							EarliestCompletionDate: "2026-03-01",
							RedeemedAt:             &redeemedAt,
						},
					}, nil
				},
			},
		}

		_, err := service.ValidateCode("ABC12345")

		if err == nil {
			t.Error("expected error for redeemed code, got nil")
		}

		if err.Error() != "code has already been redeemed" {
			t.Errorf("expected error 'code has already been redeemed', got '%s'", err.Error())
		}
	})

	t.Run("returns bulk code DTO when valid and unredeemed", func(t *testing.T) {
		service := &BulkCodeService{
			repository: &mockBulkCodeRepository{
				getByCodeFunc: func(code string) ([]bulkCodeRow, error) {
					return []bulkCodeRow{
						{
							ID:                     "code-123",
							Code:                   "ABC12345",
							Name:                   "Test Code",
							EarliestCompletionDate: "2026-03-01",
							RedeemedAt:             nil,
						},
					}, nil
				},
			},
		}

		result, err := service.ValidateCode("ABC12345")

		if err != nil {
			t.Errorf("expected no error, got '%s'", err.Error())
		}

		if result == nil {
			t.Fatal("expected result, got nil")
		}

		if result.ID != "code-123" {
			t.Errorf("expected ID 'code-123', got '%s'", result.ID)
		}

		if result.Code != "ABC12345" {
			t.Errorf("expected Code 'ABC12345', got '%s'", result.Code)
		}

		if result.Name != "Test Code" {
			t.Errorf("expected Name 'Test Code', got '%s'", result.Name)
		}

		if result.EarliestCompletionDate != "2026-03-01" {
			t.Errorf("expected EarliestCompletionDate '2026-03-01', got '%s'", result.EarliestCompletionDate)
		}

		if result.RedeemedAt != "" {
			t.Errorf("expected empty RedeemedAt, got '%s'", result.RedeemedAt)
		}
	})

	t.Run("propagates repository error", func(t *testing.T) {
		service := &BulkCodeService{
			repository: &mockBulkCodeRepository{
				getByCodeFunc: func(code string) ([]bulkCodeRow, error) {
					return nil, fmt.Errorf("database error")
				},
			},
		}

		_, err := service.ValidateCode("ABC12345")

		if err == nil {
			t.Error("expected error from repository, got nil")
		}
	})
}

func TestMarkAsRedeemed(t *testing.T) {
	t.Run("returns error when bulk code ID is empty", func(t *testing.T) {
		service := &BulkCodeService{
			repository: &mockBulkCodeRepository{},
		}

		err := service.MarkAsRedeemed("")

		if err == nil {
			t.Error("expected error for empty bulk code ID, got nil")
		}

		if err.Error() != "bulk code ID is required" {
			t.Errorf("expected error 'bulk code ID is required', got '%s'", err.Error())
		}
	})

	t.Run("successfully marks code as redeemed", func(t *testing.T) {
		called := false
		service := &BulkCodeService{
			repository: &mockBulkCodeRepository{
				markAsRedeemedFunc: func(bulkCodeID string) error {
					called = true
					if bulkCodeID != "code-123" {
						t.Errorf("expected bulkCodeID 'code-123', got '%s'", bulkCodeID)
					}
					return nil
				},
			},
		}

		err := service.MarkAsRedeemed("code-123")

		if err != nil {
			t.Errorf("expected no error, got '%s'", err.Error())
		}

		if !called {
			t.Error("expected repository method to be called")
		}
	})

	t.Run("propagates repository error", func(t *testing.T) {
		service := &BulkCodeService{
			repository: &mockBulkCodeRepository{
				markAsRedeemedFunc: func(bulkCodeID string) error {
					return fmt.Errorf("database error")
				},
			},
		}

		err := service.MarkAsRedeemed("code-123")

		if err == nil {
			t.Error("expected error from repository, got nil")
		}
	})
}
