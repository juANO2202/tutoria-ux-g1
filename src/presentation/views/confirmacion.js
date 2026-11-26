import { h } from '../components/dom.js';
import { aviso, insigniaEstado, resumenReserva } from '../components/ui.js';

export function vistaConfirmacion({ reservas }, id) {
  let r;
  try {
    r = reservas.obtener(id);
  } catch (error) {
    return [h('h1', {}, 'Reserva no encontrada'), aviso('error', error.message),
      h('a', { href: '#/reservas' }, 'Ir a mis reservas')];
  }
  return [
    h('h1', {}, r.estado === 'modificada' ? 'Cambios guardados' : 'Reserva confirmada'),
    aviso('exito', `Su código es ${r.codigo}. Guárdelo para identificar la tutoría.`),
    h('section', { class: 'tarjeta' },
      h('p', {}, 'Estado: ', insigniaEstado(r.estadoVigente)),
      resumenReserva(r),
      h('div', { class: 'acciones' },
        h('a', { class: 'boton', href: '#/reservas' }, 'Ver mis reservas'),
        h('a', { class: 'boton secundario', href: '#/inicio' }, 'Volver al inicio'))),
  ];
}
