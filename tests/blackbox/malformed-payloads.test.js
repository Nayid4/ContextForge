import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown, extractTableOfContents } from '../../project-docs/src/shared/MarkdownViewer.js';

describe('Black-Box Testing: Payloads Malformados, Inyección Adversaria y Resiliencia', () => {
  test('Resiliencia: Bloque de código sin cerrar (unclosed code fence)', () => {
    const unclosed = "```javascript\nconsole.log('bloque sin triple backtick final');";
    // No debe lanzar excepción
    const html = renderMarkdown(unclosed);
    assert.ok(typeof html === 'string');
    assert.ok(html.length > 0);
  });

  test('Resiliencia: Bloques de citas anidadas recursivas y alertas malformadas', () => {
    const malformedAlert = ">>>> [!NOTE]\n>>>> Mensaje con profundidad 4 sin formato cerrado\n>>> [!INCOMPLETE";
    const html = renderMarkdown(malformedAlert);
    assert.ok(typeof html === 'string');
    assert.ok(html.length > 0);
  });

  test('Resiliencia: Tablas incompletas o sin separador', () => {
    const brokenTable = "| Col A | Col B |\n| Fila 1 sin separador ni pipes finales";
    const html = renderMarkdown(brokenTable);
    assert.ok(typeof html === 'string');
  });

  test('Resiliencia: Inyección de scripts y entidades HTML en bloques de código', () => {
    const malicious = "```html\n<script>alert('xss')</script>\n<img src=x onerror=alert(1)>\n```";
    const html = renderMarkdown(malicious);
    // Debe escapar las etiquetas dentro del bloque para evitar ejecución en DOM
    assert.ok(!html.includes("<script>alert('xss')</script>"));
    assert.ok(html.includes('&lt;script&gt;') || html.includes('&lt;img'));
  });

  test('Resiliencia: Caracteres Unicode extremos, surrogates y emojis de prueba', () => {
    const weirdText = "# Titulo con Zalgo y UTF-8 extremo: T̸e̷s̸t̷\nTexto normal con símbolos: © ® ™ § ¶";
    const toc = extractTableOfContents(weirdText);
    assert.ok(Array.isArray(toc));
    assert.ok(toc.length > 0);
    assert.ok(typeof toc[0].id === 'string');
  });
});
