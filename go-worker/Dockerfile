# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copia arquivos de dependências
COPY go.mod go.sum ./

# Download das dependências
RUN go mod download

# Copia o código fonte
COPY . .

# Build da aplicação
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o worker cmd/worker/main.go

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copia o binário da stage de build
COPY --from=builder /app/worker .

# Expõe variáveis de ambiente (documentação)
ENV RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
ENV NESTJS_API_URL=http://nestjs-api:3000
ENV QUEUE_NAME=weather_queue
ENV WORKER_CONCURRENCY=5
ENV MAX_RETRY_ATTEMPTS=3
ENV RETRY_DELAY=2s

# Executa o worker
CMD ["./worker"]

