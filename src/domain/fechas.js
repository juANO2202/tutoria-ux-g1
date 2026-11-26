// Utilidades de fecha en hora local. Formato canónico: 'AAAA-MM-DD' y 'HH:MM'.

const dos = (n) => String(n).padStart(2, '0');

export const aISO = (fecha) =>
  `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;

export const momento = (fechaISO, hora = '00:00') => {
  const [a, m, d] = fechaISO.split('-').map(Number);
  const [h, min] = hora.split(':').map(Number);
  return new Date(a, m - 1, d, h, min);
};

export const diaSemana = (fechaISO) => momento(fechaISO).getDay();

/** Próximos `cantidad` días de lunes a viernes, sin contar hoy. */
export function proximosDiasHabiles(ahora, cantidad = 10) {
  const dias = [];
  const cursor = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  while (dias.length < cantidad) {
    cursor.setDate(cursor.getDate() + 1);
    if (cursor.getDay() !== 0 && cursor.getDay() !== 6) dias.push(aISO(cursor));
  }
  return dias;
}
