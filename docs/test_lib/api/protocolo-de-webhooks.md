---
title: Protocolo de Webhooks
module: api
library_id: test_lib
tags:
- webhooks
- seguridad
description: Especificación de firma de webhooks
---

# Protocolo de Webhooks

Todos los webhooks deben firmarse con HMAC-SHA256.

```python
def sign_payload(): pass
```
