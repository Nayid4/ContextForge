/**
 * Date and Time Utilities for Plane & SDD Harness
 * 100% JavaScript Vanilla, 0 dependencias externas, 0 emojis.
 */

/**
 * Formatea una fecha ISO o timestamp a formato legible en español.
 * @param {string | number | Date} input 
 * @param {Intl.DateTimeFormatOptions} [options] 
 * @returns {string}
 */
export function formatDate(input, options = {}) {
  if (!input) return '';
  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) return '';

  const defaultOpts = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options
  };

  try {
    return new Intl.DateTimeFormat('es-ES', defaultOpts).format(date);
  } catch (_) {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Retorna una representación relativa del tiempo transcurrido (ej: "hace 5 min").
 * @param {string | number | Date} input 
 * @returns {string}
 */
export function formatTimeAgo(input) {
  if (!input) return '';
  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) return '';

  const now = Date.now();
  const diffSec = Math.floor((now - date.getTime()) / 1000);

  if (diffSec < 5) return 'justo ahora';
  if (diffSec < 60) return `hace ${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `hace ${diffDays} d`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `hace ${diffMonths} m`;
  return `hace ${Math.floor(diffDays / 365)} a`;
}

/**
 * Calcula el tiempo estimado de lectura y el conteo de palabras de un texto.
 * @param {string} text - Contenido en texto o markdown.
 * @param {number} [wordsPerMinute=200] 
 * @returns {{ words: number, minutes: number, label: string }}
 */
export function calculateReadingTime(text = '', wordsPerMinute = 200) {
  if (!text || typeof text !== 'string') {
    return { words: 0, minutes: 1, label: '1 min de lectura' };
  }
  const clean = text.replace(/<[^>]*>/g, '').trim();
  const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
  return {
    words,
    minutes,
    label: `${minutes} min de lectura`
  };
}
