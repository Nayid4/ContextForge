"""Phase 1 Team Mode Tests: Login, Forced Password Change, Admin Bootstrap, Owner Role (BR-23), Members RBAC & TRUSTED_PROXIES."""

from __future__ import annotations

from pathlib import Path
from types import SimpleNamespace
import pytest
from httpx import ASGITransport, AsyncClient

from domain.users import UserEntity, UserRole
from infrastructure.di import get_container
from infrastructure.options import EnvironmentOptions
from infrastructure.persistence.seed_data import resolve_bootstrap_admin_password
from main import app
from presentation.api.dependencies.auth_guards import get_client_ip


def test_bootstrap_admin_password_random_in_enterprise_and_env_override(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("PYTEST_CURRENT_TEST", raising=False)
    monkeypatch.delenv("CONTEXTFORGE_BOOTSTRAP_ADMIN_PASSWORD", raising=False)

    pwd_rand, must_change, is_random = resolve_bootstrap_admin_password(auth_mode="enterprise_rbac", app_env="prod")
    assert len(pwd_rand) >= 16
    assert pwd_rand != "Admin123!"
    assert must_change is True
    assert is_random is True

    monkeypatch.setenv("CONTEXTFORGE_BOOTSTRAP_ADMIN_PASSWORD", "Sup3rS3cur3Boot!")
    pwd_env, must_change_env, is_random_env = resolve_bootstrap_admin_password(auth_mode="enterprise_rbac", app_env="prod")
    assert pwd_env == "Sup3rS3cur3Boot!"
    assert must_change_env is False
    assert is_random_env is False


def test_trusted_proxies_and_strict_bind_defaults(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("CONTEXTFORGE_STRICT_BIND_CHECK", raising=False)
    monkeypatch.setenv("TRUSTED_PROXIES", "127.0.0.1,10.0.0.0/8")
    opts = EnvironmentOptions.from_env()
    assert opts.strict_bind_check is True
    assert opts.trusted_proxies == ("127.0.0.1", "10.0.0.0/8")

    # Spoofed X-Forwarded-For from an UNTRUSTED client must be ignored
    untrusted_req = SimpleNamespace(
        client=SimpleNamespace(host="198.51.100.77"),
        headers={"X-Forwarded-For": "203.0.113.9"},
    )
    assert get_client_ip(untrusted_req, trusted_proxies=("10.0.0.0/8",)) == "198.51.100.77"

    # X-Forwarded-For from a TRUSTED reverse proxy resolves the real client IP
    trusted_req = SimpleNamespace(
        client=SimpleNamespace(host="10.0.0.15"),
        headers={"X-Forwarded-For": "203.0.113.9, 10.0.0.15"},
    )
    assert get_client_ip(trusted_req, trusted_proxies=("10.0.0.0/8",)) == "203.0.113.9"

    # Docker compose defaults: enterprise_rbac and 127.0.0.1 bind
    compose_text = (Path(__file__).resolve().parent.parent.parent / "docker-compose.yml").read_text(encoding="utf-8")
    assert "AUTH_MODE:-enterprise_rbac" in compose_text
    assert "CONTEXTFORGE_BIND_HOST:-127.0.0.1" in compose_text
    assert "CONTEXTFORGE_STRICT_BIND_CHECK" in compose_text


@pytest.mark.asyncio
async def test_login_forced_password_change_and_enterprise_browser_redirect() -> None:
    c = get_container()
    await c.initialize_runtime()

    # Create a user that MUST change password on first login
    boot_user = UserEntity(
        user_id="usr-f1-temp",
        email="f1.temp@contextforge.local",
        full_name="Usuario Temporal F1",
        password_hash=c.password_hasher.hash_password("TempPass123!"),
        role=UserRole.CURATOR,
        is_active=True,
        must_change_password=True,
    )
    await c.user_repo.save_user(boot_user)

    prev_mode = c.settings.env.auth_mode
    object.__setattr__(c.settings.env, "auth_mode", "enterprise_rbac")
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # 1) Unauthenticated browser HTML navigation redirects to /login
            redir = await client.get("/docs/browser", headers={"Accept": "text/html"}, follow_redirects=False)
            assert redir.status_code == 302
            assert "/login" in redir.headers["location"]

            # /login and /change-password render 200
            login_html = await client.get("/login")
            assert login_html.status_code == 200 and "Iniciar sesión" in login_html.text
            cp_html = await client.get("/change-password")
            assert cp_html.status_code == 200 and "Actualiza tu contraseña" in cp_html.text

            # 2) Login returns must_change_password=True and sets HttpOnly cookie
            login_res = await client.post(
                "/api/v1/auth/login",
                json={"email": "f1.temp@contextforge.local", "password": "TempPass123!"},
            )
            assert login_res.status_code == 200
            body = login_res.json()
            assert body["must_change_password"] is True
            tok = body["access_token"]
            hdr = {"Authorization": f"Bearer {tok}"}

            # 3) Accessing protected endpoints before password change is blocked (403 password_change_required)
            blocked = await client.get("/api/v1/projects", headers=hdr)
            assert blocked.status_code == 403
            assert blocked.json()["code"] == "password_change_required"

            # 4) Changing password clears flag, issues fresh JWT, and unlocks access
            cp_res = await client.post(
                "/api/v1/auth/change-password",
                headers=hdr,
                json={"current_password": "TempPass123!", "new_password": "NewStrongPassword!9"},
            )
            assert cp_res.status_code == 200
            new_tok = cp_res.json()["access_token"]
            assert cp_res.json()["must_change_password"] is False

            unlocked = await client.get("/api/v1/projects", headers={"Authorization": f"Bearer {new_tok}"})
            assert unlocked.status_code == 200
    finally:
        object.__setattr__(c.settings.env, "auth_mode", prev_mode)


@pytest.mark.asyncio
async def test_owner_role_permissions_and_br23_last_owner_protection() -> None:
    c = get_container()
    await c.initialize_runtime()

    owner_user = UserEntity(
        user_id="usr-f1-owner",
        email="f1.owner@contextforge.local",
        full_name="Proyecto Owner F1",
        password_hash=c.password_hasher.hash_password("OwnerPass123!"),
        role=UserRole.CONSUMER,
        is_active=True,
        must_change_password=False,
    )
    curator_user = UserEntity(
        user_id="usr-f1-curator",
        email="f1.curator@contextforge.local",
        full_name="Curador F1",
        password_hash=c.password_hasher.hash_password("CuratorPass123!"),
        role=UserRole.CURATOR,
        is_active=True,
        must_change_password=False,
    )
    await c.user_repo.save_user(owner_user)
    await c.user_repo.save_user(curator_user)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create dedicated project and assign usr-f1-owner as sole Owner
        await client.post("/api/v1/projects", json={"slug": "f1-team-proj", "name": "Proyecto Equipo F1"})
        add_owner = await client.post(
            "/api/v1/projects/f1-team-proj/members",
            json={"user_id": "usr-f1-owner", "role": "Owner"},
        )
        assert add_owner.status_code == 201

        # Verify /projects renders the Members modal UI
        proj_html = await client.get("/projects")
        assert proj_html.status_code == 200 and "openMembersModal" in proj_html.text

    prev_mode = c.settings.env.auth_mode
    object.__setattr__(c.settings.env, "auth_mode", "enterprise_rbac")
    try:
        owner_hdr = {"Authorization": f"Bearer {c.jwt_service.issue_token_pair(owner_user)['access_token']}"}
        curator_hdr = {"Authorization": f"Bearer {c.jwt_service.issue_token_pair(curator_user)['access_token']}"}

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # 1) Curator CANNOT manage project members (403)
            cur_forbid = await client.post(
                "/api/v1/projects/f1-team-proj/members",
                headers=curator_hdr,
                json={"user_id": "usr-f1-curator", "role": "Consumer"},
            )
            assert cur_forbid.status_code == 403

            # 2) Project Owner CAN add members to their project, but CANNOT read global /metrics (403)
            own_add = await client.post(
                "/api/v1/projects/f1-team-proj/members",
                headers=owner_hdr,
                json={"user_id": "usr-f1-curator", "role": "Curator"},
            )
            assert own_add.status_code == 201

            own_metrics = await client.get("/metrics", headers=owner_hdr)
            assert own_metrics.status_code == 403

            # 3) BR-23: Removing OR demoting the LAST Owner is blocked with 409 Conflict
            del_last = await client.delete("/api/v1/projects/f1-team-proj/members/usr-f1-owner", headers=owner_hdr)
            assert del_last.status_code == 409
            assert del_last.json()["code"] == "last_owner_protected"

            demote_last = await client.post(
                "/api/v1/projects/f1-team-proj/members",
                headers=owner_hdr,
                json={"user_id": "usr-f1-owner", "role": "Curator"},
            )
            assert demote_last.status_code == 409
            assert demote_last.json()["code"] == "last_owner_protected"

            # 4) Once a second Owner is added, the first Owner can be removed cleanly
            await client.post(
                "/api/v1/projects/f1-team-proj/members",
                headers=owner_hdr,
                json={"user_id": "usr-f1-curator", "role": "Owner"},
            )
            del_ok = await client.delete("/api/v1/projects/f1-team-proj/members/usr-f1-owner", headers=owner_hdr)
            assert del_ok.status_code == 200 and del_ok.json()["removed"] is True
    finally:
        object.__setattr__(c.settings.env, "auth_mode", prev_mode)
