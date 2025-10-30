package customers

type customerRow struct {
	ID                       string  `json:"id,omitempty"`
	Name                     string  `json:"name"`
	Email                    string  `json:"email"`
	Phone                    string  `json:"phone"`
	CommunicationPreferences *string `json:"communication_preferences,omitempty"`
}

type customerSMSConsentRow struct {
	ID               string  `json:"id,omitempty"`
	CustomerID       string  `json:"customer_id"`
	PhoneNumber      string  `json:"phone_number"`
	ConsentType      string  `json:"consent_type"`
	ConsentGiven     bool    `json:"consent_given"`
	ConsentLanguage  string  `json:"consent_language"`
	ConsentMethod    string  `json:"consent_method"`
	RevocationMethod *string `json:"revocation_method,omitempty"`
	IPAddress        *string `json:"ip_address,omitempty"`
	UserAgent        *string `json:"user_agent,omitempty"`
}
