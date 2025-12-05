package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"go-worker/internal/models"
	"io"
	"log"
	"net/http"
	"time"
)

// APIClient é o cliente HTTP para a API NestJS
type APIClient struct {
	baseURL          string
	httpClient       *http.Client
	maxRetryAttempts int
	retryDelay       time.Duration
}

// NewAPIClient cria uma nova instância do cliente API
func NewAPIClient(baseURL string, maxRetryAttempts int, retryDelay time.Duration) *APIClient {
	return &APIClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		maxRetryAttempts: maxRetryAttempts,
		retryDelay:       retryDelay,
	}
}

// SendWeatherLog envia os dados meteorológicos para a API NestJS com retry
func (c *APIClient) SendWeatherLog(log models.WeatherLog) error {
	var lastErr error

	for attempt := 1; attempt <= c.maxRetryAttempts; attempt++ {
		err := c.sendRequest(log, attempt)
		if err == nil {
			return nil
		}

		lastErr = err

		// Verifica se é erro 4xx (não faz retry)
		if httpErr, ok := err.(*HTTPError); ok && httpErr.StatusCode >= 400 && httpErr.StatusCode < 500 {
			logMessage(fmt.Sprintf("[ERROR] Erro 4xx não recuperável: %v", err))
			return err
		}

		// Se não for a última tentativa, aguarda antes de tentar novamente
		if attempt < c.maxRetryAttempts {
			delay := c.retryDelay * time.Duration(1<<uint(attempt-1)) // Backoff exponencial
			logMessage(fmt.Sprintf("[WARN] Falha ao enviar para API (tentativa %d/%d): %v. Aguardando %v...",
				attempt, c.maxRetryAttempts, err, delay))
			time.Sleep(delay)
		}
	}

	logMessage(fmt.Sprintf("[ERROR] Todas as tentativas falharam após %d tentativas", c.maxRetryAttempts))
	return lastErr
}

func (c *APIClient) sendRequest(log models.WeatherLog, attempt int) error {
	endpoint := fmt.Sprintf("%s/api/weather/logs", c.baseURL)

	// Serializa o payload
	payload, err := json.Marshal(log)
	if err != nil {
		return fmt.Errorf("erro ao serializar payload: %w", err)
	}

	logMessage(fmt.Sprintf("[INFO] Enviando para API NestJS: POST %s (tentativa %d)", endpoint, attempt))

	// Cria a requisição
	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(payload))
	if err != nil {
		return fmt.Errorf("erro ao criar requisição: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	// Envia a requisição
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("erro ao enviar requisição: %w", err)
	}
	defer resp.Body.Close()

	// Lê o corpo da resposta
	body, _ := io.ReadAll(resp.Body)

	// Verifica o status code
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		logMessage(fmt.Sprintf("[INFO] Resposta API: %d %s", resp.StatusCode, http.StatusText(resp.StatusCode)))
		return nil
	}

	// Retorna erro com o status code
	return &HTTPError{
		StatusCode: resp.StatusCode,
		Body:       string(body),
	}
}

// HTTPError representa um erro HTTP
type HTTPError struct {
	StatusCode int
	Body       string
}

func (e *HTTPError) Error() string {
	return fmt.Sprintf("HTTP %d: %s", e.StatusCode, e.Body)
}

func logMessage(message string) {
	log.Printf("%s", message)
}

