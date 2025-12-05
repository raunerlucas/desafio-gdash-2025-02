# 🚀 Quick Start Guide - Go Worker Service

## Em 5 Minutos

### 1️⃣ Pré-requisitos

```bash
# Você precisa de:
✅ Go 1.21+ instalado
✅ Docker (opcional)
✅ RabbitMQ rodando (ou via Docker)
```

### 2️⃣ Clone e Configure

```bash
# Entre na pasta do projeto
cd go-worker

# Configure variáveis de ambiente
cp .env.example .env

# Edite o .env se necessário
# Por padrão usa: rabbitmq:5672 e nestjs-api:3000
```

### 3️⃣ Teste

```bash
# Baixe dependências
go mod download

# Execute testes
go test ./...
```

**Resultado esperado:**
```
ok      go-worker/internal/config    0.234s
ok      go-worker/internal/models    0.156s
ok      go-worker/internal/processor 0.189s
```

### 4️⃣ Execute

**Opção A - Local (desenvolvimento):**
```bash
go run cmd/worker/main.go
```

**Opção B - Compilado:**
```bash
go build -o worker cmd/worker/main.go
./worker
```

**Opção C - Docker:**
```bash
docker build -t go-worker:latest .
docker run --rm \
  -e RABBITMQ_URL=amqp://guest:guest@host.docker.internal:5672/ \
  -e NESTJS_API_URL=http://host.docker.internal:3000 \
  go-worker:latest
```

### 5️⃣ Verifique

Quando o worker está rodando, você verá:

```
[INFO] Iniciando Go Worker Service...
[INFO] Configurações carregadas: Queue=weather_queue, API=http://nestjs-api:3000, MaxRetry=3
[INFO] Aguardando RabbitMQ estar disponível...
[INFO] Conectado ao RabbitMQ - fila: weather_queue
[INFO] Worker iniciado com sucesso!
[INFO] Aguardando mensagens na fila 'weather_queue'. Para sair pressione CTRL+C
```

---

## 📨 Teste com Mensagem

### Publicar Mensagem Manualmente no RabbitMQ

**Via Interface Web** (http://localhost:15672):
1. Login: `guest` / `guest`
2. Vá em **Queues** → **weather_queue**
3. Clique em **Publish message**
4. Cole no payload:

```json
{
  "location": "São Paulo, BR",
  "temperature": 25.5,
  "humidity": 65.0,
  "timestamp": "2025-06-15T14:30:00Z",
  "source": "OpenWeatherMap"
}
```

5. Clique **Publish message**

**Resultado no Worker:**
```
[INFO] Mensagem recebida: location=São Paulo, BR, temperature=25.5, humidity=65.0
[INFO] Enviando para API NestJS: POST http://nestjs-api:3000/api/weather/logs (tentativa 1)
[INFO] Resposta API: 201 Created
[INFO] Mensagem processada com sucesso: location=São Paulo, BR
[ACK] Mensagem confirmada
```

---

## 🐳 Docker Compose (Recomendado)

Se você tem Docker Compose no projeto pai, adicione:

```yaml
services:
  go-worker:
    build: ./go-worker
    environment:
      RABBITMQ_URL: amqp://guest:guest@rabbitmq:5672/
      NESTJS_API_URL: http://nestjs-api:3000
      QUEUE_NAME: weather_queue
      MAX_RETRY_ATTEMPTS: 3
    depends_on:
      - rabbitmq
      - nestjs-api
    restart: unless-stopped
```

Execute:
```bash
docker-compose up go-worker
```

---

## 🔧 Variáveis de Ambiente

| Variável | Obrigatória? | Padrão | Descrição |
|----------|-------------|--------|-----------|
| `RABBITMQ_URL` | ✅ | `amqp://guest:guest@rabbitmq:5672/` | URL RabbitMQ |
| `NESTJS_API_URL` | ✅ | `http://nestjs-api:3000` | URL API NestJS |
| `QUEUE_NAME` | ⚪ | `weather_queue` | Nome da fila |
| `WORKER_CONCURRENCY` | ⚪ | `5` | Workers concorrentes |
| `MAX_RETRY_ATTEMPTS` | ⚪ | `3` | Tentativas de retry |
| `RETRY_DELAY` | ⚪ | `2s` | Delay entre retries |

---

## ⚠️ Troubleshooting Rápido

### ❌ "Falha ao conectar ao RabbitMQ"

**Causa**: RabbitMQ não está rodando ou URL incorreta

**Solução**:
```bash
# Verifique se RabbitMQ está rodando
docker ps | grep rabbitmq

# Ou inicie RabbitMQ
docker run -d --name rabbitmq \
  -p 5672:5672 -p 15672:15672 \
  rabbitmq:3-management
```

### ❌ "Erro ao enviar para API: connection refused"

**Causa**: API NestJS não está rodando

**Solução**:
```bash
# Verifique se a API está respondendo
curl http://localhost:3000/api/weather/logs

# Ou ajuste a URL no .env
NESTJS_API_URL=http://localhost:3000
```

### ❌ "go: command not found"

**Causa**: Go não está instalado

**Solução**:
```bash
# Windows: Baixe de https://go.dev/dl/
# Mac: brew install go
# Linux: sudo apt install golang-go
```

---

## 📚 Próximos Passos

Depois de rodar o worker:

1. **Leia a documentação completa**: `README.md`
2. **Guia de desenvolvimento**: `DEVELOPMENT.md`
3. **Detalhes de implementação**: `IMPLEMENTATION.md`
4. **Adicione features**: Veja TODO no README

---

## 💡 Comandos Úteis (Makefile)

Se você tem `make` instalado:

```bash
make deps          # Baixa dependências
make test          # Roda testes
make build         # Compila binário
make run           # Executa worker
make docker-build  # Build Docker image
make clean         # Limpa build
```

---

## ✅ Checklist de Verificação

Antes de integrar com o sistema completo:

- [ ] Go 1.21+ instalado
- [ ] RabbitMQ rodando e acessível
- [ ] API NestJS rodando e acessível
- [ ] Fila `weather_queue` existe no RabbitMQ
- [ ] Testes passando (`go test ./...`)
- [ ] Worker conecta ao RabbitMQ
- [ ] Worker processa mensagem de teste
- [ ] API recebe dados do worker

---

## 🎉 Pronto!

O Go Worker Service está configurado e rodando!

Para parar o worker: `CTRL+C` (ele vai fazer graceful shutdown)

**Divirta-se! 🚀**

