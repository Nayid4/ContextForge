#!/usr/bin/env bash
# verify.sh — Script de Verificación Integral del Arnés SDD
# Encapsulado en project-docs/ para mantener la raíz limpia y universal.
# Cubre los 5 niveles de aseguramiento de calidad (Unit, White-Box, Black-Box, System, Load, E2E Playwright)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔍 Iniciando verificación integral de AI Agentic SDD Engineering Harness..."

echo "📦 1. Compilación y bundling..."
npm run build

echo "🧪 2. Pruebas unitarias nativas..."
npm test

echo "🌐 3. Pruebas de aceptación smoke ATDD..."
npm run test:e2e

echo "🔬 4. Pruebas de caja blanca (branch coverage)..."
npm run test:whitebox

echo "🎯 5. Pruebas de caja negra (BVA, clases de equivalencia y resiliencia)..."
npm run test:blackbox

echo "🔗 6. Pruebas de sistema e integración..."
npm run test:system

echo "⚡ 7. Pruebas de carga y rendimiento concurrente..."
npm run test:load

echo "🎭 8. Pruebas de aceptación E2E con Playwright (navegador real)..."
npm run test:acceptance

echo "💾 9. Sincronización y consistencia de datos..."
node sync-data.js

echo "✅ Verificación completada con éxito. Todos los niveles en verde."
