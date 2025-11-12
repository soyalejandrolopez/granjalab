#!/bin/bash

echo "🚀 Desplegando GranjaLab en Netlify"
echo ""

# Verificar si netlify-cli está instalado
if ! command -v netlify &> /dev/null; then
    echo "📦 Instalando Netlify CLI..."
    npm install -g netlify-cli
fi

echo "🔐 Iniciando sesión en Netlify..."
netlify login

echo "🔧 Inicializando sitio..."
netlify init

echo "📋 Configurando variables de entorno..."
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://zayxuwfnuqhnlzpwtezj.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpheXh1d2ZudXFobmx6cHd0ZXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTgyMTMsImV4cCI6MjA3ODUzNDIxM30.KQ4rhFkB0yo7fjNJZWle9LQ6iUbNdHpL94L2w3woeec"

echo "🏗️  Construyendo aplicación..."
npm run build

echo "🚀 Desplegando a producción..."
netlify deploy --prod

echo ""
echo "✅ ¡Despliegue completado!"
echo ""
echo "⚠️  IMPORTANTE: Después del deploy, debes:"
echo "1. Copiar la URL de Netlify que aparece arriba"
echo "2. Actualizar NEXT_PUBLIC_APP_URL con esa URL"
echo "3. Configurar las redirect URLs en Supabase"
