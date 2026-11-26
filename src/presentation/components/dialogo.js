// Confirmación modal con contexto (corrige H-04). <dialog> nativo: atrapa el foco y cierra con Escape.
import { h } from './dom.js';

export function pedirConfirmacion({ titulo, parrafos, aceptar, rechazar }) {
  const disparador = document.activeElement;
  return new Promise((resolver) => {
    const volver = h('button', { type: 'button', class: 'boton secundario', onClick: () => dialogo.close() }, rechazar);
    const dialogo = h('dialog', { class: 'dialogo', 'aria-labelledby': 'dialogo-titulo' },
      h('h2', { id: 'dialogo-titulo' }, titulo),
      parrafos.map((texto) => h('p', {}, texto)),
      h('div', { class: 'acciones' }, volver,
        h('button', {
          type: 'button', class: 'boton destructivo', 'data-confirmar': true,
          onClick: () => dialogo.close('si'),
        }, aceptar)));
    dialogo.addEventListener('close', () => {
      const confirmado = dialogo.returnValue === 'si';
      dialogo.remove();
      if (!confirmado) disparador?.focus();
      resolver(confirmado);
    });
    document.body.append(dialogo);
    dialogo.showModal();
    volver.focus(); // La opción segura recibe el foco inicial.
  });
}
