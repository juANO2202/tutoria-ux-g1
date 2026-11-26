// Adaptador de almacenamiento clave-valor sobre Web Storage (o un sustituto en memoria).
import { ErrorPersistencia } from '../domain/errores.js';

export function memoria() {
  const datos = new Map();
  return {
    getItem: (k) => (datos.has(k) ? datos.get(k) : null),
    setItem: (k, v) => datos.set(k, String(v)),
    removeItem: (k) => datos.delete(k),
  };
}

export function crearAlmacen(storage) {
  return {
    leer(clave) {
      try {
        return JSON.parse(storage.getItem(clave));
      } catch {
        return null; // Dato corrupto o almacenamiento bloqueado: se trata como vacío.
      }
    },
    escribir(clave, valor) {
      try {
        storage.setItem(clave, JSON.stringify(valor));
      } catch {
        throw new ErrorPersistencia();
      }
    },
    borrar(clave) {
      try {
        storage.removeItem(clave);
      } catch {
        throw new ErrorPersistencia();
      }
    },
  };
}
