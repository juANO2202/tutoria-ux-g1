// Borrador del asistente de reserva: conserva las selecciones al retroceder, recargar o corregir errores.

export const BORRADOR_VACIO = Object.freeze({
  asignaturaId: '', docenteId: '', modalidad: '', fecha: '', hora: '', motivo: '', editandoId: null,
});

export function crearServicioBorrador(almacen, clave = 'tutorias.borrador') {
  const leer = () => ({ ...BORRADOR_VACIO, ...(almacen.leer(clave) ?? {}) });
  return {
    leer,
    actualizar(cambios) {
      const previo = leer();
      const nuevo = { ...previo, ...cambios };
      // Solo se descarta lo que deja de ser válido al cambiar una selección anterior.
      const cambio = (campo) => cambios[campo] !== undefined && cambios[campo] !== previo[campo];
      const descartar = (...campos) => campos
        .filter((campo) => cambios[campo] === undefined)
        .forEach((campo) => { nuevo[campo] = ''; });
      if (cambio('docenteId') || cambio('modalidad')) descartar('fecha', 'hora');
      if (cambio('fecha')) descartar('hora');
      almacen.escribir(clave, nuevo);
      return nuevo;
    },
    desdeReserva(reserva) {
      const { asignaturaId, docenteId, modalidad, fecha, hora, motivo, id } = reserva;
      const borrador = { asignaturaId, docenteId, modalidad, fecha, hora, motivo, editandoId: id };
      almacen.escribir(clave, borrador);
      return borrador;
    },
    limpiar: () => almacen.borrar(clave),
  };
}
