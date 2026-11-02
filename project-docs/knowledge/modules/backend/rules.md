# Reglas del Módulo: backend

1. **`BR-AUTH-001`**: Las marcas de expiración JWT deben calcularse exclusivamente en Epoch UTC.
2. **`BR-AUTH-002`**: Los roles permitidos son exclusivamente `ADMIN`, `OPERATOR`, `CUSTOMER`.
3. **`BR-CAT-001`**: La paginación de productos utiliza cursores (`after_id`) para latencia $< 50\text{ms}$.
4. **`BR-CART-001`**: Los carritos anónimos expiran en 24h (TTL en Redis).
5. **`BR-CART-002`**: Las adiciones al carrito verifican y descuentan stock de forma atómica.
