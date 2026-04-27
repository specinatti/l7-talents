#!/bin/bash

echo "🔒 L7 TALENTS - INSTALAÇÃO SEGURA"
echo "=================================="
echo ""

# 1. Install dependencies
echo "📦 Instalando dependências..."
npm install

# 2. Generate encryption key
echo ""
echo "🔑 Gerando chave de criptografia..."
ENCRYPTION_KEY=$(openssl rand -base64 32)
echo "ENCRYPTION_KEY gerada: $ENCRYPTION_KEY"

# 3. Update .env
echo ""
echo "📝 Atualizando .env..."
if grep -q "ENCRYPTION_KEY=" .env; then
    sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
else
    echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> .env
fi

# 4. Create necessary directories
echo ""
echo "📁 Criando diretórios..."
mkdir -p uploads logs

# 5. Set permissions
echo ""
echo "🔐 Configurando permissões..."
chmod 700 uploads logs
chmod 600 .env

# 6. Database setup
echo ""
echo "💾 Configurando banco de dados..."
if [ -n "$DATABASE_URL" ]; then
    echo "Executando init-secure.sql..."
    psql $DATABASE_URL -f database/init-secure.sql
    echo "✅ Banco de dados configurado!"
else
    echo "⚠️  DATABASE_URL não encontrada. Configure manualmente."
fi

# 7. Test server
echo ""
echo "🧪 Testando servidor..."
timeout 5 node server-secure.js &
sleep 3
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Servidor funcionando!"
else
    echo "❌ Erro ao iniciar servidor"
fi
pkill -f "node server-secure.js"

echo ""
echo "=================================="
echo "✅ INSTALAÇÃO COMPLETA!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Adicione ENCRYPTION_KEY no Railway:"
echo "   $ENCRYPTION_KEY"
echo ""
echo "2. Atualize Procfile:"
echo "   web: node server-secure.js"
echo ""
echo "3. Faça deploy:"
echo "   git add ."
echo "   git commit -m 'Add security features'"
echo "   git push"
echo ""
echo "4. Configure Cloudflare (recomendado)"
echo ""
echo "📖 Leia SECURITY.md para mais informações"
echo "=================================="
