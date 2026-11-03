import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown, extractTableOfContents } from '../../project-docs/src/shared/MarkdownViewer.js';

describe('White-Box Testing: Ramificaciones y Grafos de Decisión en MarkdownViewer', () => {
  test('Branch Coverage: Renderizado de todas las alertas GitHub (NOTE, TIP, IMPORTANT, WARNING, CAUTION, DANGER, Desconocido)', () => {
    const alertTypes = ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION', 'DANGER'];
    
    for (const type of alertTypes) {
      const md = `> [!${type}]\n> Mensaje de prueba para ${type}.`;
      const html = renderMarkdown(md);
      assert.ok(html.includes(type), `Debe contener el badge para ${type}`);
      assert.ok(html.includes(`Mensaje de prueba para ${type}`), `Debe contener el texto de la alerta`);
    }

    // Rama desconocida / default
    const customAlert = `> [!UNKNOWN_ALERT]\n> Alerta no estándar.`;
    const customHtml = renderMarkdown(customAlert);
    assert.ok(customHtml.includes('UNKNOWN_ALERT'), 'Debe manejar tipos de alerta no registrados');
  });

  test('Branch Coverage: Bloques de código con lenguaje especificado vs sin lenguaje', () => {
    // Con lenguaje
    const withLang = "```javascript\nconst a = 42;\n```";
    const htmlWithLang = renderMarkdown(withLang);
    assert.ok(htmlWithLang.includes('javascript'));
    assert.ok(htmlWithLang.includes('const a = 42;'));

    // Sin lenguaje
    const withoutLang = "```\ntexto plano en bloque\n```";
    const htmlWithoutLang = renderMarkdown(withoutLang);
    assert.ok(htmlWithoutLang.includes('<pre'));
    assert.ok(htmlWithoutLang.includes('texto plano en bloque'));
  });

  test('Branch Coverage: Tablas con cabecera y cuerpo vs texto plano tabular', () => {
    const tableMd = "| Col A | Col B |\n| --- | --- |\n| Val 1 | Val 2 |";
    const html = renderMarkdown(tableMd);
    assert.ok(html.includes('<table'));
    assert.ok(html.includes('<th'));
    assert.ok(html.includes('<td'));
    assert.ok(html.includes('Val 1'));
  });

  test('Branch Coverage: Manejo de valores de entrada vacíos, nulos o no-string', () => {
    const emptyMsg = '<p class="text-slate-400 italic">Documento vacío.</p>';
    assert.equal(renderMarkdown(null), emptyMsg);
    assert.equal(renderMarkdown(undefined), emptyMsg);
    assert.equal(renderMarkdown(''), emptyMsg);
    assert.equal(renderMarkdown(12345), emptyMsg);
  });

  test('Branch Coverage: extractTableOfContents con niveles h1, h2, h3 y exclusión de bloques de código', () => {
    const md = `
# Titulo 1
Texto
## Seccion 1.1
\`\`\`markdown
## Encabezado dentro de codigo (debe ignorarse)
\`\`\`
### Subseccion 1.1.1
`;
    const toc = extractTableOfContents(md);
    assert.equal(toc.length, 3);
    assert.equal(toc[0].level, 1);
    assert.equal(toc[0].text, 'Titulo 1');
    assert.equal(toc[1].level, 2);
    assert.equal(toc[1].text, 'Seccion 1.1');
    assert.equal(toc[2].level, 3);
    assert.equal(toc[2].text, 'Subseccion 1.1.1');
  });
});
