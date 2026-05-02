#!/bin/bash

# Script para análise completa do projeto l7-talents
# Execução: bash analise_completa.sh

echo "=========================================="
echo "📊 ANÁLISE COMPLETA - l7-talents"
echo "=========================================="
echo ""

# 1. ESTRUTURA GERAL
echo "=========================================="
echo "1️⃣  ESTRUTURA GERAL DO PROJETO"
echo "=========================================="
pwd
echo ""
echo "Diretórios e arquivos raiz:"
ls -lah
echo ""

# 2. BACKEND
echo "=========================================="
echo "2️⃣  BACKEND"
echo "=========================================="

if [ -d "backend" ]; then
  echo "✓ Pasta backend encontrada"
  echo ""
  echo "Conteúdo:"
  ls -lah backend/
  echo ""
  
  if [ -f "backend/package.json" ]; then
    echo "📦 backend/package.json:"
    cat backend/package.json
    echo ""
  fi
  
  if [ -f "backend/server.js" ]; then
    echo "🔧 backend/server.js (primeiras 50 linhas):"
    head -50 backend/server.js
    echo ""
  fi
  
  if [ -f "backend/.env" ]; then
    echo "⚙️  backend/.env:"
    cat backend/.env
    echo ""
  else
    echo "❌ backend/.env NÃO EXISTE"
    echo ""
  fi
  
  if [ -d "backend/node_modules" ]; then
    echo "✓ node_modules instalado no backend"
    echo "Pacotes: $(ls backend/node_modules | wc -l)"
    echo ""
  else
    echo "❌ node_modules NÃO instalado no backend"
    echo ""
  fi
else
  echo "❌ Pasta backend NÃO encontrada"
  echo ""
fi

# 3. FRONTEND
echo "=========================================="
echo "3️⃣  FRONTEND"
echo "=========================================="

if [ -d "frontend" ]; then
  echo "✓ Pasta frontend encontrada"
  echo ""
  echo "Conteúdo:"
  ls -lah frontend/
  echo ""
  
  if [ -f "frontend/package.json" ]; then
    echo "📦 frontend/package.json:"
    cat frontend/package.json
    echo ""
  fi
  
  if [ -d "frontend/src" ]; then
    echo "📁 frontend/src/:"
    ls -lah frontend/src/
    echo ""
  fi
  
  if [ -f "frontend/.env" ]; then
    echo "⚙️  frontend/.env:"
    cat frontend/.env
    echo ""
  else
    echo "❌ frontend/.env NÃO EXISTE"
    echo ""
  fi
  
  if [ -d "frontend/node_modules" ]; then
    echo "✓ node_modules instalado no frontend"
    echo "Pacotes: $(ls frontend/node_modules | wc -l)"
    echo ""
  else
    echo "❌ node_modules NÃO instalado no frontend"
    echo ""
  fi
else
  echo "❌ Pasta frontend NÃO encontrada"
  echo ""
fi

# 4. BANCO DE DADOS
echo "=========================================="
echo "4️⃣  BANCO DE DADOS"
echo "=========================================="

if [ -d "database" ]; then
  echo "✓ Pasta database encontrada"
  ls -lah database/
  echo ""
else
  echo "❌ Pasta database NÃO encontrada"
  echo ""
fi

# 5. DOCKER
echo "=========================================="
echo "5️⃣  DOCKER"
echo "=========================================="

if [ -f "docker-compose.yml" ]; then
  echo "✓ docker-compose.yml encontrado"
  cat docker-compose.yml
  echo ""
else
  echo "❌ docker-compose.yml NÃO encontrado"
  echo ""
fi

if [ -f "Dockerfile" ]; then
  echo "✓ Dockerfile encontrado"
  cat Dockerfile
  echo ""
else
  echo "❌ Dockerfile NÃO encontrado"
  echo ""
fi

# 6. RESUMO
echo "=========================================="
echo "📋 RESUMO"
echo "=========================================="
echo "Data: $(date)"
echo "Diretório: $(pwd)"
echo ""

backend_exists=0
frontend_exists=0
backend_pkg=0
frontend_pkg=0
backend_server=0
backend_env=0
frontend_env=0

[ -d "backend" ] && backend_exists=1
[ -d "frontend" ] && frontend_exists=1
[ -f "backend/package.json" ] && backend_pkg=1
[ -f "frontend/package.json" ] && frontend_pkg=1
[ -f "backend/server.js" ] && backend_server=1
[ -f "backend/.env" ] && backend_env=1
[ -f "frontend/.env" ] && frontend_env=1

echo "Backend existe: $([ $backend_exists -eq 1 ] && echo '✓ SIM' || echo '❌ NÃO')"
echo "Frontend existe: $([ $frontend_exists -eq 1 ] && echo '✓ SIM' || echo '❌ NÃO')"
echo "Backend package.json: $([ $backend_pkg -eq 1 ] && echo '✓ SIM' || echo '❌ NÃO')"
echo "Frontend package.json: $([ $frontend_pkg -eq 1 ] && echo '✓ SIM' || echo '❌ NÃO')"
echo "Backend server.js: $([ $backend_server -eq 1 ] && echo '✓ SIM' || echo '❌ NÃO')"
echo "Backend .env: $([ $backend_env -eq 1 ] && echo '✓ SIM' || echo '❌ NÃO')"
echo "Frontend .env: $([ $frontend_env -eq 1 ] && echo '✓ SIM' || echo '❌ NÃO')"
echo ""
echo "=========================================="
echo "✅ Análise concluída!"
echo "=========================================="
