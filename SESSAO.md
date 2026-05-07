# L7 Talents - Estado do Projeto (sessão 02/05/2026)

## Repositório
- GitHub: https://github.com/specinatti/l7-talents
- Branch: main
- Último commit: 496508c - substituir logo JPEG por SVG vetorial
- Token GitHub: novo_token.github.txt (na pasta do projeto, NÃO commitado)

## Deploy
- Railway: https://l7-talents-production.up.railway.app
- Deploy automático a cada push no main

## Variáveis de ambiente no Railway
- DATABASE_URL: PostgreSQL Railway
- JWT_SECRET: e4cf2239a17bf92aed669e6cb436edc83b3440b8d7f2605bc36244238e45d94b
- NODE_ENV: production
- ADMIN_EMAIL / CONTACT_EMAIL: comercial@l7talents.online

## Contas no banco de produção
- vincitore.corp@gmail.com | senha: Bradesco@0 | role: candidato
- sre@vincitore.space | role: empregador
- comercial@l7talents.online | senha: L7rh@mogi2026 | role: financeiro (Letícia)

## Identidade visual
- Creme principal: #FAF7F4
- Creme secundário: #F2EDE8
- Rose/vinho: #B85C6E
- Navy: #1B2A4A
- Fontes: Playfair Display (títulos) + Inter (corpo)
- Logo: SVG vetorial em /public/images/l7-logo.svg

## Funcionalidades implementadas
1. Portal completo candidato + empregador
2. Onboarding animado em todo carregamento (cores creme)
3. Bloqueio de vagas para não logados
4. Troca e recuperação de senha (token 1h)
5. Segurança: JWT 2h, timeout 30min, rate limit, headers
6. Cache busting automático
7. Role financeiro: dashboard analytics (KPIs, 5 gráficos, monitoramento)
8. Endpoint /api/financeiro/analytics com cache 2min
9. Endpoint /api/financeiro/monitor (uptime, DB, memória, log erros)
10. Visualizador docs markdown (/pages/financeiro/markdown.html)
11. Documentação técnica + LGPD (/pages/financeiro/docs.html)
12. Mobile responsive: hamburger + drawer lateral
13. Logo SVG em todas as páginas

## Pendências
- Configurar SMTP para emails reais de reset de senha
- Configurar APP_URL no Railway
- Upgrade Railway plano pago
- Cadastrar UptimeRobot para monitoramento externo

## Arquivos importantes
- src/server.js
- src/controllers/authController.js
- src/controllers/analyticsController.js
- src/routes/financeiro.js
- public/css/style.css
- public/js/app.js
- public/index.html
- public/pages/financeiro/dashboard.html
- public/pages/financeiro/docs.html
- public/pages/financeiro/markdown.html
- database/schema.sql
