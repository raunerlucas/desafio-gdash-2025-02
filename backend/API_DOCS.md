# API Documentation

## Endpoints Implementados

### Autenticação
- `POST /api/auth/login` - Login de usuário
  - Body: `{ email: string, password: string }`
  - Response: `{ access_token: string, user: { _id, email, name, role } }`

### Usuários
- `GET /api/users` - Listar todos os usuários (autenticado)
- `POST /api/users` - Criar novo usuário (autenticado)
- `GET /api/users/profile` - Obter perfil do usuário logado (autenticado)
- `GET /api/users/:id` - Obter usuário por ID (autenticado)
- `PATCH /api/users/:id` - Atualizar usuário (autenticado)
- `DELETE /api/users/:id` - Excluir usuário (autenticado)

### Clima (Weather)
- `POST /api/weather/logs` - Criar novo registro de clima (autenticado)
- `GET /api/weather/logs` - Listar registros de clima com paginação (autenticado)
  - Query params: `page`, `limit`, `location`, `startDate`, `endDate`
- `GET /api/weather/export.csv` - Exportar dados em CSV (autenticado)
- `GET /api/weather/export.xlsx` - Exportar dados em XLSX (autenticado)
- `GET /api/weather/insights` - Obter insights de IA sobre os dados (autenticado)

### Pokemon (Opcional)
- `GET /api/pokemon` - Listar Pokémons da PokéAPI com paginação (autenticado)
  - Query params: `page`, `limit`
- `GET /api/pokemon/:id` - Obter detalhes de um Pokémon (autenticado)

## Autenticação

Todos os endpoints (exceto `/api/auth/login`) requerem autenticação via JWT Bearer Token.

Header: `Authorization: Bearer <token>`

## Usuário Padrão

Na inicialização, um usuário admin é criado automaticamente:
- Email: `admin@example.com` (configurável via ADMIN_EMAIL)
- Password: `123456` (configurável via ADMIN_PASSWORD)

## Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/climate-db
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=123456
POKEMON_API_URL=https://pokeapi.co/api/v2
```

## Como Executar

1. Instalar dependências:
   ```bash
   npm install
   ```

2. Configurar MongoDB (local ou remoto)

3. Configurar variáveis de ambiente no arquivo `.env`

4. Executar em modo desenvolvimento:
   ```bash
   npm run start:dev
   ```

5. Ou compilar e executar em produção:
   ```bash
   npm run build
   npm run start:prod
   ```

## Docker

Para executar com Docker:

```bash
docker build -t climate-api .
docker run -p 3000:3000 --env-file .env climate-api
```

## Schemas MongoDB

### Users
```javascript
{
  email: String (required, unique),
  password: String (required, hashed),
  name: String (required),
  role: String (default: 'user'),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Weather Logs
```javascript
{
  location: String (required),
  temperature: Number (required),
  humidity: Number (required),
  pressure: Number (required),
  description: String,
  windSpeed: Number,
  windDirection: String,
  visibility: Number,
  uvIndex: Number,
  timestamp: Date (default: Date.now),
  source: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Insights de IA

O endpoint `/api/weather/insights` analisa os dados históricos e retorna:

- Temperaturas média, máxima e mínima
- Umidade e pressão médias
- Tendência de temperatura (subindo/descendo/estável)
- Recomendações baseadas nos dados
- Período de análise e total de registros
