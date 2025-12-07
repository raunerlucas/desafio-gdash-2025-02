package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

// Config armazena as configurações da aplicação
type Config struct {
	RabbitMQURL       string
	NestJSAPIURL      string
	QueueName         string
	WorkerConcurrency int
	MaxRetryAttempts  int
	RetryDelay        time.Duration
}

// Load carrega as configurações das variáveis de ambiente
func Load() *Config {
	// Build RabbitMQ URL from components
	rabbitmqHost := getEnv("RABBITMQ_HOST", "rabbitmq")
	rabbitmqPort := getEnv("RABBITMQ_PORT", "5672")
	rabbitmqUser := getEnv("RABBITMQ_USER", "admin")
	rabbitmqPassword := getEnv("RABBITMQ_PASSWORD", "admin123")
	rabbitmqURL := fmt.Sprintf("amqp://%s:%s@%s:%s/", rabbitmqUser, rabbitmqPassword, rabbitmqHost, rabbitmqPort)

	// Build NestJS API URL
	backendAPIURL := getEnv("BACKEND_API_URL", "http://backend:3000")
	backendAPIEndpoint := getEnv("BACKEND_API_ENDPOINT", "/api/weather/logs")
	fullAPIURL := backendAPIURL + backendAPIEndpoint

	return &Config{
		RabbitMQURL:       rabbitmqURL,
		NestJSAPIURL:      fullAPIURL,
		QueueName:         getEnv("RABBITMQ_QUEUE", "weather_data"),
		WorkerConcurrency: getEnvAsInt("WORKER_CONCURRENCY", 5),
		MaxRetryAttempts:  getEnvAsInt("MAX_RETRY_ATTEMPTS", 3),
		RetryDelay:        getEnvAsDuration("RETRY_DELAY", 2*time.Second),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func getEnvAsDuration(key string, defaultValue time.Duration) time.Duration {
	valueStr := os.Getenv(key)
	if value, err := time.ParseDuration(valueStr); err == nil {
		return value
	}
	return defaultValue
}

