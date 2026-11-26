import { h } from '../components/dom.js';

export function vistaInicio({ reservas }) {
  const activas = reservas.listar().filter((r) => r.activa).length;
  return [
    h('h1', {}, 'Tutorías universitarias'),
    h('p', { class: 'entrada' }, 'Consulte docentes, elija modalidad y horario, y gestione sus reservas.'),
    h('div', { class: 'acciones' },
      h('a', { class: 'boton', href: '#/reservar/1' }, 'Reservar una tutoría'),
      h('a', { class: 'boton secundario', href: '#/docentes' }, 'Consultar docentes y asignaturas')),
    h('section', { class: 'tarjeta' },
      h('h2', {}, 'Su estado'),
      h('p', {}, activas
        ? `Tiene ${activas} ${activas === 1 ? 'reserva activa' : 'reservas activas'}.`
        : 'No tiene reservas activas.'),
      h('a', { href: '#/reservas' }, 'Ver mis reservas')),
  ];
}
