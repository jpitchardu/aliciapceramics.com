package database

import (
	"fmt"
	"io"
	"net/http"
	"os"
)

func MakeDBCall(method, url string, payload io.Reader) ([]byte, int, error) {

	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	if supabaseUrl == "" || supabaseKey == "" {
		return []byte{}, 0, fmt.Errorf("database configuration missing, has_url: %t ; has_key: %t", supabaseUrl != "", supabaseKey != "")
	}

	fullUrl := fmt.Sprintf("%s/rest/v1/%s", supabaseUrl, url)

	req, err := http.NewRequest(method, fullUrl, payload)

	if err != nil {
		return []byte{}, 0, fmt.Errorf("error trying to create request for url: %s with error: %w", url, err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey) //
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return []byte{}, 0, fmt.Errorf("error when calling url: %s with error: %w", url, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return []byte{}, 0, fmt.Errorf("error trying to read body from response with error: %w and status code %d", err, req.Response.StatusCode)
	}

	return body, resp.StatusCode, nil
}
