"""Consolidates modular Markdown files in docs/ers/ into docs/ers/ERS-MAESTRA.md."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ERS_DIR = ROOT / "docs" / "ers"

MODULE_FILES = [
    "01_introduccion_y_marco_metodologico.md",
    "02_analisis_problema_elicitacion_stakeholders_reingenieria.md",
    "03_casos_de_uso_y_requerimientos_funcionales.md",
    "04_requerimientos_no_funcionales_interfaces_y_otros.md",
    "05_modelado_agil_spidr_hu_scrum_xp.md",
    "06_arquitectura_trazabilidad_validacion_glosario_referencias.md",
]

HEADER = """# ESPECIFICACIÓN DE REQUISITOS DE SOFTWARE (ERS) Y PROPUESTA DE REINGENIERÍA FUNCIONAL — CONTEXTFORGE (`v2.0.0`)

> **Universidad Popular del Cesar (UPC)** — Facultad de Ingenierías y Tecnológicas  
> **Especialización en Ingeniería de Software** — Módulo: **Ingeniería de Requerimientos**  
> **Docente:** Esp. / Msc. Maribel Romero Mestre  
> **Autores:** Kathy Carolina Sagbini Daza y Nayid Junior Castellar Agamez  
> **Ciudad y Año:** Valledupar, Cesar — 2026  
> **Estándares:** IEEE Std 830-1998 · ISO/IEC/IEEE 29148:2018 · ISO/IEC 25010:2023 · SWEBOK v4.0 · FURPS+ · INVEST · SPIDR · UML 2.5 · Modelo C4 · APA 7.ª Edición

---

## Tabla de Contenido Maestra

1. [1. Introducción y Marco Metodológico](#1-introducción-y-marco-metodológico)
   - 1.1 Propósito del Documento
   - 1.2 Alcance del Producto (SDK Reutilizable + Plataforma Soberana Web/API/MCP)
   - 1.3 Audiencias Objetivo y Uso del Documento
   - 1.4 Definiciones, Acrónimos y Abreviaturas
   - 1.5 Referencias Normativas y Metodológicas
   - 1.6 Visión General y Estructura de la Especificación
2. [2. Análisis del Problema, Elicitación, Stakeholders y Reingeniería Funcional](#2-análisis-del-problema-elicitación-stakeholders-y-reingeniería-funcional)
   - 2.1 Planteamiento del Problema y Pregunta Problema
   - 2.2 Visión del Producto
   - 2.3 Objetivos del Sistema (`OG-01` y `OE-01`..`OE-06`)
   - 2.4 Proceso de Ingeniería, Elicitación y Negociación de Conflictos
   - 2.5 Identificación y Gestión de Stakeholders (Poder/Interés y Matriz RACI)
   - 2.6 Diagnóstico Crítico y Reingeniería (`AS-IS v1.0.0` vs. `TO-BE v2.0.0`)
   - 2.7 Catálogo Maestro de Reglas e Invariantes de Negocio (`BR-01`..`BR-16`)
3. [3. Modelo de Casos de Uso y Requerimientos Funcionales (`RF-*`)](#3-modelo-de-casos-de-uso-y-requerimientos-funcionales-rf--bajo-ieee-830--iso-29148)
   - 3.1 Especificación de Actores del Sistema (`ACT-01`..`ACT-07`)
   - 3.2 Catálogo y Fichas Descriptivas de Casos de Uso (`CU-01`..`CU-14`)
   - 3.3 Especificación Formal por *Bounded Context* (`PRJ`, `DOC`, `RAG`, `BND`, `COL`, `CFG` — 25 Fichas `RF-*`)
4. [4. Requerimientos No Funcionales (`RNF-*`), Interfaces Externas y Otros Requisitos](#4-requerimientos-no-funcionales-rnf--interfaces-externas-y-otros-requisitos)
   - 4.1 Requerimientos No Funcionales bajo Modelo FURPS+ e ISO/IEC 25010:2023 (`RNF-01`..`RNF-18`)
   - 4.2 Matriz Consolidada de Calidad de Producto ISO/IEC 25010:2023
   - 4.3 Requisitos de Interfaces Externas (`RIU-*`, `RIH-*`, `RIS-*`, `RIC-*`)
   - 4.4 Otros Requisitos Legales, Regulatorios e IA Responsable (`OR-01`..`OR-06`)
5. [5. Modelado Ágil: Historias de Usuario (`HU-*`), Desglose `SPIDR` y Acuerdos `Scrum / XP`](#5-modelado-ágil-historias-de-usuario-hu--desglose-spidr-y-acuerdos-scrum--xp)
   - 5.1 Desglose de Épicas Complejas con Técnica `SPIDR` (`EP-01`..`EP-06`)
   - 5.2 Catálogo de 20 Historias de Usuario (`HU-01`..`HU-20`) bajo Criterios `INVEST` y Tareas `TI-*`
   - 5.3 *Product Backlog* Priorizado y Plan de Releases
   - 5.4 Acuerdos de Calidad Ágil: `DoR`, `DoD` y Prácticas `XP`
6. [6. Modelado Arquitectónico, Diseño Detallado y Diagramas de Ingeniería](#6-modelado-arquitectónico-diseño-detallado-y-diagramas-de-ingeniería)
   - 6.1 Diagrama de Contexto C4 Nivel 1 (`Figura 1`)
   - 6.2 Diagrama de Contenedores C4 Nivel 2 (`Figura 2`)
   - 6.3 Diagrama General de Casos de Uso UML 2.5 (`Figura 3`)
   - 6.4 Diagrama de Clases UML del Dominio y Patrones GoF (`Figura 4`)
   - 6.5 Diagrama de Secuencia del Flujo Crítico Principal (`Figura 5`)
   - 6.6 Modelo Entidad-Relación Normalizado en 3FN (`Figura 6`)
7. [7. Validación de Requisitos, Matriz de Trazabilidad (`RTM`) y Control de Cambios](#7-validación-de-requisitos-matriz-de-trazabilidad-rtm-y-control-de-cambios)
8. [8. Conclusiones](#8-conclusiones)
9. [9. Referencias Bibliográficas (APA 7.ª Edición)](#9-referencias-bibliográficas)

---

"""


def build_master() -> Path:
    parts: list[str] = [HEADER]
    for filename in MODULE_FILES:
        mod_path = ERS_DIR / filename
        if not mod_path.exists():
            raise FileNotFoundError(f"Missing ERS module: {mod_path}")
        parts.append(mod_path.read_text(encoding="utf-8").strip())
        parts.append("\n\n---\n\n")

    master_path = ERS_DIR / "ERS-MAESTRA.md"
    master_text = "".join(parts).rstrip() + "\n"
    master_path.write_text(master_text, encoding="utf-8")
    print(f"Built {master_path} ({len(master_text):,} chars, {len(master_text.splitlines()):,} lines)")
    return master_path


if __name__ == "__main__":
    build_master()
