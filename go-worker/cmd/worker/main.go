package main

import (
	"context"
	"go-worker/internal/client"
	"go-worker/internal/config"
	"go-worker/internal/messaging"
	"go-worker/internal/processor"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	log.Println("[INFO] Iniciando Go Worker Service...")

	// Carrega configurações
	cfg := config.Load()
	log.Printf("[INFO] Configurações carregadas: Queue=%s, API=%s, MaxRetry=%d",
		cfg.QueueName, cfg.NestJSAPIURL, cfg.MaxRetryAttempts)

	// Aguarda RabbitMQ estar disponível
	log.Println("[INFO] Aguardando RabbitMQ estar disponível...")
	if err := messaging.WaitForConnection(cfg.RabbitMQURL, 10, 5*time.Second); err != nil {
		log.Fatalf("[FATAL] %v", err)
	}

	// Cria cliente API
	apiClient := client.NewAPIClient(cfg.NestJSAPIURL, cfg.MaxRetryAttempts, cfg.RetryDelay)

	// Cria processador
	proc := processor.NewProcessor(apiClient)

	// Cria consumer RabbitMQ
	consumer, err := messaging.NewRabbitMQConsumer(cfg.RabbitMQURL, cfg.QueueName)
	if err != nil {
		log.Fatalf("[FATAL] Erro ao criar consumer: %v", err)
	}
	defer consumer.Close()

	// Contexto para graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Captura sinais do sistema para graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)

	// Goroutine para processar sinais
	go func() {
		sig := <-sigChan
		log.Printf("[INFO] Sinal recebido: %v. Iniciando graceful shutdown...", sig)
		cancel()
	}()

	// Inicia consumo de mensagens
	log.Println("[INFO] Worker iniciado com sucesso!")
	if err := consumer.Consume(ctx, proc.Process); err != nil {
		log.Printf("[ERROR] Erro durante consumo: %v", err)
	}

	log.Println("[INFO] Worker encerrado")
}

