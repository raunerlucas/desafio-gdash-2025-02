package config

import (
	"os"
	"testing"
	"time"
)

func TestLoad(t *testing.T) {
	// Salva variáveis de ambiente originais
	originalEnv := map[string]string{
		"RABBITMQ_URL":       os.Getenv("RABBITMQ_URL"),
		"NESTJS_API_URL":     os.Getenv("NESTJS_API_URL"),
		"QUEUE_NAME":         os.Getenv("QUEUE_NAME"),
		"WORKER_CONCURRENCY": os.Getenv("WORKER_CONCURRENCY"),
		"MAX_RETRY_ATTEMPTS": os.Getenv("MAX_RETRY_ATTEMPTS"),
		"RETRY_DELAY":        os.Getenv("RETRY_DELAY"),
	}

	// Restaura variáveis após o teste
	defer func() {
		for key, value := range originalEnv {
			if value != "" {
				os.Setenv(key, value)
			} else {
				os.Unsetenv(key)
			}
		}
	}()

	t.Run("default values", func(t *testing.T) {
		// Limpa variáveis de ambiente
		for key := range originalEnv {
			os.Unsetenv(key)
		}

		cfg := Load()

		if cfg.RabbitMQURL != "amqp://guest:guest@rabbitmq:5672/" {
			t.Errorf("RabbitMQURL = %v, want default", cfg.RabbitMQURL)
		}
		if cfg.NestJSAPIURL != "http://nestjs-api:3000" {
			t.Errorf("NestJSAPIURL = %v, want default", cfg.NestJSAPIURL)
		}
		if cfg.QueueName != "weather_queue" {
			t.Errorf("QueueName = %v, want default", cfg.QueueName)
		}
		if cfg.WorkerConcurrency != 5 {
			t.Errorf("WorkerConcurrency = %v, want 5", cfg.WorkerConcurrency)
		}
		if cfg.MaxRetryAttempts != 3 {
			t.Errorf("MaxRetryAttempts = %v, want 3", cfg.MaxRetryAttempts)
		}
		if cfg.RetryDelay != 2*time.Second {
			t.Errorf("RetryDelay = %v, want 2s", cfg.RetryDelay)
		}
	})

	t.Run("custom values from environment", func(t *testing.T) {
		os.Setenv("RABBITMQ_URL", "amqp://custom:custom@localhost:5672/")
		os.Setenv("NESTJS_API_URL", "http://localhost:4000")
		os.Setenv("QUEUE_NAME", "custom_queue")
		os.Setenv("WORKER_CONCURRENCY", "10")
		os.Setenv("MAX_RETRY_ATTEMPTS", "5")
		os.Setenv("RETRY_DELAY", "5s")

		cfg := Load()

		if cfg.RabbitMQURL != "amqp://custom:custom@localhost:5672/" {
			t.Errorf("RabbitMQURL = %v, want custom", cfg.RabbitMQURL)
		}
		if cfg.NestJSAPIURL != "http://localhost:4000" {
			t.Errorf("NestJSAPIURL = %v, want custom", cfg.NestJSAPIURL)
		}
		if cfg.QueueName != "custom_queue" {
			t.Errorf("QueueName = %v, want custom", cfg.QueueName)
		}
		if cfg.WorkerConcurrency != 10 {
			t.Errorf("WorkerConcurrency = %v, want 10", cfg.WorkerConcurrency)
		}
		if cfg.MaxRetryAttempts != 5 {
			t.Errorf("MaxRetryAttempts = %v, want 5", cfg.MaxRetryAttempts)
		}
		if cfg.RetryDelay != 5*time.Second {
			t.Errorf("RetryDelay = %v, want 5s", cfg.RetryDelay)
		}
	})
}

