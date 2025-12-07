package processor

import (
	"encoding/json"
	"fmt"
	"go-worker/internal/client"
	"go-worker/internal/models"
	"log"
)

// Processor processa mensagens meteorológicas
type Processor struct {
	apiClient *client.APIClient
}

// NewProcessor cria uma nova instância do processador
func NewProcessor(apiClient *client.APIClient) *Processor {
	return &Processor{
		apiClient: apiClient,
	}
}

// Process processa uma mensagem do RabbitMQ
func (p *Processor) Process(messageBody []byte) error {
	// Deserializa a mensagem
	var weatherMsg models.WeatherMessage
	if err := json.Unmarshal(messageBody, &weatherMsg); err != nil {
		return fmt.Errorf("erro ao deserializar mensagem: %w", err)
	}

	log.Printf("[INFO] Mensagem recebida: location=%.2f,%.2f, temperature=%.1f, humidity=%.1f",
		weatherMsg.Location.Latitude, weatherMsg.Location.Longitude,
		weatherMsg.Current.Temperature, weatherMsg.Current.Humidity)

	// Valida os dados
	if err := weatherMsg.Validate(); err != nil {
		return fmt.Errorf("validação falhou: %w", err)
	}

	// Transforma para WeatherLog
	weatherLog := weatherMsg.ToWeatherLog()

	// Envia para a API NestJS
	if err := p.apiClient.SendWeatherLog(weatherLog); err != nil {
		return fmt.Errorf("erro ao enviar para API: %w", err)
	}

	log.Printf("[INFO] Mensagem processada com sucesso: location=%s", weatherMsg.Location)
	return nil
}

