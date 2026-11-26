// Regla de disponibilidad: agenda semanal del docente menos horarios ocupados o pasados.
import { diaSemana, momento, proximosDiasHabiles } from './fechas.js';

export const MODALIDADES = Object.freeze({ presencial: 'Presencial', virtual: 'Virtual' });

export const claveHorario = (docenteId, fecha, hora) => `${docenteId}|${fecha}|${hora}`;

/**
 * @returns {{fecha:string, horarios:{hora:string, lugar:string, ocupado:boolean}[]}[]}
 */
export function calcularDisponibilidad({ docente, modalidad, ahora, ocupados = new Set(), dias = 10 }) {
  return proximosDiasHabiles(ahora, dias)
    .map((fecha) => ({
      fecha,
      horarios: docente.agenda
        .filter((a) => a.dia === diaSemana(fecha) && a.modalidades.includes(modalidad))
        .filter((a) => momento(fecha, a.hora) > ahora)
        .map((a) => ({
          hora: a.hora,
          lugar: modalidad === 'presencial' ? docente.oficina : docente.sala,
          ocupado: ocupados.has(claveHorario(docente.id, fecha, a.hora)),
        })),
    }))
    .filter((d) => d.horarios.length > 0);
}
