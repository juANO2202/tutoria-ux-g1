// Reloj, generador de identificadores y simulador de fallos para las pruebas.
import { ErrorHorarioNoDisponible, ErrorPersistencia } from '../domain/errores.js';

export const reloj = { ahora: () => new Date() };

export const generador = {
  id: () => `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
  codigo(existentes) {
    const mayor = existentes.reduce((m, r) => Math.max(m, Number(r.codigo.split('-')[1]) || 0), 1000);
    return `TUT-${mayor + 1}`;
  },
};

/**
 * `?fallo=guardar` hace fallar el primer guardado; `?fallo=ocupado` simula que otra persona
 * toma el horario justo antes de confirmar. Ambos fallan una sola vez para poder recuperar.
 */
export function conFallosSimulados(repositorio, fallo) {
  let pendiente = fallo;
  return {
    ...repositorio,
    guardar(reserva) {
      const actual = pendiente;
      pendiente = null;
      if (actual === 'guardar') throw new ErrorPersistencia();
      if (actual === 'ocupado') throw new ErrorHorarioNoDisponible();
      repositorio.guardar(reserva);
    },
  };
}
