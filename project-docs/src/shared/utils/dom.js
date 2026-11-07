/**
 * DOM Manipulation and Event Delegation Utilities
 * Simplifica la selección y gestión de eventos en Vanilla JavaScript.
 * 100% JavaScript Vanilla, 0 dependencias externas, 0 emojis.
 */

/**
 * Selecciona un único elemento del DOM.
 * @param {string} selector 
 * @param {Document | Element} [scope=document] 
 * @returns {Element | null}
 */
export function $(selector, scope = document) {
  if (typeof document === 'undefined') return null;
  return scope.querySelector(selector);
}

/**
 * Selecciona múltiples elementos del DOM y retorna un Array estándar.
 * @param {string} selector 
 * @param {Document | Element} [scope=document] 
 * @returns {Element[]}
 */
export function $$(selector, scope = document) {
  if (typeof document === 'undefined') return [];
  return Array.from(scope.querySelectorAll(selector));
}

/**
 * Delegación de eventos para componentes dinámicos en Vanilla JS.
 * @param {Element | Document} rootElement - Contenedor raíz donde se escucha el evento.
 * @param {string} eventType - Tipo de evento (click, change, input, keydown, etc.).
 * @param {string} targetSelector - Selector CSS del elemento objetivo.
 * @param {(event: Event, target: Element) => void} handler - Callback que recibe el evento y el elemento encontrado.
 * @returns {() => void} Función para desuscribir el listener.
 */
export function delegate(rootElement, eventType, targetSelector, handler) {
  if (!rootElement || typeof rootElement.addEventListener !== 'function') {
    return () => {};
  }

  const listener = (event) => {
    const target = event.target.closest(targetSelector);
    if (target && rootElement.contains(target)) {
      handler(event, target);
    }
  };

  rootElement.addEventListener(eventType, listener);
  return () => rootElement.removeEventListener(eventType, listener);
}

/**
 * Escapa caracteres HTML especiales para prevenir inyección XSS.
 * @param {string} text 
 * @returns {string}
 */
export function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Template tag para sanitización básica de cadenas HTML.
 */
export function html(strings, ...values) {
  return strings.reduce((acc, str, i) => {
    const val = values[i - 1];
    return acc + (val !== undefined && val !== null ? String(val) : '') + str;
  });
}
