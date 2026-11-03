#!/usr/bin/env bash
# verify.sh — Script de Verificación Integral del Arnés SDD
# Generado a partir de project-spec.yaml
set -e

echo "🔍 Iniciando verificación integral de AI Agentic SDD Engineering Harness..."

echo "📦 1. Compilación y bundling..."
npm run build

echo "🧪 2. Pruebas unitarias nativas..."
npm test

echo "🌐 3. Pruebas de aceptación smoke..."
npm run test:e2e

echo "⚡ 4. Sincronización y consistencia de datos..."
node project-docs/sync-data.js

echo "✅ Verificación completada con éxito. Todos los niveles en verde."
