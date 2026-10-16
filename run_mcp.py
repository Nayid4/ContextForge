"""Punto de entrada STDIO para que Claude Code, Cursor o Antigravity ejecuten el servidor MCP localmente."""

from __future__ import annotations

import sys
from pathlib import Path

# Añadir src al path para importaciones limpias
sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from presentation.mcp.server import mcp_server

if __name__ == "__main__":
    # Ejecuta el protocolo MCP sobre Standard Input/Output (STDIO)
    mcp_server.run(transport="stdio")

