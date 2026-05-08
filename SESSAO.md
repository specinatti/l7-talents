# L7 Talents — Sessão 08/05/2026

## Stack
- Node.js + Express, PostgreSQL (Railway), JWT, HTML/CSS/JS vanilla
- Repositório: https://github.com/specinatti/l7-talents
- Deploy: Railway (auto-deploy no push para main)
- Último commit: 73c5c6d

## Credenciais e Serviços

### Banco (Railway)
- DATABASE_URL: postgresql://postgres:allrYysYZCCVKkdMCdQIzYVVnuCOyegJ@yamanote.proxy.rlwy.net:46982/railway

### SMTP (privateemail.com)
- SMTP_HOST: smtp.privateemail.com
- SMTP_PORT: 465 / SMTP_SECURE: true
- SMTP_USER: rh@l7talents.online
- SMTP_FROM: rh@l7talents.online

### Mercado Pago
- MP_ACCESS_TOKEN: APP_USR-4255665955623496-050719-3774b28aaaeed0eb68fe2ea2148896ee-3387103184
- MP_PUBLIC_KEY: APP_USR-4b125498-f97d-43d0-9979-a9fcb7db8f04

### Z-API (WhatsApp)
- ZAPI_INSTANCE: 3F2D16C9D633413BB89DAAD251F5FC4A
- ZAPI_TOKEN: FD7970E1AA600A06C7F6449A
- Instância: l7talents (trial, expira em ~2 dias a partir de 08/05/2026)
- Precisa escanear QR Code no app.z-api.io para conectar o WhatsApp

### Contas administrativas
- specinatti@gmail.com / Bradesco@0 → role: admin (OTP por email, sem 2FA obrigatório)
- rh@l7talents.online → role: rh (OTP por email obrigatório)
- financeiro@l7talents.online → role: financeiro (OTP por email obrigatório)
- comercial@l7talents.online → role: financeiro (OTP por email obrigatório)

### Contatos de segurança (specinatti@gmail.com)
- Email alternativo: vincitore.corp@gmail.com
- WhatsApp: 11983186310

## Funcionalidades implementadas nesta sessão

### Segurança
- Bloqueio de acesso direto a /pages/ (server + Service Worker)
- OTP por email para todas as contas admin/rh/financeiro (substituiu TOTP)
- OTP enviado para email principal + alternativo + WhatsApp
- Session timeout: 30min para admin/rh/financeiro, 8h para candidato/empregador
- Tabela email_otp no banco (expires_at usa NOW() do banco para evitar bug de fuso)

### 2FA / OTP
- Página /pages/2fa.html com modo otp (login) e manage (gerenciar contatos)
- Campos: email alternativo + WhatsApp por conta admin
- Rota PUT /api/auth/email-alternativo salva email_alternativo e whatsapp

### Painel Admin (/pages/admin/dashboard.html)
- 4 abas: Monitor, Usuários, Design, Logs
- Rota /api/admin/usuarios (GET/POST/PUT) — só role admin
- Navbar com links Admin + Analytics + RH para role admin

### Planos e Pagamentos
- Pacote Teste R$5 (7 dias) adicionado
- Webhook MP: ao aprovar pagamento cria conta empregador + senha temporária + envia email
- Middleware planoAtivo: empregador sem plano recebe 402 → redireciona para /pages/planos.html
- Colunas: plano_ativo, plano_expira_em, senha_temporaria na tabela users
- Botão "Sou Empresa" na landing redireciona para /pages/planos.html

### WhatsApp (Z-API)
- utils/whatsapp.js: utilitário sendWhatsApp
- Nova candidatura → WhatsApp para empregador
- Status candidatura atualizado → WhatsApp para candidato
- Nova vaga compatível → WhatsApp direto para candidato (substituiu link wa.me)
- OTP de login enviado por WhatsApp para contas admin

### Correções
- perfil.html: funções JS fora de ordem (SyntaxError crítico) — corrigido
- login.html: div não fechada — corrigido
- authController: refresh() não passava req para generateToken — corrigido
- schema.sql: trigger trg_pedidos_updated antes da função — corrigido
- expires_at do OTP usando NOW() do banco (bug de fuso horário)
- authController duplicado (dois module.exports) — corrigido

## Estrutura de arquivos relevantes
```
src/
  server.js              # Rotas, middleware de bloqueio /pages/, PROTECTED_PATHS inclui /admin/
  db/index.js            # Pool + migrations (totp_secret, totp_enabled, email_alternativo, whatsapp, plano_ativo, plano_expira_em, senha_temporaria, email_otp)
  controllers/
    authController.js    # Login com OTP email, sendEmailOTP, verifyEmailOTP, updateEmailAlternativo
    pagamentosController.js  # PACOTES inclui teste R$5, webhook ativa plano + cria usuário
    empregadorController.js  # sendWhatsApp em notificarCandidatosMatch e updateStatusCandidatura
    vagaController.js    # sendWhatsApp ao empregador em nova candidatura
  middleware/
    auth.js              # auth, role, planoAtivo
  routes/
    auth.js              # PUT /email-alternativo
    admin.js             # GET/POST/PUT /admin/usuarios
    empregadores.js      # usa planoAtivo middleware
  utils/
    whatsapp.js          # sendWhatsApp via Z-API
database/
  schema.sql             # Inclui email_otp, colunas novas em users
public/
  pages/
    2fa.html             # Modos: otp (login), manage (contatos segurança)
    admin/dashboard.html # Monitor, Usuários, Design, Logs
    planos.html          # Inclui card Teste R$5
  js/app.js              # SESSION_TIMEOUT dinâmico, trata 402, link 2FA no navbar admin
  sw.js                  # Bloqueia navegação direta para /pages/ sem referer interno
```

## Pendências / Próximos passos
- Conectar WhatsApp no Z-API (escanear QR Code em app.z-api.io)
- Assinar plano Z-API (trial expira em ~2 dias)
- Configurar variáveis ZAPI_INSTANCE e ZAPI_TOKEN no Railway
- Testar fluxo completo de compra (pacote Teste R$5)
- Implementar deploy via Railway API no painel admin (precisava de Service ID + API Token do Railway)
- Mensagem de opt-in WhatsApp para novos usuários que cadastram número
