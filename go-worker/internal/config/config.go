package config

import (
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
	return &Config{
		RabbitMQURL:       getEnv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/"),
		NestJSAPIURL:      getEnv("NESTJS_API_URL", "http://nestjs-api:3000"),
		QueueName:         getEnv("QUEUE_NAME", "weather_queue"),
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

