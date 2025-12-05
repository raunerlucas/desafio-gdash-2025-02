# API Backend - Sistema de Clima

## ✅ Implementação Completa

Esta API em NestJS + MongoDB implementa todos os requisitos solicitados:

### 🔐 Autenticação e Usuários
- ✅ Sistema completo de autenticação JWT
- ✅ CRUD completo de usuários (`/api/users`)
- ✅ Usuário admin padrão criado automaticamente
- ✅ Proteção de rotas com guards

### 🌤️ Sistema de Clima
- ✅ Endpoint para receber dados de clima (`POST /api/weather/logs`)
- ✅ Listagem com paginação e filtros (`GET /api/weather/logs`)
- ✅ Exportação em CSV e XLSX (`/api/weather/export.csv`, `/api/weather/export.xlsx`)
- ✅ Insights de IA com análises inteligentes (`/api/weather/insights`)
- ✅ Schema MongoDB `weather_logs` completo

### 🤖 Insights de IA
- ✅ Análise de tendências de temperatura
- ✅ Cálculos de médias, máximas e mínimas
- ✅ Recomendações baseadas nos dados históricos
- ✅ Processamento sob demanda via endpoint

### 🐾 Integração com API Pública (Opcional)
- ✅ Módulo Pokemon consumindo PokéAPI
- ✅ Listagem com paginação (`/api/pokemon`)
- ✅ Detalhes de Pokémon individual (`/api/pokemon/:id`)
- ✅ Proxy para não expor API externa ao frontend

## 🚀 Como Executar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar ambiente:**
   ```bash
   cp .env.example .env
   # Edite o .env com suas configurações
   ```

3. **Executar em desenvolvimento:**
   ```bash
   npm run start:dev
   ```

4. **Build para produção:**
   ```bash
   npm run build
   npm run start:prod
   ```

5. **Docker:**
   ```bash
   docker build -t climate-api .
   docker run -p 3000:3000 --env-file .env climate-api
   ```

## 📊 Funcionalidades Principais

### Dados de Clima
- Armazenamento no MongoDB com schema robusto
- Filtros por localização, data, paginação
- Exportação em múltiplos formatos
- Análises inteligentes com recomendações

### Sistema de Usuários
- Autenticação segura com JWT
- Hash de senhas com bcrypt
- Usuário admin padrão configurável
- CRUD completo protegido

### Integração Externa
- Consumo da PokéAPI de forma otimizada
- Paginação nativa
- Cache de imagens e dados
- Tratamento de erros robusto

## 🔧 Tecnologias

- **NestJS** - Framework Node.js
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação stateless
- **bcryptjs** - Hash de senhas
- **XLSX** - Exportação de planilhas
- **Axios** - Requisições HTTP

## 📝 Documentação

Veja `API_DOCS.md` para documentação completa dos endpoints.

---

3️⃣ API (NestJS + MongoDB)
A API em NestJS será o núcleo do sistema, responsável por:

Receber e armazenar os dados de clima;
Expor endpoints para consumo pelo frontend;
Orquestrar ou acionar a camada de IA;
Gerenciar usuários.
a) Dados de clima
Responsabilidades sugeridas:

Receber registros vindos do worker Go;
Armazenar em uma coleção no MongoDB (ex.: weather_logs);
Expor endpoints, como (exemplos):
GET /api/weather/logs — listar registros climáticos;
GET /api/weather/export.csv — exportar CSV;
GET /api/weather/export.xlsx — exportar XLSX;
GET ou POST /api/weather/insights — gerar e/ou retornar insights de IA.
Os insights de IA podem ser:

Gerados automaticamente quando novos dados são inseridos;
Calculados sob demanda (quando o frontend solicitar);
Atualizados de forma agendada.
💡 O importante é que o sistema seja capaz de usar os dados históricos de clima para produzir informações mais ricas, não apenas listar valores crus.

b) Usuários
Implementar um CRUD completo de usuários (ex.: /api/users);
Implementar autenticação (JWT ou similar);
Criar um usuário padrão automaticamente na inicialização (ex.: admin@example.com / 123456 — valores podem ser configuráveis via .env).
c) Integração com API pública (opcional)
Como parte opcional do desafio, implemente uma funcionalidade que consuma uma API pública com paginação, por exemplo:

PokéAPI — listagem de Pokémons + detalhe de um Pokémon;
Sugestão de funcionalidades (opcionais):

Endpoint no backend que consome a API externa — o frontend não chama a API pública diretamente;
Paginação simples;
Endpoint de detalhe de um item (ex.: Pokémon).
🌍 Tanto o nome dos endpoints quanto o desenho das rotas ficam totalmente a seu critério.