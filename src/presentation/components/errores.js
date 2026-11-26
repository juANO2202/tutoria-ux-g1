// Presentación accesible de errores (corrige H-01): resumen enlazado y mensaje junto a cada campo.
import { h } from './dom.js';

const idError = (campo) => `error-${campo}`;

export function resumenErrores(errores) {
  const entradas = Object.entries(errores);
  if (!entradas.length) return null;
  return h('div', { class: 'aviso aviso-error', role: 'alert', tabindex: '-1', 'data-resumen-errores': true },
    h('h3', {}, entradas.length === 1 ? 'Revise este problema' : `Revise estos ${entradas.length} problemas`),
    h('ul', {}, entradas.map(([campo, mensaje]) => h('li', {}, campo === 'general'
      ? mensaje
      : h('a', { href: `#${idError(campo)}`, 'data-ir-a': campo, onClick: enfocarCampo }, mensaje)))));
}

/** El enlace no debe cambiar la ruta (el enrutador usa el hash): solo mueve el foco. */
function enfocarCampo(evento) {
  evento.preventDefault();
  const campo = evento.currentTarget.dataset.irA;
  const destino = document.getElementById(campo)
    ?? document.querySelector(`#campo-${campo} input:not([disabled])`)
    ?? document.querySelector('main form input:not([disabled]), main form select, main form textarea');
  destino?.focus();
}

/** Marca como inválidos los controles ya construidos y añade el mensaje junto a ellos. */
export function marcarErrores(raiz, errores) {
  for (const [campo, mensaje] of Object.entries(errores)) {
    const control = raiz.querySelector(`#${campo}`);
    const contenedor = raiz.querySelector(`#campo-${campo}`) ?? control?.closest('.campo');
    if (!contenedor) continue;
    contenedor.classList.add('con-error');
    contenedor.append(h('p', { class: 'mensaje-error', id: idError(campo) }, `Error: ${mensaje}`));
    const controles = control ? [control] : [...contenedor.querySelectorAll('input')];
    for (const c of controles) {
      c.setAttribute('aria-invalid', 'true');
      c.setAttribute('aria-describedby',
        [c.getAttribute('aria-describedby'), idError(campo)].filter(Boolean).join(' '));
    }
  }
}
