// Implementación local del puerto "repositorio de reservas".

const CLAVE = 'tutorias.reservas';

export function crearRepositorioReservas(almacen) {
  const listar = () => {
    const datos = almacen.leer(CLAVE);
    return Array.isArray(datos) ? datos : [];
  };
  return {
    listar,
    guardar(reserva) {
      const resto = listar().filter((r) => r.id !== reserva.id);
      almacen.escribir(CLAVE, [...resto, reserva]);
    },
    vaciar: () => almacen.borrar(CLAVE),
  };
}
