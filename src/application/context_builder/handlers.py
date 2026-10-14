"""Context Builder Application Handlers."""

from __future__ import annotations

from domain.context_builder.entities import BundleSpecification, ContextBundle
from domain.context_builder.repositories import IBundleStorageRepository
from domain.knowledge_docs.repositories import IDocumentRepository
from application.context_builder.commands import BuildContextBundleCommand
from application.context_builder.services.bundle_compiler import BundleCompiler


class BuildContextBundleCommandHandler:
    """Handler for compiling and storing a context bundle."""

    def __init__(
        self,
        doc_repo: IDocumentRepository,
        bundle_repo: IBundleStorageRepository,
        compiler: BundleCompiler,
    ) -> None:
        self._doc_repo = doc_repo
        self._bundle_repo = bundle_repo
        self._compiler = compiler

    async def handle(self, command: BuildContextBundleCommand) -> ContextBundle:
        all_docs = await self._doc_repo.list_all(project_slug=command.project_slug)
        filtered_docs = (
            [d for d in all_docs if d.module in command.modules]
            if command.modules
            else all_docs
        )

        spec = BundleSpecification(
            modules=command.modules,
            max_tokens=command.max_tokens,
            include_toc=command.include_toc,
            include_guidelines=command.include_guidelines,
            export_format=command.export_format,
            project_slug=command.project_slug or "default",
        )

        bundle = self._compiler.compile(spec, filtered_docs)
        await self._bundle_repo.save_bundle(bundle)
        return bundle


