---
title: "Guía de Diagnóstico: Timeouts en Webhooks de Stripe"
module: "troubleshooting"
tags: ["troubleshooting", "webhooks", "stripe", "network"]
author: "SRE Lead"
version: "1.1.0"
last_updated: "2026-10-01"
importance: "normal"
---

# Guía de Diagnóstico: Timeouts en Webhooks de Stripe

## Síntoma
El dashboard de Stripe muestra reintentos continuos con estado `HTTP 504 Gateway Timeout` hacia el endpoint `/api/webhooks/stripe`.

## Causa Raíz Frecuente
El handler del webhook estaba ejecutando transacciones pesadas de base de datos antes de responder `HTTP 200 OK` a Stripe. Stripe impone un límite estricto de 5 segundos para recibir la confirmación.

## Solución y Regla de Oro
1. Validar la firma HMAC `Stripe-Signature` inmediatamente.
2. Encolar el payload sin procesar en Redis o RabbitMQ.
3. Responder `HTTP 200 OK` inmediatamente (latencia esperada: &lt; 50ms).
4. El worker asíncrono procesa el evento fuera del ciclo HTTP.

