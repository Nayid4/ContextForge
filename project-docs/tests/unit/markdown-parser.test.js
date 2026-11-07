import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  extractTableOfContents, 
  slugify, 
  parseMarkdownToBlocks, 
  blocksToMarkdown, 
  renderMarkdown 
} from '../../src/shared/MarkdownViewer.js';

test('slugify genera identificadores limpios para anchors', () => {
  assert.equal(slugify('Modelo C4 del Sistema'), 'modelo-c4-del-sistema');
  assert.equal(slugify('Regla BR-AUTH-001: Expiración JWT'), 'regla-br-auth-001-expiracion-jwt');
  assert.equal(slugify('¿Preguntas y Respuestas? (FAQ)'), 'preguntas-y-respuestas-faq');
});

test('extractTableOfContents extrae encabezados jerárquicos e ignora bloques de código', () => {
  const md = `
# Título Principal
Intro text.

\`\`\`markdown
# Este encabezado dentro de código NO debe incluirse
\`\`\`

## Sección de Arquitectura
Contenido.

### Subsección de Componentes
Detalle.
  `;

  const toc = extractTableOfContents(md);
  assert.equal(toc.length, 3);
  assert.equal(toc[0].level, 1);
  assert.equal(toc[0].text, 'Título Principal');
  assert.equal(toc[0].id, 'titulo-principal');

  assert.equal(toc[1].level, 2);
  assert.equal(toc[1].text, 'Sección de Arquitectura');

  assert.equal(toc[2].level, 3);
  assert.equal(toc[2].text, 'Subsección de Componentes');
});

test('parseMarkdownToBlocks y blocksToMarkdown mantienen serialización bidireccional', () => {
  const inputMd = `# Arquitectura General

> [!NOTE]
> Esta es una alerta informativa para el arnés.

\`\`\`mermaid
flowchart TD
  A --> B
\`\`\`

### BR-AUTH-001
El token JWT debe expirar en UTC Epoch.

---

Párrafo descriptivo final.`;

  const blocks = parseMarkdownToBlocks(inputMd);
  assert.ok(blocks.length >= 5, 'Debe haber parseado al menos 5 bloques');

  const headerBlock = blocks.find(b => b.type === 'header');
  assert.ok(headerBlock);
  assert.equal(headerBlock.text, 'Arquitectura General');

  const calloutBlock = blocks.find(b => b.type === 'callout');
  assert.ok(calloutBlock);
  assert.equal(calloutBlock.kind, 'NOTE');

  const codeBlock = blocks.find(b => b.type === 'code');
  assert.ok(codeBlock);
  assert.equal(codeBlock.lang, 'mermaid');

  const serialized = blocksToMarkdown(blocks);
  assert.ok(serialized.includes('# Arquitectura General'));
  assert.ok(serialized.includes('> [!NOTE]'));
  assert.ok(serialized.includes('```mermaid'));
  assert.ok(serialized.includes('---'));
});

test('renderMarkdown renderiza alertas GitHub y tablas con sticky header', () => {
  const md = `
> [!IMPORTANT]
> Invariante de seguridad estricta.

| ID | Regla | Severidad |
| --- | --- | --- |
| BR-01 | Auth | Crítica |
| BR-02 | Logs | Media |
  `;

  const html = renderMarkdown(md);
  assert.ok(html.includes('bg-purple-50/80'), 'Debe contener estilos de alerta IMPORTANT');
  assert.ok(html.includes('sticky top-0'), 'Debe contener cabecera pegajosa en tabla');
});
