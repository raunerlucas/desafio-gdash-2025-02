# Python Service - Weather Data Collector 🌤️

Serviço Python para coleta automática de dados climáticos da API Open-Meteo e publicação no RabbitMQ.

## ✨ Funcionalidades

- ✅ Coleta dados climáticos em tempo real (Open-Meteo API)
- ✅ Normaliza dados para formato JSON padronizado
- ✅ Publica mensagens no RabbitMQ com persistência
- ✅ Execução periódica configurável (padrão: 1 hora)
- ✅ Retry automático em caso de falha
- ✅ Logging estruturado e detalhado
- ✅ Suporte a múltiplas localizações

## 📁 Estrutura

```
python-service/
├── main.py              # Aplicação principal (198 linhas)
├── test_weather.py      # Script de teste
├── requirements.txt     # Dependências Python
├── Dockerfile          # Container Docker
└── README.md           # Esta documentação
```

## 🚀 Instalação e Execução

### Opção 1: Execução Local (sem Docker)

```bash
# 1. Navegar até a pasta
cd python-service

# 2. Criar ambiente virtual (recomendado)
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Configurar variáveis de ambiente
# Copiar .env da raiz do projeto ou configurar manualmente:
set RABBITMQ_HOST=localhost
set RABBITMQ_USER=admin
set RABBITMQ_PASSWORD=admin123
set LOCATION_LATITUDE=-23.5505
set LOCATION_LONGITUDE=-46.6333
set COLLECTION_INTERVAL=60

# 5. Executar
python main.py
```

### Opção 2: Docker (Recomendado)

```bash
# Da raiz do projeto
docker-compose up python-service

# Ou apenas este serviço + RabbitMQ
docker-compose up rabbitmq python-service
```

## 🧪 Testar Sem RabbitMQ

```bash
# Testar apenas a coleta de dados climáticos
python test_weather.py

# Saída esperada:
# Testing Weather Data Collection...
# --------------------------------------------------
# 
# ✅ Weather data collected successfully!
# 
# 📍 Location: -23.5505, -46.6333
# 🕐 Timestamp: 2025-11-19T19:30:00.000Z
# 🌡️  Temperature: 28.5°C
# 💧 Humidity: 65%
# 🌧️  Precipitation: 0 mm
# 💨 Wind Speed: 12.5 km/h
# ☁️  Weather Code: 0
# 🌤️  Description: Clear sky
```

## ⚙️ Configuração

### Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `WEATHER_API_URL` | `https://api.open-meteo.com/v1/forecast` | URL da API de clima |
| `WEATHER_API_KEY` | _(vazio)_ | Chave da API (não necessária para Open-Meteo) |
| `LOCATION_LATITUDE` | `-23.5505` | Latitude (São Paulo, Brasil) |
| `LOCATION_LONGITUDE` | `-46.6333` | Longitude (São Paulo, Brasil) |
| `COLLECTION_INTERVAL` | `3600` | Intervalo em segundos (3600 = 1 hora) |
| `RABBITMQ_HOST` | `rabbitmq` | Host do RabbitMQ |
| `RABBITMQ_PORT` | `5672` | Porta do RabbitMQ |
| `RABBITMQ_USER` | `admin` | Usuário do RabbitMQ |
| `RABBITMQ_PASSWORD` | `admin123` | Senha do RabbitMQ |
| `RABBITMQ_QUEUE` | `weather_data` | Nome da fila |

### Alterar Localização

Para coletar dados de outra cidade, encontre as coordenadas em [latlong.net](https://www.latlong.net/):

```bash
# Exemplo: Rio de Janeiro
LOCATION_LATITUDE=-22.9068
LOCATION_LONGITUDE=-43.1729

# Exemplo: Nova York
LOCATION_LATITUDE=40.7128
LOCATION_LONGITUDE=-74.0060
```

### Alterar Intervalo de Coleta

```bash
# A cada 30 minutos
COLLECTION_INTERVAL=1800

# A cada 10 minutos (apenas para testes)
COLLECTION_INTERVAL=600

# A cada 5 minutos (desenvolvimento)
COLLECTION_INTERVAL=300
```

## 📊 Formato de Dados

O serviço coleta e publica dados no seguinte formato JSON:

```json
{
  "timestamp": "2025-11-19T19:30:00.000Z",
  "location": {
    "latitude": -23.5505,
    "longitude": -46.6333,
    "timezone": "America/Sao_Paulo"
  },
  "current": {
    "temperature": 28.5,
    "humidity": 65,
    "precipitation": 0,
    "wind_speed": 12.5,
    "weather_code": 0,
    "time": "2025-11-19T16:30"
  }
}
```

### Weather Codes (Códigos de Clima)

| Código | Descrição |
|--------|-----------|
| 0 | Clear sky (Céu limpo) |
| 1-3 | Mainly clear to overcast (Parcialmente nublado a encoberto) |
| 45, 48 | Fog (Neblina) |
| 51-55 | Drizzle (Garoa) |
| 61-65 | Rain (Chuva) |
| 71-75 | Snow (Neve) |
| 80-82 | Rain showers (Pancadas de chuva) |
| 95-99 | Thunderstorm (Tempestade) |

## 📝 Logs

O serviço emite logs estruturados:

```
2025-11-19 19:30:00 - __main__ - INFO - Starting Weather Data Collector...
2025-11-19 19:30:05 - __main__ - INFO - Connected to RabbitMQ at rabbitmq:5672
2025-11-19 19:30:10 - __main__ - INFO - Weather data collected: Temp=28.5°C, Humidity=65%
2025-11-19 19:30:11 - __main__ - INFO - Message published to queue 'weather_data'
2025-11-19 19:30:11 - __main__ - INFO - Waiting 3600 seconds for next collection...
```

## 🐛 Troubleshooting

### Erro: "Cannot connect to RabbitMQ"

```bash
# Verificar se RabbitMQ está rodando
docker-compose ps rabbitmq

# Verificar logs do RabbitMQ
docker-compose logs rabbitmq

# Reiniciar RabbitMQ
docker-compose restart rabbitmq
```

### Erro: "HTTP 404 from Open-Meteo"

```bash
# Verifique as coordenadas
echo $LOCATION_LATITUDE
echo $LOCATION_LONGITUDE

# Teste manualmente a API
curl "https://api.open-meteo.com/v1/forecast?latitude=-23.5505&longitude=-46.6333&current=temperature_2m"
```

## 📚 Dependências

```
httpx>=0.25.0          # Cliente HTTP assíncrono
pika>=1.3.2            # Cliente RabbitMQ
python-dotenv>=1.0.0   # Carregar variáveis .env
schedule>=1.2.0        # Agendamento de tarefas
```

---

**Status:** ✅ Totalmente implementado e funcional  
**Versão:** 1.0.0  
**Última atualização:** 19/11/2025

