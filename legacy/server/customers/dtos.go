package customers

type CustomerDTO struct {
	ID                       string
	Name                     string
	Email                    string
	Phone                    string
	CommunicationPreferences *string
}

type UpsertCustomerPayloadDTO struct {
	Name                     string
	Email                    string
	Phone                    string
	CommunicationPreferences *string
}
