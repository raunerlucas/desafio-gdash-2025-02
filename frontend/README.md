🖥️ Frontend (React + Vite + Tailwind + shadcn/ui)
A aplicação frontend deve ser construída com React + Vite, estilizada com Tailwind e utilizando componentes do shadcn/ui.

Ela deve ter, no mínimo, essas áreas de funcionalidade:

🌦️ 1. Dashboard de Clima
O Dashboard será a página principal do sistema, exibindo:

Dados reais de clima da sua cidade/localização, obtidos via pipeline Python → Go → NestJS → MongoDB;
Insights de IA gerados a partir desses dados.
A forma de exibir essas informações é livre.

Você pode, por exemplo, incluir:

Cards principais (exemplos):

Temperatura atual
Umidade atual
Velocidade do vento
Condição (ensolarado, nublado, chuvoso, etc.)
Gráficos (exemplos):

Temperatura ao longo do tempo;
Probabilidade de chuva ao longo do tempo;
Tabela de registros (exemplo):

Data/hora
Local
Condição
Temperatura
Umidade
Botões para exportar CSV/XLSX (integração com os endpoints do backend).
Insights de IA (forma livre), como:

Texto explicativo (“Alta chance de chuva nas próximas horas”);
Cards com alertas (“Calor extremo”, “Clima agradável”);
Gráficos ou visualizações adicionais.
💡 Tudo acima são exemplos ilustrativos.
O requisito é: o Dashboard deve mostrar os dados de clima da região + insights de IA, mas você decide como isso será exibido (layout, tipos de gráfico, componentes etc.).

🌐 2. Página opcional – API pública paginada
Uma página (por exemplo, /explorar) consumindo a funcionalidade opcional do backend que integra com uma API pública paginada.

Exemplos de UX (apenas sugestões):

Lista de Pokémons com paginação + página de detalhes de um Pokémon;
Lista de personagens de Star Wars com paginação + detalhes de um personagem.
👤 3. Usuários
Requisitos para a parte de usuários:

Tela de login;
Rotas protegidas (somente usuário autenticado acessa o Dashboard);
CRUD de usuários (listar, criar, editar, remover);
Uso de componentes do shadcn/ui (Button, Input, Table, Dialog, Toast, etc.);
Feedback visual adequado (loading, erro, sucesso).
📁 Exportação de dados
O backend deve expor endpoints para exportar dados de clima em CSV e XLSX;
O frontend deve oferecer botões no Dashboard para fazer o download desses arquivos.
