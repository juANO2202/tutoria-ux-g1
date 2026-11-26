// Entorno de prueba: reloj fijo y almacenamiento en memoria.
import { crearServicioReservas } from '../src/application/servicio-reservas.js';
import { crearServicioBorrador } from '../src/application/borrador.js';
import { crearAlmacen, memoria } from '../src/infrastructure/almacen.js';
import { crearRepositorioReservas } from '../src/infrastructure/repositorio-reservas.js';
import { catalogo } from '../src/infrastructure/catalogo.js';
import { conFallosSimulados, generador } from '../src/infrastructure/sistema.js';

export const AHORA = new Date(2026, 10, 30, 7, 0); // lunes 30 de noviembre de 2026

export function crearEntorno({ fallo = null, storage = memoria() } = {}) {
  const reloj = { actual: AHORA, ahora() { return this.actual; } };
  const almacen = crearAlmacen(storage);
  const repositorio = conFallosSimulados(crearRepositorioReservas(almacen), fallo);
  return {
    reloj,
    repositorio,
    borrador: crearServicioBorrador(almacen),
    servicio: crearServicioReservas({ catalogo, repositorio, reloj, generador }),
  };
}

/** Primeros horarios libres de un docente para armar datos válidos. */
export function datosValidos(servicio, { docenteId = 'vaca', asignaturaId = 'hci', modalidad = 'presencial', salto = 0 } = {}) {
  const libres = servicio.consultarDisponibilidad({ docenteId, modalidad })
    .flatMap((d) => d.horarios.filter((x) => !x.ocupado).map((x) => ({ fecha: d.fecha, hora: x.hora })));
  return {
    asignaturaId, docenteId, modalidad, ...libres[salto],
    motivo: 'Dudas sobre la matriz de trazabilidad',
  };
}
