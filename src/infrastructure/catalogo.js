// Catálogo de demostración. Nombres, oficinas y salas son ficticios.
import { calcularDisponibilidad, claveHorario } from '../domain/disponibilidad.js';

const ASIGNATURAS = [
  { id: 'hci', nombre: 'Interacción Humano-Computador', nivel: '5.º' },
  { id: 'bd', nombre: 'Bases de Datos', nivel: '4.º' },
  { id: 'poo', nombre: 'Programación Orientada a Objetos', nivel: '3.º' },
  { id: 'redes', nombre: 'Redes de Computadores', nivel: '5.º' },
  { id: 'cal', nombre: 'Cálculo Diferencial', nivel: '1.º' },
];

const bloque = (dia, hora, ...modalidades) => ({ dia, hora, modalidades });

const DOCENTES = [
  {
    id: 'vaca', nombre: 'Ing. Elena Vaca', asignaturas: ['hci', 'poo'],
    oficina: 'Edificio 2, oficina 204', sala: 'Sala virtual V-01',
    agenda: [
      bloque(1, '09:00', 'presencial', 'virtual'), bloque(1, '15:00', 'virtual'),
      bloque(2, '10:00', 'presencial'), bloque(3, '09:00', 'presencial', 'virtual'),
      bloque(4, '10:00', 'presencial'), bloque(4, '16:00', 'virtual'), bloque(5, '11:00', 'presencial', 'virtual'),
    ],
  },
  {
    id: 'mora', nombre: 'Ing. Darío Mora', asignaturas: ['bd', 'poo'],
    oficina: 'Edificio 1, oficina 112', sala: 'Sala virtual V-02',
    agenda: [
      bloque(1, '11:00', 'presencial'), bloque(2, '08:00', 'presencial', 'virtual'),
      bloque(2, '14:00', 'virtual'), bloque(3, '11:00', 'presencial'),
      bloque(4, '08:00', 'presencial', 'virtual'), bloque(5, '14:00', 'virtual'),
    ],
  },
  {
    id: 'salas', nombre: 'Ing. Patricia Salas', asignaturas: ['redes', 'hci'],
    oficina: 'Edificio 2, oficina 310', sala: 'Sala virtual V-03',
    agenda: [
      bloque(1, '14:00', 'presencial', 'virtual'), bloque(2, '16:00', 'virtual'),
      bloque(3, '14:00', 'presencial', 'virtual'), bloque(4, '14:00', 'presencial'),
      bloque(5, '09:00', 'presencial'),
    ],
  },
  {
    id: 'nunez', nombre: 'Mat. Julio Núñez', asignaturas: ['cal'],
    oficina: 'Edificio 3, oficina 015', sala: 'Sala virtual V-04',
    agenda: [
      bloque(1, '08:00', 'presencial'), bloque(2, '11:00', 'presencial', 'virtual'),
      bloque(3, '16:00', 'virtual'), bloque(4, '11:00', 'presencial', 'virtual'),
      bloque(5, '08:00', 'presencial'),
    ],
  },
];

/** Simula horarios reservados por otros estudiantes: el primero de cada docente en cada modalidad. */
function ocupados(ahora) {
  return DOCENTES.flatMap((docente) => ['presencial', 'virtual'].map((modalidad) => {
    const [dia] = calcularDisponibilidad({ docente, modalidad, ahora });
    return claveHorario(docente.id, dia.fecha, dia.horarios[0].hora);
  }));
}

export const catalogo = {
  asignaturas: () => ASIGNATURAS,
  docentes: () => DOCENTES,
  ocupados,
};
