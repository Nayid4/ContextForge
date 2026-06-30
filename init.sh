#!/usr/bin/env bash
# init.sh — Verificación del harness .NET
# Debe terminar con exit code 0 y mensaje [OK] Entorno listo.
# Si falla en cualquier paso, termina con exit code != 0.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "${GREEN}[OK]${NC}   $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

echo ""
echo "=== .NET Harness — Verificación de entorno ==="
echo ""

# ─── 0. kickstart.json ──────────────────────────────────────────────────
echo "--- [0/6] kickstart.json ---"

if [[ ! -f "kickstart.json" ]]; then
    fail "kickstart.json no encontrado. Debe existir localmente (no está en git)."
fi
ok "kickstart.json existe (no trackeado en git)"

# ─── 1. .NET SDK ─────────────────────────────────────────────────────────
echo ""
echo "--- [1/6] .NET SDK ---"

if ! command -v dotnet &>/dev/null; then
    fail "dotnet CLI no encontrado en PATH."
fi

DOTNET_VERSION=$(dotnet --version 2>/dev/null || echo "")
if [[ -z "$DOTNET_VERSION" ]]; then
    fail "No se pudo determinar la versión de .NET SDK."
fi
ok "dotnet $DOTNET_VERSION"

# ─── 2. Harness docs ─────────────────────────────────────────────────────
echo ""
echo "--- [2/6] Harness docs ---"

REQUIRED_DOCS=(
    "AGENTS.md"
    "feature_list.json"
    "ENGINES.md"
    "docs/architecture.md"
    "docs/conventions.md"
    "docs/specs.md"
    "docs/verification.md"
    "progress/current.md"
    "progress/history.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
    if [[ ! -f "$doc" ]]; then
        fail "Archivo de harness faltante: $doc"
    fi
    ok "$doc"
done

# ─── 3. Git ──────────────────────────────────────────────────────────────
echo ""
echo "--- [3/6] Git ---"

if ! command -v git &>/dev/null; then
    fail "git no encontrado en PATH."
fi

BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [[ -z "$BRANCH" ]]; then
    fail "No se está dentro de un repositorio git."
fi
ok "Rama activa: $BRANCH"

if [[ "$BRANCH" == "master" || "$BRANCH" == "main" || "$BRANCH" == "dev" ]]; then
    warn "Estás en la rama base ($BRANCH). El trabajo debe hacerse en feature/*."
fi

if [[ ! "$BRANCH" =~ ^feature/ && ! "$BRANCH" =~ ^(main|master|dev)$ ]]; then
    warn "Rama '$BRANCH' no es main/master/dev ni feature/*. Se requiere aprobación humana."
fi

# ─── 4. Estado de progreso ───────────────────────────────────────────────
echo ""
echo "--- [4/6] Estado de progreso ---"

if [[ -f "progress/current.md" ]]; then
    CURRENT_CONTENT=$(grep -v "^\s*$" "progress/current.md" | grep -v "^#" | grep -v "^>" | grep -v "^- " | head -5 || true)
    if [[ -n "$CURRENT_CONTENT" ]]; then
        warn "progress/current.md no está vacío. Posible sesión previa no cerrada."
    else
        ok "progress/current.md limpio"
    fi
fi

# ─── 5. Solución .NET (opcional) ─────────────────────────────────────────
echo ""
echo "--- [5/6] Solución .NET ---"

SLNX=$(find . -maxdepth 1 -name "*.slnx" -o -name "*.sln" 2>/dev/null | head -1)

if [[ -z "$SLNX" ]]; then
    warn "No se encontró archivo de solución (.sln/.slnx) en la raíz. Si es la primera feature, es esperado."
else
    ok "Solución: $SLNX"

    echo ""
    echo "--- [6/6] Build y tests ---"
    if dotnet build "$SLNX" -c Release /warnaserror -v minimal 2>/dev/null | grep -q "Compilación correcta\|Build succeeded"; then
        ok "dotnet build /warnaserror — OK"
    else
        fail "dotnet build falló. Revisa los errores antes de continuar."
    fi

    if dotnet test "$SLNX" -c Release --no-build -v minimal 2>/dev/null | grep -q "Superado\|Passed"; then
        ok "dotnet test — OK"
    else
        warn "No se encontraron tests o alguno falló. Verifica manualmente."
    fi
fi

echo ""
echo -e "${GREEN}=== [OK] Entorno listo ===${NC}"
echo ""
