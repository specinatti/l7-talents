# Guia de Migração — L7 Talents

> Criado em: 28/06/2026  
> Status do repositório: **100% sincronizado com GitHub** (branch main, commit cb556e6)

---

## ✅ Status atual (máquina atual)

- Código-fonte: **totalmente commitado e enviado ao GitHub**
- Repositório: `https://github.com/specinatti/l7-talents.git`
- Banco de dados: **Railway (nuvem)** — não precisa migrar
- Deploy: **Railway (nuvem)** — não precisa migrar

---

## 📦 O que você precisa levar

### 1. Segredos do `.env` (salve antes de entregar a máquina)

Anote ou salve estes valores em local seguro (gerenciador de senhas, etc.):

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Conexão PostgreSQL no Railway |
| `JWT_SECRET` | Chave JWT da aplicação |
| `MP_ACCESS_TOKEN` | Mercado Pago — Access Token |
| `MP_PUBLIC_KEY` | Mercado Pago — Public Key |
| `SMTP_HOST` | Servidor de e-mail |
| `SMTP_PORT` | Porta SMTP |
| `SMTP_SECURE` | true/false |
| `SMTP_USER` | Usuário SMTP |
| `SMTP_PASS` | Senha SMTP |
| `SMTP_FROM` | E-mail remetente |
| `ZAPI_INSTANCE` | Z-API (WhatsApp) — Instance ID |
| `ZAPI_TOKEN` | Z-API (WhatsApp) — Token |
| `APP_URL` | URL da aplicação (muda por ambiente) |

> Os valores atuais estão no arquivo `.env` da máquina atual.

### 2. Token do GitHub

Arquivo `novo_token.github.txt` na raiz do projeto.  
Se o token expirou, gere um novo em: https://github.com/settings/tokens

### 3. Uploads de usuários

Pasta `public/uploads/` — verifique se há arquivos importantes (fotos de perfil etc.).  
Se houver, copie manualmente para pen drive ou nuvem.

---

## 🖥️ Configurar a máquina nova

### Pré-requisitos

- [Node.js LTS](https://nodejs.org) (versão 18 ou superior)
- [Git](https://git-scm.com)
- Conta no [GitHub](https://github.com) (specinatti)
- Conta no [Railway](https://railway.app)

### Passo a passo

**1. Clonar o projeto**
```bash
git clone https://github.com/specinatti/l7-talents.git
cd l7-talents
```

**2. Instalar dependências**
```bash
npm install
```

**3. Criar o arquivo `.env`**
```bash
cp .env.example .env
```
Edite o `.env` e preencha com os valores salvos do passo anterior.

**4. Testar localmente**
```bash
npm run dev
```
Acesse: http://localhost:3000

---

## 🚂 Railway (deploy em nuvem)

O projeto já está deployado no Railway. Nenhuma ação necessária no servidor.

**Para acessar o painel:**
1. Acesse https://railway.app
2. Faça login com a conta vinculada ao projeto
3. O projeto `l7-talents` já está lá com banco PostgreSQL e variáveis configuradas

**Para instalar a CLI do Railway na máquina nova (opcional):**
```bash
npm install -g @railway/cli
railway login
```

**Para ver/editar variáveis de ambiente no Railway:**
- Painel → projeto → aba "Variables"

---

## 🔑 Autenticação GitHub via HTTPS

Se precisar fazer push, configure o token:

```bash
git remote set-url origin https://SEU_TOKEN@github.com/specinatti/l7-talents.git
```

Ou use SSH:
```bash
ssh-keygen -t ed25519 -C "specinatti@l7talents.com"
# Adicione a chave pública em: https://github.com/settings/keys
git remote set-url origin git@github.com:specinatti/l7-talents.git
```

---

## 🗂️ Estrutura do projeto (referência rápida)

```
l7-talents/
├── src/
│   ├── server.js          # Servidor principal
│   ├── db/index.js        # Conexão PostgreSQL
│   ├── middleware/auth.js # JWT middleware
│   ├── controllers/       # Lógica de negócio
│   └── routes/            # Rotas da API
├── public/                # Frontend (HTML/CSS/JS)
│   ├── index.html
│   ├── pages/
│   ├── js/app.js
│   └── css/style.css
├── database/
│   └── schema.sql         # Schema completo do banco
├── .env                   # Variáveis locais (NÃO vai ao Git)
├── .env.example           # Template das variáveis
└── package.json
```

---

## ⚠️ Checklist antes de entregar a máquina

- [ ] Valores do `.env` anotados/salvos
- [ ] Token do GitHub salvo (`novo_token.github.txt`)
- [ ] Pasta `public/uploads/` verificada
- [ ] `git status` limpo (confirmado: tudo commitado)
- [ ] Login do Railway anotado
