"""Async HMAC-SHA256 signed Webhook Dispatcher with strict HTTPS, DNS+IP SSRF protection, no redirects & encrypted secrets (BR-22)."""

from __future__ import annotations

import hashlib
import hmac
import ipaddress
import json
import socket
import time
from typing import Any, Callable
from urllib.parse import urlparse
import httpx

from domain.projects.webhook_entity import WebhookEntity


class WebhookDispatcher:
    """Dispatches HTTPS-only webhook events with DNS+CIDR SSRF blocking, follow_redirects=False & HMAC-SHA256 anti-replay."""

    BLOCKED_HOST_SUFFIXES: tuple[str, ...] = (".localhost", ".local", ".internal", ".localdomain")
    BLOCKED_HOSTS: frozenset[str] = frozenset({"localhost", "metadata.google.internal", "metadata"})
    FORBIDDEN_IPV4_NETS: tuple[ipaddress.IPv4Network, ...] = (
        ipaddress.IPv4Network("0.0.0.0/8"),
        ipaddress.IPv4Network("10.0.0.0/8"),
        ipaddress.IPv4Network("100.64.0.0/10"),
        ipaddress.IPv4Network("127.0.0.0/8"),
        ipaddress.IPv4Network("169.254.0.0/16"),
        ipaddress.IPv4Network("172.16.0.0/12"),
        ipaddress.IPv4Network("192.168.0.0/16"),
        ipaddress.IPv4Network("224.0.0.0/4"),
        ipaddress.IPv4Network("240.0.0.0/4"),
    )
    FORBIDDEN_IPV6_NETS: tuple[ipaddress.IPv6Network, ...] = (
        ipaddress.IPv6Network("::/128"),
        ipaddress.IPv6Network("::1/128"),
        ipaddress.IPv6Network("fc00::/7"),
        ipaddress.IPv6Network("fe80::/10"),
        ipaddress.IPv6Network("ff00::/8"),
    )

    @classmethod
    def _is_forbidden_ip(cls, raw_ip: str) -> bool:
        try:
            ip = ipaddress.ip_address(raw_ip.split("%")[0].strip("[]"))
        except ValueError:
            return False
        if isinstance(ip, ipaddress.IPv6Address):
            if ip.ipv4_mapped is not None:
                return cls._is_forbidden_ip(str(ip.ipv4_mapped))
            if any(ip in net for net in cls.FORBIDDEN_IPV6_NETS):
                return True
        elif isinstance(ip, ipaddress.IPv4Address):
            if any(ip in net for net in cls.FORBIDDEN_IPV4_NETS):
                return True
        return (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip.is_unspecified
        )

    @classmethod
    def is_valid_url(cls, url: str) -> bool:
        parsed = urlparse((url or "").strip())
        # Strict HTTPS only (blocks plaintext http:// and non-http schemes)
        if parsed.scheme != "https" or not parsed.netloc:
            return False
        host = (parsed.hostname or "").strip().lower().rstrip(".")
        if not host or host in cls.BLOCKED_HOSTS or any(host.endswith(suf) for suf in cls.BLOCKED_HOST_SUFFIXES):
            return False
        if cls._is_forbidden_ip(host):
            return False
        try:
            ipaddress.ip_address(host.strip("[]"))
            return True
        except ValueError:
            if "." not in host:
                return False
        try:
            infos = socket.getaddrinfo(host, parsed.port or 443, type=socket.SOCK_STREAM)
            for info in infos:
                addr = str(info[4][0])
                if cls._is_forbidden_ip(addr):
                    return False
        except OSError:
            pass
        return True

    @staticmethod
    def sign_payload(raw_body: bytes, secret: str, timestamp: int | str | None = None) -> str:
        if not secret:
            return ""
        signed_bytes = f"{timestamp}.".encode("utf-8") + raw_body if timestamp is not None else raw_body
        digest = hmac.new(secret.encode("utf-8"), signed_bytes, hashlib.sha256).hexdigest()
        return f"sha256={digest}"

    async def dispatch_event(
        self,
        webhooks: list[WebhookEntity],
        event_name: str,
        payload: dict[str, Any],
        timeout_sec: float = 4.0,
        secret_decryptor: Callable[[str], str] | None = None,
    ) -> list[dict[str, Any]]:
        results: list[dict[str, Any]] = []
        envelope = {"event": event_name, "data": payload}
        raw_body = json.dumps(envelope, ensure_ascii=False).encode("utf-8")
        ts = str(int(time.time()))

        async with httpx.AsyncClient(timeout=timeout_sec, follow_redirects=False) as client:
            for wh in webhooks:
                if not wh.is_active or not self.is_valid_url(wh.url):
                    continue
                if wh.events and "*" not in wh.events and event_name not in wh.events:
                    continue
                headers = {
                    "Content-Type": "application/json",
                    "X-ContextForge-Event": event_name,
                    "X-ContextForge-Timestamp": ts,
                }
                plain_secret = ""
                if wh.secret_encrypted and secret_decryptor is not None:
                    plain_secret = secret_decryptor(wh.secret_encrypted)
                elif wh.secret:
                    plain_secret = wh.secret
                sig = self.sign_payload(raw_body, plain_secret, timestamp=ts)
                if sig:
                    headers["X-ContextForge-Signature"] = sig
                try:
                    resp = await client.post(wh.url, content=raw_body, headers=headers)
                    results.append({"webhook_id": wh.webhook_id, "url": wh.url, "status_code": resp.status_code, "ok": resp.status_code < 400})
                except Exception as exc:
                    results.append({"webhook_id": wh.webhook_id, "url": wh.url, "status_code": 0, "ok": False, "error": str(exc)[:120]})
        return results
