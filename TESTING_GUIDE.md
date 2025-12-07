# 🧪 Guia Completo de Testes - Sistema GDASH Weather

## 📋 Pré-requisitos

- **Docker** e **Docker Compose** instalados
- **Git** para clonar o repositório
- Portas livres: `3000`, `5173`, `27017`, `5672`, `15672`

## 🚀 Início Rápido (5 minutos)

### 1. Configuração Inicial

```bash
# Clone o repositório (se ainda não foi feito)
git clone <url-do-repositorio>
cd desafio-gdash-2025-02

# Configure variáveis de ambiente
cp .env.example .env

# Os valores padrão já funcionam, mas você pode editar se necessário
# Coordenadas padrão: São Paulo (-23.5505, -46.6333)
```

### 2. Subir Todo o Sistema

```bash
# Suba todos os serviços
docker-compose up -d

# Monitore os logs (opcional)
docker-compose logs -f

# Aguarde 2-3 minutos para inicialização completa
```

### 3. Acessar o Sistema

**URLs principais:**
- 🌐 **Frontend**: http://localhost:5173
- 🔧 **API Backend**: http://localhost:3000
- 🐰 **RabbitMQ Management**: http://localhost:15672

**Credenciais de login:**
- **Email**: `admin@gdash.com`
- **Senha**: `admin123`

### 4. Validação Rápida

✅ **Teste de 30 segundos:**

1. Acesse http://localhost:5173
2. Faça login com admin@gdash.com / admin123
3. Observe se aparecem dados climáticos no dashboard
4. Clique em "Exportar CSV" para testar exportação
5. Navegue para "Usuários" e "Explorar" no menu

## 🔍 Testes Detalhados por Componente

### 🌐 Frontend React (localhost:5173)

#### ✅ Tela de Login
```bash
# Acesse a aplicação
open http://localhost:5173

# Teste credenciais inválidas
Email: test@test.com | Senha: 123 ❌

# Teste credenciais válidas
Email: admin@gdash.com | Senha: admin123 ✅
```

#### ✅ Dashboard Principal
- **Cards de clima**: Temperatura, umidade, pressão
- **Gráficos**: Linha de temperatura e umidade
- **Insights de IA**: Cards com recomendações
- **Exportação**: Botões CSV e XLSX funcionando
- **Dados em tempo real**: Atualizados conforme coleta

#### ✅ Página de Usuários
- **Listagem**: Tabela com usuários
- **Criação**: Formulário de novo usuário
- **Edição**: Modal de editar usuário
- **Exclusão**: Confirmação de exclusão

#### ✅ Página Explorar (Pokemon)
- **Listagem**: Cards de Pokemon com paginação
- **Detalhes**: Modal com informações do Pokemon
- **Paginação**: Navegação entre páginas

### 🔧 Backend NestJS (localhost:3000)

#### ✅ Teste de Endpoints via cURL

```bash
# 1. Login e obter token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gdash.com","password":"admin123"}'

# Copie o access_token da resposta
export TOKEN="cole_seu_token_aqui"

# 2. Listar dados climáticos
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/weather/logs

# 3. Obter insights de IA
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/weather/insights

# 4. Exportar dados CSV
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/weather/export.csv \
  --output weather-data.csv

# 5. Listar usuários
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/users

# 6. Testar Pokemon API
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/pokemon?page=1&limit=20
```

#### ✅ Validação de Dados

```bash
# Verificar estrutura da resposta de clima
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/weather/logs | jq '.'

# Deve retornar:
# {
#   "data": [...],
#   "total": number,
#   "page": number,
#   "totalPages": number
# }
```

### 🐍 Python Service

#### ✅ Verificar Coleta de Dados

```bash
# Monitorar logs do serviço Python
docker-compose logs python-service -f

# Logs esperados:
# ✅ "Starting Weather Data Collector..."
# ✅ "Connected to RabbitMQ at rabbitmq:5672"
# ✅ "Weather data collected: Temp=25.5°C, Humidity=65%"
# ✅ "Message published to queue 'weather_data'"
# ✅ "Waiting 3600 seconds for next collection..."
```

#### ✅ Teste Manual da API Open-Meteo

```bash
# Testar API meteorológica diretamente
curl "https://api.open-meteo.com/v1/forecast?latitude=-23.5505&longitude=-46.6333&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m"

# Deve retornar dados JSON com weather atual
```

#### ✅ Forçar Coleta Imediata (Para Testes)

```bash
# Parar o serviço Python
docker-compose stop python-service

# Editar .env para intervalo menor (5 minutos)
# COLLECTION_INTERVAL=300

# Reiniciar serviço
docker-compose up -d python-service

# Monitorar coleta mais frequente
docker-compose logs python-service -f
```

### 🐹 Go Worker

#### ✅ Verificar Processamento

```bash
# Monitorar logs do worker Go
docker-compose logs go-worker -f

# Logs esperados:
# ✅ "[INFO] Iniciando Go Worker Service..."
# ✅ "[INFO] Worker iniciado com sucesso!"
# ✅ "[INFO] Mensagem recebida: location=São Paulo, temperature=25.5"
# ✅ "[INFO] Mensagem processada com sucesso"
```

#### ✅ Executar Testes Unitários

```bash
# Acessar container do Go Worker
docker-compose exec go-worker /bin/sh

# Dentro do container, executar testes
go test -v ./...

# Ou executar com coverage
go test -cover ./...
```

### 🐰 RabbitMQ

#### ✅ Interface de Gerenciamento

```bash
# Acessar painel administrativo
open http://localhost:15672

# Login: admin / admin123

# Verificar:
# ✅ Conexões ativas (Python e Go Worker)
# ✅ Fila 'weather_data' criada
# ✅ Mensagens sendo processadas
# ✅ Sem mensagens em erro
```

#### ✅ Verificar Filas via API

```bash
# Listar filas
curl -u admin:admin123 \
  http://localhost:15672/api/queues

# Verificar fila específica
curl -u admin:admin123 \
  http://localhost:15672/api/queues/%2F/weather_data
```

### 🗃️ MongoDB

#### ✅ Verificar Dados Armazenados

```bash
# Acessar MongoDB
docker-compose exec mongodb mongosh

# Dentro do MongoDB shell:
use gdash
show collections

# Verificar dados de clima
db.weatherlogs.find().limit(5).pretty()

# Verificar usuários
db.users.find().pretty()

# Contar registros
db.weatherlogs.countDocuments()
```

## 📊 Validação do Pipeline Completo

### 🔄 Fluxo End-to-End

```bash
# 1. Python coleta dados
docker-compose logs python-service | grep "Weather data collected" | tail -1

# 2. Dados enviados para RabbitMQ
# Verificar em http://localhost:15672 → Queues → weather_data

# 3. Go Worker processa
docker-compose logs go-worker | grep "processada com sucesso" | tail -1

# 4. API NestJS recebe
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/weather/logs?limit=1" | jq '.data[0]'

# 5. Frontend exibe
# Verificar dashboard em http://localhost:5173
```

### 📈 Monitoramento em Tempo Real

```bash
# Terminal 1: Logs gerais
docker-compose logs -f

# Terminal 2: Apenas Python
docker-compose logs python-service -f

# Terminal 3: Apenas Go Worker
docker-compose logs go-worker -f

# Terminal 4: Status dos containers
watch 'docker-compose ps'
```

## 🛠️ Resolução de Problemas

### ❌ Containers não sobem

```bash
# Verificar portas ocupadas
netstat -an | findstr :3000
netstat -an | findstr :5173
netstat -an | findstr :27017

# Parar todos os containers
docker-compose down

# Limpar volumes (CUIDADO: remove dados)
docker-compose down -v

# Reconstruir imagens
docker-compose build --no-cache

# Subir novamente
docker-compose up -d
```

### ❌ MongoDB não conecta

```bash
# Verificar logs do MongoDB
docker-compose logs mongodb

# Verificar se volume foi criado
docker volume ls | grep mongodb

# Resetar dados do MongoDB
docker-compose down
docker volume rm gdash-2025-02_mongodb_data
docker-compose up -d
```

### ❌ RabbitMQ com problemas

```bash
# Verificar logs
docker-compose logs rabbitmq

# Verificar conectividade
docker-compose exec python-service ping rabbitmq

# Resetar RabbitMQ
docker-compose restart rabbitmq
```

### ❌ Python não coleta dados

```bash
# Verificar logs detalhados
docker-compose logs python-service

# Testar conectividade externa
docker-compose exec python-service ping api.open-meteo.com

# Verificar variáveis de ambiente
docker-compose exec python-service env | grep -E "(WEATHER|RABBITMQ|LOCATION)"
```

### ❌ Frontend não carrega dados

```bash
# Verificar se API está funcionando
curl http://localhost:3000/api/weather/logs

# Verificar logs do backend
docker-compose logs backend

# Verificar console do browser (F12)
# Procurar erros de CORS ou autenticação
```

## ✅ Checklist de Validação Completa

### 🏗️ Infraestrutura
- [ ] ✅ Todos containers rodando (`docker-compose ps`)
- [ ] ✅ Volumes criados (`docker volume ls`)
- [ ] ✅ Networks funcionando (`docker network ls`)
- [ ] ✅ Variáveis de ambiente carregadas

### 🌐 Frontend (localhost:5173)
- [ ] ✅ Página de login acessível
- [ ] ✅ Login funciona com credenciais padrão
- [ ] ✅ Dashboard carrega sem erros
- [ ] ✅ Dados climáticos aparecem
- [ ] ✅ Gráficos renderizam
- [ ] ✅ Insights de IA exibidos
- [ ] ✅ Export CSV funciona
- [ ] ✅ Export XLSX funciona
- [ ] ✅ Navegação entre páginas
- [ ] ✅ CRUD de usuários operacional
- [ ] ✅ Página Pokemon carrega
- [ ] ✅ Interface responsiva

### 🔧 Backend (localhost:3000)
- [ ] ✅ API responde (`curl http://localhost:3000/api`)
- [ ] ✅ Autenticação JWT funciona
- [ ] ✅ Endpoints de clima funcionam
- [ ] ✅ Endpoints de usuários funcionam
- [ ] ✅ Endpoints de Pokemon funcionam
- [ ] ✅ Exportação CSV/XLSX funciona
- [ ] ✅ Insights de IA gerados
- [ ] ✅ Validação de dados ativa
- [ ] ✅ CORS configurado
- [ ] ✅ Logs estruturados

### 🐍 Python Service
- [ ] ✅ Container inicia sem erro
- [ ] ✅ Conecta com RabbitMQ
- [ ] ✅ Coleta dados da API Open-Meteo
- [ ] ✅ Publica mensagens na fila
- [ ] ✅ Logs informativos
- [ ] ✅ Tratamento de erros
- [ ] ✅ Intervalo de coleta configurável

### 🐹 Go Worker
- [ ] ✅ Container inicia sem erro
- [ ] ✅ Conecta com RabbitMQ
- [ ] ✅ Consome mensagens da fila
- [ ] ✅ Valida dados recebidos
- [ ] ✅ Envia para API NestJS
- [ ] ✅ ACK/NACK mensagens
- [ ] ✅ Logs detalhados
- [ ] ✅ Graceful shutdown
- [ ] ✅ Testes unitários passam

### 🐰 RabbitMQ
- [ ] ✅ Interface admin acessível (localhost:15672)
- [ ] ✅ Fila 'weather_data' criada
- [ ] ✅ Mensagens sendo processadas
- [ ] ✅ Sem mensagens em erro
- [ ] ✅ Conexões ativas (Python + Go)

### 🗃️ MongoDB
- [ ] ✅ Container funcional
- [ ] ✅ Banco 'gdash' criado
- [ ] ✅ Coleções criadas (weatherlogs, users)
- [ ] ✅ Dados sendo inseridos
- [ ] ✅ Usuário admin criado
- [ ] ✅ Índices configurados

### 🔄 Pipeline Completo
- [ ] ✅ Python → RabbitMQ (mensagens enviadas)
- [ ] ✅ RabbitMQ → Go Worker (mensagens consumidas)
- [ ] ✅ Go Worker → NestJS (dados enviados)
- [ ] ✅ NestJS → MongoDB (dados armazenados)
- [ ] ✅ MongoDB → Frontend (dados exibidos)
- [ ] ✅ IA Insights gerados corretamente
- [ ] ✅ Exportação funciona end-to-end

## 🎯 Cenários de Teste Específicos

### 🌡️ Teste de Dados Climáticos

```bash
# 1. Aguardar coleta automática (1 hora)
# OU forçar coleta imediata alterando COLLECTION_INTERVAL=60

# 2. Verificar no dashboard se aparecem:
# - Temperatura atual
# - Umidade
# - Velocidade do vento
# - Descrição do clima

# 3. Verificar gráficos históricos
# 4. Verificar insights de IA
```

### 👥 Teste CRUD Usuários

```bash
# 1. Login como admin
# 2. Ir para página "Usuários"
# 3. Criar novo usuário:
#    - Nome: "Teste"
#    - Email: "teste@gdash.com"
#    - Senha: "123456"
#    - Role: "user"
# 4. Editar usuário criado
# 5. Excluir usuário
```

### 🔍 Teste API Pública (Pokemon)

```bash
# 1. Ir para página "Explorar"
# 2. Verificar lista de Pokemon
# 3. Navegar pelas páginas
# 4. Clicar em um Pokemon para ver detalhes
# 5. Verificar informações completas
```

## 📝 Relatório de Teste

Ao final dos testes, você deve ter validado:

1. ✅ **Funcionalidade completa** do pipeline de dados
2. ✅ **Interface funcional** com todas as telas
3. ✅ **Autenticação** e segurança
4. ✅ **Exportação** de dados
5. ✅ **Insights de IA** sendo gerados
6. ✅ **Integração** com API pública
7. ✅ **Responsividade** da aplicação
8. ✅ **Performance** adequada
9. ✅ **Logs** informativos em todos serviços
10. ✅ **Tratamento de erros** robusto

## 🚀 Próximos Passos

Após validar todo o sistema:

1. **Criar branch** com seu nome
2. **Gravar vídeo** de demonstração (5 min)
3. **Fazer commit** das mudanças
4. **Abrir Pull Request**
5. **Incluir link do vídeo** no PR

---

**Sistema GDASH Weather está pronto para avaliação! 🎉**
