// Entidad Reserva y sus reglas. No conoce la interfaz ni el almacenamiento.
import { ErrorEstadoReserva, ErrorValidacion } from './errores.js';
import { MODALIDADES } from './disponibilidad.js';
import { momento } from './fechas.js';

export const ESTADOS = Object.freeze({
  confirmada: 'Confirmada',
  modificada: 'Modificada',
  cancelada: 'Cancelada',
  finalizada: 'Finalizada',
});

export const MOTIVO_MIN = 10;
export const MOTIVO_MAX = 300;

export const CAMPOS_PASO = Object.freeze({
  1: ['asignaturaId', 'docenteId'],
  2: ['modalidad', 'fecha', 'hora'],
  3: ['motivo'],
});

/** Devuelve un objeto {campo: mensaje}. Vacío significa que los datos son válidos. */
export function validarDatos(datos, campos = Object.values(CAMPOS_PASO).flat()) {
  const motivo = (datos.motivo ?? '').trim();
  const reglas = {
    asignaturaId: () => (datos.asignaturaId ? null : 'Seleccione una asignatura.'),
    docenteId: () => (datos.docenteId ? null : 'Seleccione un docente.'),
    modalidad: () => (MODALIDADES[datos.modalidad] ? null : 'Elija la modalidad: presencial o virtual.'),
    fecha: () => (datos.fecha ? null : 'Elija una fecha disponible.'),
    hora: () => (datos.hora ? null : 'Elija un horario disponible.'),
    motivo: () => {
      if (motivo.length < MOTIVO_MIN) return `Describa el motivo con al menos ${MOTIVO_MIN} caracteres.`;
      if (motivo.length > MOTIVO_MAX) return `El motivo admite máximo ${MOTIVO_MAX} caracteres.`;
      return null;
    },
  };
  return Object.fromEntries(
    campos.map((c) => [c, reglas[c]()]).filter(([, mensaje]) => mensaje),
  );
}

export function exigirDatosValidos(datos) {
  const errores = validarDatos(datos);
  if (Object.keys(errores).length) throw new ErrorValidacion(errores);
}

const soloDatos = (d) => ({
  asignaturaId: d.asignaturaId,
  docenteId: d.docenteId,
  modalidad: d.modalidad,
  fecha: d.fecha,
  hora: d.hora,
  motivo: d.motivo.trim(),
});

export function crearReserva(datos, { id, codigo, ahora }) {
  exigirDatosValidos(datos);
  const sello = ahora.toISOString();
  return {
    id,
    codigo,
    ...soloDatos(datos),
    estado: 'confirmada',
    creadaEn: sello,
    actualizadaEn: sello,
    historial: [{ accion: 'creada', en: sello }],
  };
}

export function estadoVigente(reserva, ahora) {
  if (reserva.estado !== 'cancelada' && momento(reserva.fecha, reserva.hora) <= ahora) return 'finalizada';
  return reserva.estado;
}

export const estaActiva = (reserva, ahora) =>
  ['confirmada', 'modificada'].includes(estadoVigente(reserva, ahora));

function exigirActiva(reserva, ahora, accion) {
  if (!estaActiva(reserva, ahora)) {
    throw new ErrorEstadoReserva(
      `No se puede ${accion} una reserva ${ESTADOS[estadoVigente(reserva, ahora)].toLowerCase()}.`,
    );
  }
}

export function modificarReserva(reserva, datos, ahora) {
  exigirActiva(reserva, ahora, 'modificar');
  exigirDatosValidos(datos);
  const sello = ahora.toISOString();
  return {
    ...reserva,
    ...soloDatos(datos),
    estado: 'modificada',
    actualizadaEn: sello,
    historial: [...reserva.historial, { accion: 'modificada', en: sello }],
  };
}

export function cancelarReserva(reserva, ahora) {
  exigirActiva(reserva, ahora, 'cancelar');
  const sello = ahora.toISOString();
  return {
    ...reserva,
    estado: 'cancelada',
    actualizadaEn: sello,
    historial: [...reserva.historial, { accion: 'cancelada', en: sello }],
  };
}
