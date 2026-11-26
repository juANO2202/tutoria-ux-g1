// Formato de fechas para lectura humana (español de Ecuador).
import { momento } from '../../domain/fechas.js';

export const fechaLarga = (iso) =>
  momento(iso).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' });

export const fechaCorta = (iso) =>
  momento(iso).toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric', month: 'short' });
