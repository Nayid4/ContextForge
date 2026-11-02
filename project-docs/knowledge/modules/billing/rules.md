# Reglas del Módulo: billing

1. **`BR-BILL-001`**: La cabecera `Idempotency-Key` es obligatoria en checkout.
2. **`BR-BILL-002`**: Todo webhook exige validación criptográfica HMAC-SHA256 antes de procesar el cobro.
3. **`BR-BILL-003`**: El redondeo contable aplica Banker's Rounding (IEEE 754) a dos decimales exactos.
