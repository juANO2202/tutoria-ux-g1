import { h } from '../components/dom.js';
import { aviso, insigniaEstado, resumenReserva } from '../components/ui.js';
import { pedirConfirmacion } from '../components/dialogo.js';
import { fechaLarga } from '../components/formato.js';

export function vistaMisReservas({ reservas, borrador, ir, refrescar, estado }) {
  const lista = reservas.listar();
  const mensaje = estado.mensaje;
  estado.mensaje = null;

  function modificar(r) {
    borrador.desdeReserva(r);
    estado.errores = null;
    ir('#/reservar/1');
  }

  async function cancelar(r) {
    const confirmado = await pedirConfirmacion({
      titulo: `¿Cancelar la reserva ${r.codigo}?`,
      parrafos: [
        `${r.asignatura.nombre} con ${r.docente.nombre}, ${fechaLarga(r.fecha)} a las ${r.hora}.`,
        'El horario quedará libre para otras personas. Esta acción no se puede deshacer.',
      ],
      aceptar: 'Sí, cancelar reserva',
      rechazar: 'Conservar reserva',
    });
    if (!confirmado) return;
    try {
      reservas.cancelar(r.id);
      if (borrador.leer().editandoId === r.id) borrador.limpiar();
      estado.mensaje = { tipo: 'exito', texto: `La reserva ${r.codigo} fue cancelada.` };
    } catch (error) {
      estado.mensaje = { tipo: 'error', texto: error.message };
    }
    refrescar();
    // El botón pulsado desaparece: el foco pasa al mensaje de resultado.
    document.querySelector('main .aviso')?.focus();
  }

  return [
    h('h1', {}, 'Mis reservas'),
    mensaje ? aviso(mensaje.tipo, mensaje.texto) : null,
    lista.length === 0
      ? h('section', { class: 'tarjeta' },
        h('p', {}, 'Todavía no tiene reservas.'),
        h('a', { class: 'boton', href: '#/reservar/1' }, 'Reservar una tutoría'))
      : h('ul', { class: 'lista' }, lista.map((r) => h('li', { class: 'tarjeta' },
        h('h2', {}, `${r.codigo} `, insigniaEstado(r.estadoVigente)),
        resumenReserva(r),
        r.activa ? h('div', { class: 'acciones' },
          h('button', {
            type: 'button', class: 'boton secundario', 'aria-label': `Modificar reserva ${r.codigo}`,
            onClick: () => modificar(r),
          }, 'Modificar'),
          h('button', {
            type: 'button', class: 'boton peligro', 'aria-label': `Cancelar reserva ${r.codigo}`,
            onClick: () => cancelar(r),
          }, 'Cancelar reserva')) : null))),
  ];
}
