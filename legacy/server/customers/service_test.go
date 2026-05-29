package customers

import (
	"errors"
	"reflect"
	"testing"
)

type mockCustomerRepository struct {
	getByEmailFunc func(string) ([]customerRow, error)
	createFunc     func(customerRow) ([]customerRow, error)
}

func (m *mockCustomerRepository) GetByEmail(email string) ([]customerRow, error) {
	return m.getByEmailFunc(email)
}
func (m *mockCustomerRepository) Create(c customerRow) ([]customerRow, error) {
	return m.createFunc(c)
}

func TestCustomerService_UpsertCustomer(t *testing.T) {
	testEmail := "test@example.com"
	testDTO := UpsertCustomerPayloadDTO{
		Name:  "Tester",
		Email: testEmail,
		Phone: "1234567890",
	}
	existingCustomer := customerRow{
		ID:    "id123",
		Name:  "Tester",
		Email: testEmail,
		Phone: "1234567890",
	}

	tests := []struct {
		name        string
		repo        *mockCustomerRepository
		input       UpsertCustomerPayloadDTO
		expectDTO   CustomerDTO
		expectError bool
	}{
		{
			name: "customer exists, should return existing",
			repo: &mockCustomerRepository{
				getByEmailFunc: func(email string) ([]customerRow, error) {
					return []customerRow{existingCustomer}, nil
				},
				createFunc: func(customerRow) ([]customerRow, error) {
					t.Fatal("Create should not be called if found")
					return nil, nil
				},
			},
			input: testDTO,
			expectDTO: CustomerDTO{
				ID:    existingCustomer.ID,
				Name:  existingCustomer.Name,
				Email: existingCustomer.Email,
				Phone: existingCustomer.Phone,
			},
			expectError: false,
		},
		{
			name: "customer not found, should create",
			repo: &mockCustomerRepository{
				getByEmailFunc: func(email string) ([]customerRow, error) {
					return nil, nil
				},
				createFunc: func(c customerRow) ([]customerRow, error) {
					return []customerRow{{
						ID:    "newid",
						Name:  c.Name,
						Email: c.Email,
						Phone: c.Phone,
					}}, nil
				},
			},
			input: testDTO,
			expectDTO: CustomerDTO{
				ID:    "newid",
				Name:  testDTO.Name,
				Email: testDTO.Email,
				Phone: testDTO.Phone,
			},
			expectError: false,
		},
		{
			name: "repo GetByEmail error",
			repo: &mockCustomerRepository{
				getByEmailFunc: func(email string) ([]customerRow, error) {
					return nil, errors.New("db error")
				},
				createFunc: func(c customerRow) ([]customerRow, error) {
					return nil, nil
				},
			},
			input:       testDTO,
			expectDTO:   CustomerDTO{},
			expectError: true,
		},
		{
			name: "repo Create error",
			repo: &mockCustomerRepository{
				getByEmailFunc: func(email string) ([]customerRow, error) {
					return nil, nil
				},
				createFunc: func(c customerRow) ([]customerRow, error) {
					return nil, errors.New("create error")
				},
			},
			input:       testDTO,
			expectDTO:   CustomerDTO{},
			expectError: true,
		},
		{
			name: "repo Create returns no records",
			repo: &mockCustomerRepository{
				getByEmailFunc: func(email string) ([]customerRow, error) {
					return nil, nil
				},
				createFunc: func(c customerRow) ([]customerRow, error) {
					return nil, nil
				},
			},
			input:       testDTO,
			expectDTO:   CustomerDTO{},
			expectError: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			svc := NewCustomerService(tc.repo)
			result, err := svc.UpsertCustomer(tc.input)
			if tc.expectError {
				if err == nil {
					t.Fatalf("expected error, got none")
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if !reflect.DeepEqual(result, tc.expectDTO) {
				t.Errorf("got %+v, want %+v", result, tc.expectDTO)
			}
		})
	}
}
