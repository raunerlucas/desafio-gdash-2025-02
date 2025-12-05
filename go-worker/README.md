# Go Worker Service

## Visão Geral

O **Go Worker Service** é responsável por consumir mensagens da fila RabbitMQ, validar e transformar os dados meteorológicos, e enviá-los para a API NestJS através de requisições HTTP.

## Funcionalidades

- **Consumo de mensagens RabbitMQ**: Escuta a fila `weather_queue` para receber dados meteorológicos
- **Validação e transformação**: Processa e valida os dados recebidos
- **Integração com API NestJS**: Envia os dados processados via HTTP POST
- **Retry automático**: Implementa lógica de retry com backoff exponencial
- **Acknowledgment**: Confirma ou rejeita mensagens (ACK/NACK)
- **Logging estruturado**: Registra todas as operações para auditoria e debug

## Tecnologias

- **Go 1.21+**: Linguagem de programação
- **RabbitMQ**: Sistema de mensageria (`github.com/rabbitmq/amqp091-go`)
- **HTTP Client**: Cliente HTTP nativo (`net/http`)
- **JSON**: Serialização/deserialização (`encoding/json`)
- **Docker**: Containerização

## Estrutura de Pastas

```
go-worker/
├── cmd/
│   └── worker/
│       └── main.go          # Ponto de entrada da aplicação
├── internal/
│   ├── config/
│   │   └── config.go        # Configurações e variáveis de ambiente
│   ├── messaging/
│   │   └── rabbitmq.go      # Conexão e consumo RabbitMQ
│   ├── processor/
│   │   └── processor.go     # Lógica de processamento e validação
│   ├── client/
│   │   └── api_client.go    # Cliente HTTP para API NestJS
│   └── models/
│       └── weather.go       # Estruturas de dados
├── go.mod
├── go.sum
├── Dockerfile
└── README.md
```

## Variáveis de Ambiente

```env
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
NESTJS_API_URL=http://nestjs-api:3000
QUEUE_NAME=weather_queue
WORKER_CONCURRENCY=5
MAX_RETRY_ATTEMPTS=3
RETRY_DELAY=2s
```

## Instalação e Execução

### Com Docker Compose

```bash
docker-compose up go-worker
```

### Desenvolvimento Local

```bash
# Instalar dependências
go mod download

# Executar
go run cmd/worker/main.go

# Build
go build -o worker cmd/worker/main.go
```

## Fluxo de Processamento

1. **Conexão**: Estabelece conexão com RabbitMQ
2. **Consumo**: Escuta mensagens na fila `weather_queue`
3. **Processamento**:
   - Deserializa a mensagem JSON
   - Valida os dados meteorológicos
   - Transforma/enriquece os dados se necessário
4. **Envio para API**:
   - Faz requisição POST para `http://nestjs-api:3000/api/weather/logs`
   - Implementa retry com backoff exponencial (até 3 tentativas)
5. **Acknowledgment**:
   - **ACK**: Se o envio for bem-sucedido
   - **NACK**: Se todas as tentativas falharem

## Modelo de Dados

### Mensagem RabbitMQ (entrada)

```go
type WeatherMessage struct {
    Location    string    `json:"location"`
    Temperature float64   `json:"temperature"`
    Humidity    float64   `json:"humidity"`
    Timestamp   time.Time `json:"timestamp"`
    Source      string    `json:"source"`
}
```

### Payload para API NestJS (saída)

```go
type WeatherLog struct {
    Location    string    `json:"location"`
    Temperature float64   `json:"temperature"`
    Humidity    float64   `json:"humidity"`
    Timestamp   string    `json:"timestamp"`
    Source      string    `json:"source"`
    ProcessedAt string    `json:"processed_at"`
}
```

## Endpoints da API NestJS

### POST `/api/weather/logs`

**Request Body:**
```json
{
  "location": "São Paulo, BR",
  "temperature": 25.5,
  "humidity": 65.0,
  "timestamp": "2025-06-15T14:30:00Z",
  "source": "OpenWeatherMap",
  "processed_at": "2025-06-15T14:30:05Z"
}
```

**Response Success (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "message": "Weather log created successfully"
}
```

**Response Error (400):**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["temperature must be a number"]
}
```

## Tratamento de Erros

### Retry Logic

- **Tentativas**: 3 tentativas por mensagem
- **Backoff**: Exponencial (2s, 4s, 8s)
- **Erros HTTP 5xx**: Retry automático
- **Erros HTTP 4xx**: Sem retry (NACK imediato)

### Dead Letter Queue (DLQ)

Mensagens que falharem após todas as tentativas são movidas automaticamente para a DLQ configurada no RabbitMQ.

## Logging

Todas as operações principais são registradas:

```
[INFO] Conectado ao RabbitMQ
[INFO] Mensagem recebida: location=São Paulo, BR
[INFO] Enviando para API NestJS: POST /api/weather/logs
[INFO] Resposta API: 201 Created
[ACK] Mensagem confirmada
[ERROR] Falha ao enviar para API (tentativa 1/3): timeout
[NACK] Mensagem rejeitada após 3 tentativas
```

## Desenvolvimento

```bash
# Executar testes
go test ./...

# Executar com verbose
go test -v ./...

# Coverage
go test -cover ./...

# Linter (opcional)
golangci-lint run
```

## Dependências

```bash
go get github.com/rabbitmq/amqp091-go
```

## Próximos Passos

- [ ] Implementar métricas Prometheus
- [ ] Adicionar circuit breaker para chamadas HTTP
- [ ] Configurar graceful shutdown
- [ ] Implementar health check endpoint
- [ ] Adicionar tracing distribuído (OpenTelemetry)