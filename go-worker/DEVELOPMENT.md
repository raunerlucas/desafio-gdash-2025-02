# Go Worker Service - Guia de Desenvolvimento

## 📁 Estrutura do Projeto

```
go-worker/
├── cmd/
│   └── worker/
│       └── main.go              # Ponto de entrada da aplicação
├── internal/
│   ├── client/
│   │   └── api_client.go        # Cliente HTTP para API NestJS
│   ├── config/
│   │   ├── config.go            # Configurações
│   │   └── config_test.go       # Testes de configuração
│   ├── messaging/
│   │   └── rabbitmq.go          # Consumidor RabbitMQ
│   ├── models/
│   │   ├── errors.go            # Definição de erros
│   │   ├── weather.go           # Modelos de dados
│   │   └── weather_test.go      # Testes dos modelos
│   └── processor/
│       ├── processor.go         # Lógica de processamento
│       └── processor_test.go    # Testes do processador
├── .env.example                 # Exemplo de variáveis de ambiente
├── .gitignore                   # Arquivos ignorados pelo Git
├── Dockerfile                   # Imagem Docker multi-stage
├── go.mod                       # Módulo Go e dependências
├── Makefile                     # Comandos úteis
└── README.md                    # Documentação principal
```

## 🚀 Início Rápido

### Pré-requisitos

- Go 1.21 ou superior
- Docker (opcional, para containerização)
- RabbitMQ rodando (local ou via Docker)
- API NestJS rodando

### Instalação

```bash
# Clone o repositório e navegue até a pasta
cd go-worker

# Baixe as dependências
go mod download

# Execute os testes
go test ./...

# Compile o projeto
go build -o worker cmd/worker/main.go
```

### Configuração

Copie o arquivo `.env.example` e ajuste conforme necessário:

```bash
cp .env.example .env
```

Variáveis disponíveis:

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `RABBITMQ_URL` | `amqp://guest:guest@rabbitmq:5672/` | URL de conexão RabbitMQ |
| `NESTJS_API_URL` | `http://nestjs-api:3000` | URL da API NestJS |
| `QUEUE_NAME` | `weather_queue` | Nome da fila a consumir |
| `WORKER_CONCURRENCY` | `5` | Número de workers concorrentes |
| `MAX_RETRY_ATTEMPTS` | `3` | Máximo de tentativas de envio |
| `RETRY_DELAY` | `2s` | Delay inicial entre tentativas |

### Executar Localmente

```bash
# Usando go run
go run cmd/worker/main.go

# Ou usando o binário compilado
./worker
```

## 🧪 Testes

```bash
# Executar todos os testes
go test ./...

# Testes com verbosidade
go test -v ./...

# Testes com cobertura
go test -cover ./...

# Cobertura detalhada
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

## 🐳 Docker

### Build da Imagem

```bash
docker build -t go-worker:latest .
```

### Executar Container

```bash
docker run --rm \
  -e RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/ \
  -e NESTJS_API_URL=http://nestjs-api:3000 \
  -e QUEUE_NAME=weather_queue \
  go-worker:latest
```

### Docker Compose

Se você tiver um `docker-compose.yml` no projeto pai:

```bash
docker-compose up go-worker
```

## 📋 Componentes Principais

### 1. Models (`internal/models/`)

Define as estruturas de dados:

- **WeatherMessage**: Mensagem recebida do RabbitMQ
- **WeatherLog**: Payload enviado para a API
- Validações de dados meteorológicos
- Conversão entre tipos

### 2. Config (`internal/config/`)

Gerencia configurações da aplicação:

- Carrega variáveis de ambiente
- Define valores padrão
- Converte tipos (string → int, duration)

### 3. RabbitMQ Consumer (`internal/messaging/`)

Gerencia a comunicação com RabbitMQ:

- Conexão e declaração de filas
- Consumo de mensagens
- ACK/NACK automático
- Retry de conexão
- Graceful shutdown

### 4. API Client (`internal/client/`)

Cliente HTTP para API NestJS:

- Requisições POST para `/api/weather/logs`
- Retry com backoff exponencial
- Diferenciação de erros 4xx/5xx
- Timeout configurável

### 5. Processor (`internal/processor/`)

Orquestra o fluxo de processamento:

- Deserializa mensagens JSON
- Valida dados
- Transforma dados
- Envia para API

## 🔄 Fluxo de Processamento

```
1. RabbitMQ → Recebe mensagem da fila
               ↓
2. Processor → Deserializa JSON
               ↓
3. Validator → Valida dados meteorológicos
               ↓
4. Transform → Converte WeatherMessage → WeatherLog
               ↓
5. API Client → POST /api/weather/logs
               ↓
6. Retry Logic → Até 3 tentativas com backoff
               ↓
7. ACK/NACK → Confirma ou rejeita mensagem
```

## 🛠️ Desenvolvimento

### Adicionar Nova Validação

Edite `internal/models/weather.go`:

```go
func (w *WeatherMessage) Validate() error {
    // ... validações existentes ...
    
    // Nova validação
    if w.NewField == "" {
        return ErrInvalidNewField
    }
    
    return nil
}
```

Adicione o erro em `internal/models/errors.go`:

```go
var (
    // ... erros existentes ...
    ErrInvalidNewField = errors.New("new field is required")
)
```

### Adicionar Métricas

Para adicionar métricas Prometheus:

1. Adicione dependência: `go get github.com/prometheus/client_golang/prometheus`
2. Crie package `internal/metrics/`
3. Registre contadores/histogramas
4. Exponha endpoint `/metrics`

### Logging Estruturado

O projeto usa `log` padrão do Go. Para logs estruturados:

```go
// Substitua por logrus ou zap
import "github.com/sirupsen/logrus"

log := logrus.WithFields(logrus.Fields{
    "location": weatherMsg.Location,
    "source": weatherMsg.Source,
})
log.Info("Mensagem processada")
```

## 🚨 Tratamento de Erros

### Erros de Validação

- **Ação**: NACK imediato
- **Requeue**: false (vai para DLQ)
- **Log**: ERROR

### Erros HTTP 4xx

- **Ação**: NACK imediato (sem retry)
- **Motivo**: Erro do cliente (dados inválidos)
- **Log**: ERROR

### Erros HTTP 5xx

- **Ação**: Retry automático (até 3x)
- **Backoff**: Exponencial (2s, 4s, 8s)
- **Log**: WARN → ERROR

### Erros de Conexão

- **RabbitMQ**: Retry na inicialização (10x, 5s)
- **HTTP**: Retry configurável

## 📊 Monitoramento

### Logs

Todos os logs seguem o formato:

```
[LEVEL] Mensagem: detalhes
```

Níveis:
- `[INFO]`: Operações normais
- `[WARN]`: Avisos (retry)
- `[ERROR]`: Erros críticos
- `[ACK]`: Mensagem confirmada
- `[NACK]`: Mensagem rejeitada

### Health Check

Para adicionar health check:

```go
// Em cmd/worker/main.go
go func() {
    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        w.Write([]byte("OK"))
    })
    http.ListenAndServe(":8080", nil)
}()
```

## 🔐 Segurança

### Credenciais RabbitMQ

Sempre use variáveis de ambiente:

```bash
RABBITMQ_URL=amqp://user:pass@host:port/vhost
```

Nunca commite credenciais no código!

### HTTPS

Para produção, use HTTPS na API:

```bash
NESTJS_API_URL=https://api.production.com
```

## 🐛 Troubleshooting

### Worker não conecta ao RabbitMQ

```
[ERROR] Falha ao conectar ao RabbitMQ
```

**Soluções**:
- Verifique se RabbitMQ está rodando
- Confirme URL de conexão
- Verifique credenciais
- Teste conectividade: `telnet rabbitmq 5672`

### Mensagens não são processadas

```
[NACK] Mensagem rejeitada
```

**Soluções**:
- Verifique logs de validação
- Confirme formato JSON da mensagem
- Verifique se API NestJS está respondendo
- Teste manualmente: `curl -X POST http://api/weather/logs`

### Erros de timeout

```
[ERROR] Erro ao enviar requisição: timeout
```

**Soluções**:
- Aumente timeout HTTP (30s padrão)
- Verifique latência da rede
- Confirme se API está responsiva

## 📚 Recursos Adicionais

- [RabbitMQ Go Client](https://github.com/rabbitmq/amqp091-go)
- [Go Testing](https://golang.org/pkg/testing/)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

## 🤝 Contribuindo

1. Crie testes para novas funcionalidades
2. Execute `go fmt ./...` antes de commitar
3. Execute `go vet ./...` para verificar erros
4. Mantenha cobertura de testes > 80%

## 📝 TODO

- [ ] Implementar métricas Prometheus
- [ ] Adicionar circuit breaker
- [ ] Configurar tracing distribuído (OpenTelemetry)
- [ ] Health check endpoint
- [ ] Melhorar logging estruturado

