from __future__ import annotations
import pytest
from domain.users import UserEntity, UserRole
from infrastructure.resilience import CircuitBreaker, CircuitBreakerOpenError, retry_with_backoff
from infrastructure.security import (
    FileValidator,
    JwtTokenService,
    PasswordHasher,
    SecretVaultAesGcm,
    SlidingWindowRateLimiter,
)


def test_aes256_gcm_secret_vault_and_masking() -> None:
    vault = SecretVaultAesGcm("super-master-secret-key-2026")
    ct1 = vault.encrypt("sk-live-secret-9876")
    ct2 = vault.encrypt("sk-live-secret-9876")
    assert ct1 != ct2  # Unique 96-bit random IV per encryption
    assert ct1.startswith("enc:v1:")
    assert vault.decrypt(ct1) == "sk-live-secret-9876"
    assert vault.mask("sk-live-secret-9876") == "****9876"


def test_password_hasher_jwt_and_file_magic_validator() -> None:
    pwd_hash = PasswordHasher.hash_password("ClaveSegura#2026")
    assert PasswordHasher.verify_password("ClaveSegura#2026", pwd_hash)
    assert not PasswordHasher.verify_password("Incorrecta", pwd_hash)

    jwt_svc = JwtTokenService("test-jwt-256-bit-secret-key-contextforge-v2", access_minutes=15)
    user = UserEntity("u-1", "arq@upc.edu.co", "Arquitecto UPC", pwd_hash, UserRole.CURATOR)
    pair = jwt_svc.issue_token_pair(user)
    verified = jwt_svc.verify_access_token(pair["access_token"])
    assert not verified.is_error and verified.value.role == UserRole.CURATOR

    # Reject disguised MZ executable even if renamed to .pdf!
    spoofed = FileValidator.validate("manual.pdf", b"MZ\x90\x00fake_pe_binary")
    assert spoofed.is_error and spoofed.first_error.code == "malicious_binary_signature"


def test_sliding_window_rate_limiter() -> None:
    limiter = SlidingWindowRateLimiter()
    assert not limiter.check("ip1", 2).is_error
    assert not limiter.check("ip1", 2).is_error
    third = limiter.check("ip1", 2)
    assert third.is_error and third.first_error.code == "rate_limit_exceeded"


@pytest.mark.asyncio
async def test_circuit_breaker_and_retry_with_backoff() -> None:
    attempts = 0

    async def flaky() -> str:
        nonlocal attempts
        attempts += 1
        if attempts < 3:
            raise RuntimeError("transient")
        return "recovered"

    res = await retry_with_backoff(flaky, max_attempts=3, base_delay_sec=0.01)
    assert res == "recovered" and attempts == 3

    cb = CircuitBreaker("test-llm", failure_threshold=2, recovery_timeout_sec=60.0)
    async def fail_always() -> None:
        raise ConnectionError("down")

    for _ in range(2):
        with pytest.raises(ConnectionError):
            await cb.call(fail_always)
    with pytest.raises(CircuitBreakerOpenError):
        await cb.call(fail_always)
