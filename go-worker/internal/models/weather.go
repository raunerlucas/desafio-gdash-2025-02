package models

import "time"

// WeatherMessage representa a mensagem recebida do RabbitMQ
type WeatherMessage struct {
	Location    string    `json:"location"`
	Temperature float64   `json:"temperature"`
	Humidity    float64   `json:"humidity"`
	Timestamp   time.Time `json:"timestamp"`
	Source      string    `json:"source"`
}

// WeatherLog representa o payload enviado para a API NestJS
type WeatherLog struct {
	Location    string  `json:"location"`
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
	Timestamp   string  `json:"timestamp"`
	Source      string  `json:"source"`
	ProcessedAt string  `json:"processed_at"`
}

// Validate valida os dados da mensagem meteorológica
func (w *WeatherMessage) Validate() error {
	if w.Location == "" {
		return ErrInvalidLocation
	}
	if w.Source == "" {
		return ErrInvalidSource
	}
	if w.Temperature < -100 || w.Temperature > 100 {
		return ErrInvalidTemperature
	}
	if w.Humidity < 0 || w.Humidity > 100 {
		return ErrInvalidHumidity
	}
	if w.Timestamp.IsZero() {
		return ErrInvalidTimestamp
	}
	return nil
}

// ToWeatherLog converte WeatherMessage para WeatherLog
func (w *WeatherMessage) ToWeatherLog() WeatherLog {
	return WeatherLog{
		Location:    w.Location,
		Temperature: w.Temperature,
		Humidity:    w.Humidity,
		Timestamp:   w.Timestamp.Format(time.RFC3339),
		Source:      w.Source,
		ProcessedAt: time.Now().Format(time.RFC3339),
	}
}

