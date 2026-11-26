// Componentes reutilizables de la interfaz.
import { h } from './dom.js';
import { ESTADOS } from '../../domain/reserva.js';
import { MODALIDADES } from '../../domain/disponibilidad.js';
import { fechaLarga } from './formato.js';

export const PASOS = ['Materia y docente', 'Modalidad y horario', 'Motivo', 'Revisar'];

export function indicadorPasos(actual) {
  return h('ol', { class: 'pasos', 'aria-label': 'Progreso de la reserva' },
    PASOS.map((nombre, i) => h('li', {
      class: i + 1 < actual ? 'hecho' : null,
      'aria-current': i + 1 === actual ? 'step' : null,
    }, h('span', { class: 'numero' }, String(i + 1)), h('span', { class: 'nombre' }, nombre))));
}

export const insigniaEstado = (estado) =>
  h('span', { class: `insignia insignia-${estado}` }, ESTADOS[estado]);

export const aviso = (tipo, ...contenido) =>
  h('div', {
    class: `aviso aviso-${tipo}`, role: tipo === 'error' ? 'alert' : 'status', tabindex: '-1',
  }, ...contenido);

/** Grupo de opciones de selección única, operable con teclado (radios nativos). */
export function grupoOpciones({ nombre, leyenda, opciones, valor, alElegir }) {
  return h('fieldset', { class: 'grupo', id: `campo-${nombre}` },
    h('legend', {}, leyenda),
    h('div', { class: 'opciones' }, opciones.map((o) => {
      const id = `${nombre}-${o.valor.replace(/\W/g, '')}`;
      return h('div', { class: 'opcion' },
        h('input', {
          type: 'radio', name: nombre, id, value: o.valor,
          checked: o.valor === valor, disabled: o.deshabilitada,
          onChange: () => alElegir(o.valor),
        }),
        h('label', { for: id }, o.texto, o.detalle ? h('small', {}, o.detalle) : null));
    })));
}

export function resumenReserva({ asignatura, docente, modalidad, fecha, hora, lugar, motivo }) {
  const fila = (termino, valor) => [h('dt', {}, termino), h('dd', {}, valor || '—')];
  return h('dl', { class: 'resumen' },
    fila('Asignatura', asignatura?.nombre),
    fila('Docente', docente?.nombre),
    fila('Modalidad', MODALIDADES[modalidad]),
    fila('Fecha', fecha && fechaLarga(fecha)),
    fila('Hora', hora),
    fila('Lugar', lugar),
    fila('Motivo', motivo));
}
