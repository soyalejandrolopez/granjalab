#!/bin/bash

echo "🔧 Configurando variables de entorno en Netlify..."
echo ""

# Verificar si netlify-cli está instalado
if ! command -v netlify &> /dev/null; then
    echo "📦 Instalando Netlify CLI..."
    npm install -g netlify-cli
fi

echo "🔐 Asegúrate de estar autenticado en Netlify..."
netlify status

echo ""
echo "📋 Configurando variables de entorno..."

netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://zayxuwfnuqhnlzpwtezj.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpheXh1d2ZudXFobmx6cHd0ZXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTgyMTMsImV4cCI6MjA3ODUzNDIxM30.KQ4rhFkB0yo7fjNJZWle9LQ6iUbNdHpL94L2w3woeec"
netlify env:set NEXT_PUBLIC_APP_URL "https://ornate-dasik-547146.netlify.app"

echo ""
echo "✅ Variables de entorno configuradas"
echo ""
echo "🚀 Triggering re-deploy..."
netlify deploy --prod --build

echo ""
echo "✅ ¡Listo! Tu aplicación se está re-desplegando con las variables de entorno correctas"
echo ""
echo "Espera 2-3 minutos y luego visita: https://ornate-dasik-547146.netlify.app"
