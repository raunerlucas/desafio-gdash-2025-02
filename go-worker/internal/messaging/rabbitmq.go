package messaging

import (
	"context"
	"fmt"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

// RabbitMQConsumer gerencia a conexão e consumo do RabbitMQ
type RabbitMQConsumer struct {
	conn    *amqp.Connection
	channel *amqp.Channel
	queue   string
}

// MessageHandler é a função que processa cada mensagem
type MessageHandler func([]byte) error

// NewRabbitMQConsumer cria uma nova instância do consumer RabbitMQ
func NewRabbitMQConsumer(url, queueName string) (*RabbitMQConsumer, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, fmt.Errorf("falha ao conectar ao RabbitMQ: %w", err)
	}

	channel, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("falha ao abrir canal: %w", err)
	}

	// Declara a fila (garante que existe)
	_, err = channel.QueueDeclare(
		queueName, // nome
		true,      // durable
		false,     // auto-delete
		false,     // exclusive
		false,     // no-wait
		nil,       // argumentos
	)
	if err != nil {
		channel.Close()
		conn.Close()
		return nil, fmt.Errorf("falha ao declarar fila: %w", err)
	}

	// Define QoS (prefetch)
	err = channel.Qos(
		1,     // prefetch count
		0,     // prefetch size
		false, // global
	)
	if err != nil {
		channel.Close()
		conn.Close()
		return nil, fmt.Errorf("falha ao configurar QoS: %w", err)
	}

	log.Printf("[INFO] Conectado ao RabbitMQ - fila: %s", queueName)

	return &RabbitMQConsumer{
		conn:    conn,
		channel: channel,
		queue:   queueName,
	}, nil
}

// Consume inicia o consumo de mensagens
func (r *RabbitMQConsumer) Consume(ctx context.Context, handler MessageHandler) error {
	msgs, err := r.channel.Consume(
		r.queue, // fila
		"",      // consumer
		false,   // auto-ack (desabilitado para controle manual)
		false,   // exclusive
		false,   // no-local
		false,   // no-wait
		nil,     // args
	)
	if err != nil {
		return fmt.Errorf("falha ao registrar consumer: %w", err)
	}

	log.Printf("[INFO] Aguardando mensagens na fila '%s'. Para sair pressione CTRL+C", r.queue)

	for {
		select {
		case <-ctx.Done():
			log.Println("[INFO] Encerrando consumer...")
			return nil
		case msg, ok := <-msgs:
			if !ok {
				return fmt.Errorf("canal de mensagens foi fechado")
			}
			r.handleMessage(msg, handler)
		}
	}
}

func (r *RabbitMQConsumer) handleMessage(msg amqp.Delivery, handler MessageHandler) {
	// Processa a mensagem
	err := handler(msg.Body)

	if err != nil {
		log.Printf("[ERROR] Erro ao processar mensagem: %v", err)

		// NACK - rejeita a mensagem (pode ser reenfileirada ou enviada para DLQ)
		if nackErr := msg.Nack(false, false); nackErr != nil {
			log.Printf("[ERROR] Erro ao enviar NACK: %v", nackErr)
		} else {
			log.Printf("[NACK] Mensagem rejeitada")
		}
		return
	}

	// ACK - confirma o processamento
	if ackErr := msg.Ack(false); ackErr != nil {
		log.Printf("[ERROR] Erro ao enviar ACK: %v", ackErr)
	} else {
		log.Printf("[ACK] Mensagem confirmada")
	}
}

// Close fecha a conexão com o RabbitMQ
func (r *RabbitMQConsumer) Close() error {
	if r.channel != nil {
		if err := r.channel.Close(); err != nil {
			log.Printf("[WARN] Erro ao fechar canal: %v", err)
		}
	}
	if r.conn != nil {
		if err := r.conn.Close(); err != nil {
			log.Printf("[WARN] Erro ao fechar conexão: %v", err)
		}
	}
	log.Println("[INFO] Conexão RabbitMQ fechada")
	return nil
}

// WaitForConnection aguarda a conexão com RabbitMQ estar disponível
func WaitForConnection(url string, maxAttempts int, delay time.Duration) error {
	for i := 1; i <= maxAttempts; i++ {
		conn, err := amqp.Dial(url)
		if err == nil {
			conn.Close()
			return nil
		}

		if i < maxAttempts {
			log.Printf("[WARN] RabbitMQ não disponível (tentativa %d/%d): %v. Aguardando %v...",
				i, maxAttempts, err, delay)
			time.Sleep(delay)
		}
	}
	return fmt.Errorf("falha ao conectar ao RabbitMQ após %d tentativas", maxAttempts)
}

