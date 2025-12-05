package processor

import (
	"encoding/json"
	"testing"
	"time"

	"go-worker/internal/models"
)

// MockAPIClient simula o cliente API para testes
type MockAPIClient struct {
	SendFunc func(models.WeatherLog) error
}

func (m *MockAPIClient) SendWeatherLog(log models.WeatherLog) error {
	if m.SendFunc != nil {
		return m.SendFunc(log)
	}
	return nil
}

func TestProcessor_Process(t *testing.T) {
	tests := []struct {
		name      string
		message   []byte
		sendFunc  func(models.WeatherLog) error
		wantErr   bool
		errString string
	}{
		{
			name: "valid message",
			message: func() []byte {
				msg := models.WeatherMessage{
					Location:    "São Paulo, BR",
					Temperature: 25.5,
					Humidity:    65.0,
					Timestamp:   time.Now(),
					Source:      "OpenWeatherMap",
				}
				b, _ := json.Marshal(msg)
				return b
			}(),
			sendFunc: func(log models.WeatherLog) error {
				return nil
			},
			wantErr: false,
		},
		{
			name:      "invalid JSON",
			message:   []byte(`{invalid json}`),
			wantErr:   true,
			errString: "erro ao deserializar mensagem",
		},
		{
			name: "validation failed - missing location",
			message: func() []byte {
				msg := models.WeatherMessage{
					Temperature: 25.5,
					Humidity:    65.0,
					Timestamp:   time.Now(),
					Source:      "OpenWeatherMap",
				}
				b, _ := json.Marshal(msg)
				return b
			}(),
			wantErr:   true,
			errString: "validação falhou",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := &MockAPIClient{SendFunc: tt.sendFunc}
			proc := NewProcessor(mockClient)

			err := proc.Process(tt.message)
			if (err != nil) != tt.wantErr {
				t.Errorf("Process() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

