package models

import (
	"testing"
)

func TestWeatherMessage_Validate(t *testing.T) {
	tests := []struct {
		name    string
		msg     WeatherMessage
		wantErr bool
		errType error
	}{
		{
			name: "valid message",
			msg: WeatherMessage{
				Timestamp: "2025-06-15T14:30:00Z",
				Location: WeatherLocation{
					Latitude:  -23.5505,
					Longitude: -46.6333,
					Timezone:  "America/Sao_Paulo",
				},
				Current: WeatherCurrent{
					Temperature: 25.5,
					Humidity:    65.0,
					WindSpeed:   10.5,
					WeatherCode: 0,
				},
			},
			wantErr: false,
		},
		{
			name: "missing timestamp",
			msg: WeatherMessage{
				Location: WeatherLocation{
					Latitude:  -23.5505,
					Longitude: -46.6333,
				},
				Current: WeatherCurrent{
					Temperature: 25.5,
					Humidity:    65.0,
				},
			},
			wantErr: true,
			errType: ErrInvalidTimestamp,
		},
		{
			name: "invalid latitude",
			msg: WeatherMessage{
				Timestamp: "2025-06-15T14:30:00Z",
				Location: WeatherLocation{
					Latitude:  -91.0,
					Longitude: -46.6333,
				},
				Current: WeatherCurrent{
					Temperature: 25.5,
					Humidity:    65.0,
				},
			},
			wantErr: true,
			errType: ErrInvalidLocation,
		},
		{
			name: "invalid temperature",
			msg: WeatherMessage{
				Timestamp: "2025-06-15T14:30:00Z",
				Location: WeatherLocation{
					Latitude:  -23.5505,
					Longitude: -46.6333,
				},
				Current: WeatherCurrent{
					Temperature: -150.0,
					Humidity:    65.0,
				},
			},
			wantErr: true,
			errType: ErrInvalidTemperature,
		},
		{
			name: "invalid humidity",
			msg: WeatherMessage{
				Timestamp: "2025-06-15T14:30:00Z",
				Location: WeatherLocation{
					Latitude:  -23.5505,
					Longitude: -46.6333,
				},
				Current: WeatherCurrent{
					Temperature: 25.5,
					Humidity:    150.0,
				},
			},
			wantErr: true,
			errType: ErrInvalidHumidity,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.msg.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
			if tt.wantErr && err != tt.errType {
				t.Errorf("Validate() error type = %v, want %v", err, tt.errType)
			}
		})
	}
}

func TestWeatherMessage_ToWeatherLog(t *testing.T) {
	msg := WeatherMessage{
		Timestamp: "2025-06-15T14:30:00Z",
		Location: WeatherLocation{
			Latitude:  -23.5505,
			Longitude: -46.6333,
			Timezone:  "America/Sao_Paulo",
		},
		Current: WeatherCurrent{
			Temperature:   25.5,
			Humidity:      65.0,
			WindSpeed:     10.5,
			WeatherCode:   0,
			Precipitation: 0.0,
		},
	}

	log := msg.ToWeatherLog()

	if log.Location != "São Paulo, SP" {
		t.Errorf("Location = %v, want %v", log.Location, "São Paulo, SP")
	}
	if log.Temperature != msg.Current.Temperature {
		t.Errorf("Temperature = %v, want %v", log.Temperature, msg.Current.Temperature)
	}
	if log.Humidity != msg.Current.Humidity {
		t.Errorf("Humidity = %v, want %v", log.Humidity, msg.Current.Humidity)
	}
	if log.Source != "go-worker" {
		t.Errorf("Source = %v, want %v", log.Source, "go-worker")
	}
	if log.Description != "Céu limpo" {
		t.Errorf("Description = %v, want %v", log.Description, "Céu limpo")
	}
}

func TestWeatherMessage_GetLocationString(t *testing.T) {
	tests := []struct {
		name     string
		lat      float64
		lon      float64
		expected string
	}{
		{
			name:     "São Paulo coordinates",
			lat:      -23.5505,
			lon:      -46.6333,
			expected: "São Paulo, SP",
		},
		{
			name:     "Other coordinates",
			lat:      -22.9068,
			lon:      -43.1729,
			expected: "-22.9068,-43.1729",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			msg := WeatherMessage{
				Location: WeatherLocation{
					Latitude:  tt.lat,
					Longitude: tt.lon,
				},
			}
			result := msg.GetLocationString()
			if result != tt.expected {
				t.Errorf("GetLocationString() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestWeatherMessage_GetWeatherDescription(t *testing.T) {
	tests := []struct {
		name     string
		code     int
		expected string
	}{
		{
			name:     "clear sky",
			code:     0,
			expected: "Céu limpo",
		},
		{
			name:     "partly cloudy",
			code:     2,
			expected: "Parcialmente nublado",
		},
		{
			name:     "fog",
			code:     45,
			expected: "Neblina",
		},
		{
			name:     "rain",
			code:     61,
			expected: "Chuva",
		},
		{
			name:     "unknown code",
			code:     999,
			expected: "Condição desconhecida",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			msg := WeatherMessage{
				Current: WeatherCurrent{
					WeatherCode: tt.code,
				},
			}
			result := msg.GetWeatherDescription()
			if result != tt.expected {
				t.Errorf("GetWeatherDescription() = %v, want %v", result, tt.expected)
			}
		})
	}
}
				Source:      "OpenWeatherMap",
				Humidity:    65.0,
				Temperature: 25.5,
				Location:    "São Paulo, BR",
			msg: WeatherMessage{
			name: "zero timestamp",
		{
		},
			errType: ErrInvalidHumidity,
			wantErr: true,
			},
				Source:      "OpenWeatherMap",
				Timestamp:   time.Now(),
				Humidity:    -10.0,
				Temperature: 25.5,
				Location:    "São Paulo, BR",
			msg: WeatherMessage{
			name: "invalid humidity - negative",
		{
		},
			errType: ErrInvalidTemperature,
			wantErr: true,
			},
				Source:      "OpenWeatherMap",
				Timestamp:   time.Now(),
				Humidity:    65.0,
				Temperature: 150.0,
				Location:    "São Paulo, BR",
			msg: WeatherMessage{
			name: "invalid temperature - too high",
		{
		},
			errType: ErrInvalidSource,
			wantErr: true,
			},
				Timestamp:   time.Now(),
				Humidity:    65.0,
				Temperature: 25.5,
				Location:    "São Paulo, BR",
			msg: WeatherMessage{
			name: "missing source",
		{
		},
			errType: ErrInvalidLocation,
			wantErr: true,
			},
				Source:      "OpenWeatherMap",
				Timestamp:   time.Now(),
				Humidity:    65.0,
				Temperature: 25.5,
			msg: WeatherMessage{
			name: "missing location",
		{
		},
			wantErr: false,
			},
				Source:      "OpenWeatherMap",
				Timestamp:   time.Now(),
				Humidity:    65.0,
				Temperature: 25.5,
				Location:    "São Paulo, BR",
			msg: WeatherMessage{
			name: "valid message",
		{
	}{
		errType error
		wantErr bool
		msg     WeatherMessage
		name    string
	tests := []struct {
func TestWeatherMessage_Validate(t *testing.T) {

)
	"time"
	"testing"
import (


