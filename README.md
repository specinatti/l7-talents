# L7 Talents - Portal de RH

Portal completo de recrutamento com área de candidatos e empregadores.

## Stack

- **Backend**: Node.js + Express
- **Banco**: PostgreSQL (Railway)
- **Auth**: JWT + bcryptjs
- **Frontend**: HTML/CSS/JS vanilla

## Funcionalidades

### Candidatos
- Cadastro e login
- Perfil completo (experiências, formações, habilidades)
- Busca de vagas com filtros
- Candidatura com carta de apresentação
- Acompanhamento de candidaturas
- Chat com recrutadores
- Salvar vagas favoritas
- Notificações

### Empregadores
- Cadastro e login
- Perfil da empresa
- CRUD completo de vagas
- Gestão de candidatos por vaga
- Atualização de status das candidaturas
- Chat com candidatos
- Dashboard com métricas

## Instalação local

```bash
npm install
cp .env.example .env
# Edite .env com suas credenciais
npm run dev
```

## Deploy no Railway

1. Crie um projeto no [Railway](https://railway.app)
2. Adicione um serviço PostgreSQL
3. Conecte o repositório GitHub
4. Configure as variáveis de ambiente:
   - `DATABASE_URL` → copiada do serviço PostgreSQL
   - `JWT_SECRET` → gere com: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - `NODE_ENV` → `production`
5. O banco é inicializado automaticamente no primeiro start

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL de conexão PostgreSQL |
| `JWT_SECRET` | Chave secreta para JWT |
| `NODE_ENV` | `production` ou `development` |
| `PORT` | Porta (Railway define automaticamente) |

## Estrutura

```
src/
  server.js          # Servidor principal
  db/index.js        # Conexão PostgreSQL
  middleware/auth.js # Middleware JWT
  controllers/       # Lógica de negócio
  routes/            # Definição de rotas
database/
  schema.sql         # Schema completo
public/
  index.html         # Landing page
  css/style.css      # Design system
  js/app.js          # Helpers frontend
  pages/
    login.html
    cadastro.html
    vagas.html
    vaga.html
    candidato/        # Área do candidato
    empregador/       # Área do empregador
```
