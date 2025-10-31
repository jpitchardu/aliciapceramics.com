package customers

import (
	"fmt"
)

type ICustomerService interface{}

type CustomerService struct {
	repo customerRepository
}

func NewCustomerService(repo customerRepository) *CustomerService {
	return &CustomerService{repo: repo}
}

func (cs *CustomerService) UpsertCustomer(payloadDTO UpsertCustomerPayloadDTO) (CustomerDTO, error) {
	customers, err := cs.repo.GetByEmail(payloadDTO.Email)
	if err != nil {
		return CustomerDTO{}, fmt.Errorf("[CustomerService:UpsertCustomer] fetch by email failed: %w", err)
	}
	if len(customers) > 0 {
		return CustomerDTO{
			ID:                       customers[0].ID,
			Name:                     customers[0].Name,
			Email:                    customers[0].Email,
			Phone:                    customers[0].Phone,
			CommunicationPreferences: customers[0].CommunicationPreferences,
		}, nil
	}
	customerToCreate := customerRow{
		Name:                     payloadDTO.Name,
		Email:                    payloadDTO.Email,
		Phone:                    payloadDTO.Phone,
		CommunicationPreferences: payloadDTO.CommunicationPreferences,
	}

	createdCustomers, err := cs.repo.Create(customerToCreate)
	if err != nil {
		return CustomerDTO{}, fmt.Errorf("[CustomerService:UpsertCustomer] create failed: %w", err)
	}
	if len(createdCustomers) == 0 {
		return CustomerDTO{}, fmt.Errorf("[CustomerService:UpsertCustomer] failed to create customer, db didn't return any records")
	}
	return CustomerDTO{
		ID:                       createdCustomers[0].ID,
		Name:                     createdCustomers[0].Name,
		Email:                    createdCustomers[0].Email,
		Phone:                    createdCustomers[0].Phone,
		CommunicationPreferences: createdCustomers[0].CommunicationPreferences,
	}, nil
}

func (cs *CustomerService) GetCustomer() {

}
