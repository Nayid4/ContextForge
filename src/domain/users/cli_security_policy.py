"""Strict positive allowlist security policy for local AI CLIs (BR-17): per-binary allowed flags & no shell injection."""

from __future__ import annotations

import re

from domain.common import DomainError, ErrorOr


class CliSecurityPolicy:
    """Enforces positive per-binary allowlist of executables and flags; blocks metacharacters, paths & unlisted flags."""

    ALLOWED_BINARIES: frozenset[str] = frozenset(
        {"agy", "claude", "gemini", "codex", "opencode", "aider", "ollama"}
    )

    # Positive per-binary flag allowlist (replaces fragile denylist — BR-17)
    ALLOWED_FLAGS_BY_BINARY: dict[str, frozenset[str]] = {
        "agy": frozenset({"--disable-slash-commands", "--effort", "-p", "--prompt", "--model", "-m"}),
        "claude": frozenset({"-p", "--print", "--model", "-m", "--output-format", "--max-turns", "--tools"}),
        "gemini": frozenset({"-p", "--prompt", "--model", "-m"}),
        "codex": frozenset({"--model", "-m", "--sandbox"}),
        "opencode": frozenset({"--model", "-m"}),
        "aider": frozenset({"--no-auto-commits", "--message", "-m", "--model", "--no-git", "--no-stream"}),
        "ollama": frozenset(),
    }

    ALLOWED_SUBCOMMANDS_BY_BINARY: dict[str, frozenset[str]] = {
        "agy": frozenset({"models"}),
        "claude": frozenset(),
        "gemini": frozenset(),
        "codex": frozenset({"exec"}),
        "opencode": frozenset({"run"}),
        "aider": frozenset(),
        "ollama": frozenset({"run"}),
    }

    FLAGS_TAKING_VALUE: frozenset[str] = frozenset(
        {"--effort", "--model", "-m", "--output-format", "--max-turns", "--tools", "--sandbox"}
    )

    _SHELL_META_RE = re.compile(r"[;&|`$><\r\n]")
    _PATH_SEP_RE = re.compile(r"[/\\]")

    @classmethod
    def validate(cls, binary_name: str, args: list[str] | tuple[str, ...] = ()) -> ErrorOr[bool]:
        clean_bin = (binary_name or "").strip()
        if not clean_bin:
            return ErrorOr.fail(DomainError.validation("cli_binary_empty", "El comando binario CLI no puede estar vacío."))
        if cls._PATH_SEP_RE.search(clean_bin) or cls._SHELL_META_RE.search(clean_bin):
            return ErrorOr.fail(
                DomainError.forbidden(
                    "cli_binary_forbidden",
                    f"Comando CLI rechazado por seguridad (BR-17): no se permiten rutas ni metacaracteres en '{clean_bin}'.",
                )
            )
        normalized = clean_bin.lower().removesuffix(".exe").removesuffix(".cmd").removesuffix(".bat")
        if normalized not in cls.ALLOWED_BINARIES:
            allowed = ", ".join(sorted(cls.ALLOWED_BINARIES))
            return ErrorOr.fail(
                DomainError.forbidden(
                    "cli_binary_not_allowlisted",
                    f"Binario '{clean_bin}' no está en la allowlist de CLIs permitidos ({allowed}) (BR-17).",
                )
            )

        allowed_flags = cls.ALLOWED_FLAGS_BY_BINARY.get(normalized, frozenset())
        allowed_subs = cls.ALLOWED_SUBCOMMANDS_BY_BINARY.get(normalized, frozenset())
        expect_value_for_flag = False

        for arg in args:
            if cls._SHELL_META_RE.search(arg):
                return ErrorOr.fail(
                    DomainError.forbidden(
                        "cli_arg_shell_meta",
                        f"Argumento CLI rechazado por contener caracteres de inyección de shell: '{arg}' (BR-17).",
                    )
                )
            if ".." in arg:
                return ErrorOr.fail(
                    DomainError.forbidden(
                        "cli_arg_path_traversal",
                        f"Argumento CLI rechazado por secuencia de escape de ruta: '{arg}' (BR-17).",
                    )
                )
            if expect_value_for_flag:
                expect_value_for_flag = False
                continue

            if arg.startswith("-"):
                flag_head = arg.split("=", 1)[0].strip().lower()
                if flag_head not in allowed_flags:
                    return ErrorOr.fail(
                        DomainError.forbidden(
                            "cli_flag_not_allowlisted",
                            f"Flag '{flag_head}' no está en la lista positiva permitida para '{normalized}' (BR-17).",
                        )
                    )
                if "=" not in arg and flag_head in cls.FLAGS_TAKING_VALUE:
                    expect_value_for_flag = True
            else:
                if arg.strip().lower() not in allowed_subs:
                    return ErrorOr.fail(
                        DomainError.forbidden(
                            "cli_arg_not_allowlisted",
                            f"Subcomando o argumento posicional '{arg}' no permitido para '{normalized}' (BR-17).",
                        )
                    )
        return ErrorOr.ok(True)
