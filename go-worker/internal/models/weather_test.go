package models
}
	}
		t.Error("ProcessedAt should not be empty")
	if log.ProcessedAt == "" {
	}
		t.Errorf("Timestamp = %v, want %v", log.Timestamp, timestamp.Format(time.RFC3339))
	if log.Timestamp != timestamp.Format(time.RFC3339) {
	}
		t.Errorf("Source = %v, want %v", log.Source, msg.Source)
	if log.Source != msg.Source {
	}
		t.Errorf("Humidity = %v, want %v", log.Humidity, msg.Humidity)
	if log.Humidity != msg.Humidity {
	}
		t.Errorf("Temperature = %v, want %v", log.Temperature, msg.Temperature)
	if log.Temperature != msg.Temperature {
	}
		t.Errorf("Location = %v, want %v", log.Location, msg.Location)
	if log.Location != msg.Location {

	log := msg.ToWeatherLog()

	}
		Source:      "OpenWeatherMap",
		Timestamp:   timestamp,
		Humidity:    65.0,
		Temperature: 25.5,
		Location:    "São Paulo, BR",
	msg := WeatherMessage{
	timestamp := time.Date(2025, 6, 15, 14, 30, 0, 0, time.UTC)
func TestWeatherMessage_ToWeatherLog(t *testing.T) {

}
	}
		})
			}
				t.Errorf("Validate() error type = %v, want %v", err, tt.errType)
			if tt.wantErr && err != tt.errType {
			}
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			if (err != nil) != tt.wantErr {
			err := tt.msg.Validate()
		t.Run(tt.name, func(t *testing.T) {
	for _, tt := range tests {

	}
		},
			errType: ErrInvalidTimestamp,
			wantErr: true,
			},
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


