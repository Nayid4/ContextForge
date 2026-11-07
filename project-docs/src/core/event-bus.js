/**
 * Cross-Module Decoupled Event Bus (Pub-Sub Pattern)
 * Permite comunicación desacoplada entre módulos sin dependencias directas.
 * 100% JavaScript Vanilla, 0 dependencias externas, 0 emojis.
 */

export class EventBus {
  constructor() {
    this.events = new Map();
  }

  /**
   * Suscribe un listener a un evento.
   * @param {string} event - Nombre del evento.
   * @param {Function} handler - Función manejadora.
   * @returns {Function} Función para cancelar la suscripción.
   */
  on(event, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError(`El handler para el evento "${event}" debe ser una función`);
    }
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(handler);

    return () => this.off(event, handler);
  }

  /**
   * Cancela la suscripción de un handler específico.
   * @param {string} event - Nombre del evento.
   * @param {Function} handler - Función manejadora previamente registrada.
   */
  off(event, handler) {
    if (!this.events.has(event)) return;
    const handlers = this.events.get(event);
    handlers.delete(handler);
    if (handlers.size === 0) {
      this.events.delete(event);
    }
  }

  /**
   * Emite un evento a todos los suscriptores registrados.
   * @param {string} event - Nombre del evento.
   * @param {*} [payload] - Datos transferidos con el evento.
   */
  emit(event, payload) {
    if (!this.events.has(event)) return;
    const handlers = Array.from(this.events.get(event));
    for (const handler of handlers) {
      try {
        handler(payload);
      } catch (err) {
        console.error(`Error en el handler del evento "${event}":`, err);
      }
    }
  }

  /**
   * Suscribe un listener que se ejecuta una única vez.
   * @param {string} event - Nombre del evento.
   * @param {Function} handler - Función manejadora.
   * @returns {Function} Función para cancelar la suscripción anticipadamente.
   */
  once(event, handler) {
    const wrapper = (payload) => {
      this.off(event, wrapper);
      handler(payload);
    };
    return this.on(event, wrapper);
  }

  /**
   * Elimina todos los listeners de un evento o de todos los eventos.
   * @param {string} [event] - Si se especifica, elimina solo los de ese evento; si no, limpia todo el bus.
   */
  clear(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * Retorna el número de suscriptores para un evento dado.
   * @param {string} event 
   * @returns {number}
   */
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).size : 0;
  }
}

export const eventBus = new EventBus();
