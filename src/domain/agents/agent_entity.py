"""First-class configurable AI Agent entity scoped to a project (BR-19)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
import re
import uuid


@dataclass
class AgentEntity:
    agent_id: str
    project_slug: str
    slug: str
    name: str
    description: str = ""
    system_prompt: str = (
        "Eres un agente especialista del proyecto. Responde únicamente con evidencia de la documentación "
        "verificada, citando siempre [ruta.md]."
    )
    llm_provider: str = ""
    llm_model: str = ""
    temperature: float = 0.2
    max_tokens: int = 2048
    top_k: int = 6
    min_grounding_score: float = 0.15
    allowed_modules: tuple[str, ...] = ()
    allowed_tags: tuple[str, ...] = ()
    allowed_statuses: tuple[str, ...] = ("published",)
    welcome_message: str = "¡Hola! Soy un agente especializado en este proyecto. ¿En qué puedo ayudarte?"
    suggested_questions: tuple[str, ...] = ()
    topic_boundaries: str = ""
    visibility: str = "internal"
    daily_quota_requests: int = 500
    current_version: int = 1
    is_active: bool = True
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    VALID_VISIBILITIES: tuple[str, ...] = ("private", "internal", "public")

    @staticmethod
    def normalize_slug(raw: str) -> str:
        cleaned = re.sub(r"[^a-z0-9_-]+", "-", (raw or "").strip().lower()).strip("-_")
        return (cleaned or "agent")[:48]

    @classmethod
    def normalize_visibility(cls, raw: str) -> str:
        norm = (raw or "internal").strip().lower()
        return norm if norm in cls.VALID_VISIBILITIES else "internal"

    @classmethod
    def create(
        cls,
        *,
        project_slug: str,
        name: str,
        slug: str = "",
        description: str = "",
        system_prompt: str = "",
        llm_provider: str = "",
        llm_model: str = "",
        temperature: float = 0.2,
        max_tokens: int = 2048,
        top_k: int = 6,
        min_grounding_score: float = 0.15,
        allowed_modules: tuple[str, ...] = (),
        allowed_tags: tuple[str, ...] = (),
        allowed_statuses: tuple[str, ...] = ("published",),
        welcome_message: str = "",
        suggested_questions: tuple[str, ...] = (),
        topic_boundaries: str = "",
        visibility: str = "internal",
        daily_quota_requests: int = 500,
    ) -> "AgentEntity":
        now = datetime.now(timezone.utc)
        norm_slug = cls.normalize_slug(slug or name)
        norm_vis = cls.normalize_visibility(visibility)
        max_tok_cap = 4096 if norm_vis == "public" else 16384
        # Public agents can NEVER index unpublished drafts (BR-05, BR-18)
        eff_statuses = ("published",) if norm_vis == "public" else (tuple(s.strip().lower() for s in allowed_statuses if s.strip()) or ("published",))
        return cls(
            agent_id=str(uuid.uuid4()),
            project_slug=project_slug,
            slug=norm_slug,
            name=name.strip() or norm_slug,
            description=description.strip(),
            system_prompt=system_prompt.strip()
            or "Eres un agente especialista del proyecto. Cita siempre las fuentes [ruta.md].",
            llm_provider=llm_provider.strip(),
            llm_model=llm_model.strip(),
            temperature=max(0.0, min(1.0, float(temperature))),
            max_tokens=max(128, min(max_tok_cap, int(max_tokens))),
            top_k=max(1, min(25, int(top_k))),
            min_grounding_score=max(0.0, min(1.0, float(min_grounding_score))),
            allowed_modules=tuple(m.strip() for m in allowed_modules if m.strip()),
            allowed_tags=tuple(t.strip() for t in allowed_tags if t.strip()),
            allowed_statuses=eff_statuses,
            welcome_message=welcome_message.strip() or f"¡Hola! Soy **{name.strip() or norm_slug}** del proyecto `{project_slug}`.",
            suggested_questions=tuple(q.strip() for q in suggested_questions if q.strip()),
            topic_boundaries=topic_boundaries.strip(),
            visibility=norm_vis,
            daily_quota_requests=max(10, min(100000, int(daily_quota_requests))),
            current_version=1,
            is_active=True,
            created_at=now,
            updated_at=now,
        )

    @property
    def openai_model_id(self) -> str:
        return f"{self.project_slug}/{self.slug}"

    @property
    def includes_drafts(self) -> bool:
        return any(s in {"draft", "in_review"} for s in self.allowed_statuses)
