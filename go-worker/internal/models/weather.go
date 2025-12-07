package models

import (
	"fmt"
)

// WeatherLocation representa dados de localização
type WeatherLocation struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Timezone  string  `json:"timezone"`
}

// WeatherCurrent representa dados climáticos atuais
type WeatherCurrent struct {
	Temperature   float64 `json:"temperature"`
	Humidity      float64 `json:"humidity"`
	Precipitation float64 `json:"precipitation"`
	WindSpeed     float64 `json:"wind_speed"`
	WeatherCode   int     `json:"weather_code"`
	Time          string  `json:"time"`
}

// WeatherMessage representa a mensagem recebida do RabbitMQ (formato Python)
type WeatherMessage struct {
	Timestamp string          `json:"timestamp"`
	Location  WeatherLocation `json:"location"`
	Current   WeatherCurrent  `json:"current"`
}

// WeatherLog representa o payload enviado para a API NestJS
type WeatherLog struct {
	Location    string  `json:"location"`
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
	Pressure    float64 `json:"pressure"`
	Description string  `json:"description,omitempty"`
	WindSpeed   float64 `json:"windSpeed,omitempty"`
	Visibility  float64 `json:"visibility,omitempty"`
	UvIndex     float64 `json:"uvIndex,omitempty"`
	Source      string  `json:"source"`
}

// Validate valida os dados da mensagem meteorológica
func (w *WeatherMessage) Validate() error {
	if w.Timestamp == "" {
		return ErrInvalidTimestamp
	}
	if w.Location.Latitude < -90 || w.Location.Latitude > 90 {
		return ErrInvalidLocation
	}
	if w.Location.Longitude < -180 || w.Location.Longitude > 180 {
		return ErrInvalidLocation
	}
	if w.Current.Temperature < -100 || w.Current.Temperature > 100 {
		return ErrInvalidTemperature
	}
	if w.Current.Humidity < 0 || w.Current.Humidity > 100 {
		return ErrInvalidHumidity
	}
	return nil
}

// GetLocationString cria string de localização baseada nas coordenadas
func (w *WeatherMessage) GetLocationString() string {
	// Converte coordenadas para nome aproximado da cidade
	lat := w.Location.Latitude
	lon := w.Location.Longitude

	// São Paulo aproximado
	if lat >= -23.8 && lat <= -23.3 && lon >= -46.9 && lon <= -46.3 {
		return "São Paulo, SP"
	}

	// Para outras coordenadas, retorna coordenadas formatadas
	return fmt.Sprintf("%.4f,%.4f", lat, lon)
}

// GetWeatherDescription converte código do tempo em descrição
func (w *WeatherMessage) GetWeatherDescription() string {
	code := w.Current.WeatherCode

	// Códigos WMO Weather interpretation
	switch {
	case code == 0:
		return "Céu limpo"
	case code >= 1 && code <= 3:
		return "Parcialmente nublado"
	case code >= 45 && code <= 48:
		return "Neblina"
	case code >= 51 && code <= 57:
		return "Garoa"
	case code >= 61 && code <= 67:
		return "Chuva"
	case code >= 71 && code <= 77:
		return "Neve"
	case code >= 80 && code <= 82:
		return "Chuva forte"
	case code >= 95 && code <= 99:
		return "Tempestade"
	default:
		return "Condição desconhecida"
	}
}

// ToWeatherLog converte WeatherMessage para WeatherLog
func (w *WeatherMessage) ToWeatherLog() WeatherLog {
	return WeatherLog{
		Location:    w.GetLocationString(),
		Temperature: w.Current.Temperature,
		Humidity:    w.Current.Humidity,
		Pressure:    1013.25, // Pressão padrão (Open-Meteo não fornece diretamente)
		Description: w.GetWeatherDescription(),
		WindSpeed:   w.Current.WindSpeed,
		Visibility:  10000, // Visibilidade padrão em metros
		UvIndex:     0,     // Open-Meteo não fornece UV index no endpoint atual
		Source:      "go-worker",
	}
}

