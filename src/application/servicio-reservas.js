// Casos de uso. Dependen de puertos inyectados: catalogo, repositorio, reloj y generador de códigos.
import { calcularDisponibilidad, claveHorario } from '../domain/disponibilidad.js';
import * as Reserva from '../domain/reserva.js';
import {
  ErrorConflictoEstudiante, ErrorEstadoReserva, ErrorHorarioNoDisponible, ErrorValidacion,
} from '../domain/errores.js';

export function crearServicioReservas({ catalogo, repositorio, reloj, generador }) {
  const docente = (id) => catalogo.docentes().find((d) => d.id === id);
  const asignatura = (id) => catalogo.asignaturas().find((a) => a.id === id);

  const detallar = (r) => ({
    ...r,
    estadoVigente: Reserva.estadoVigente(r, reloj.ahora()),
    activa: Reserva.estaActiva(r, reloj.ahora()),
    docente: docente(r.docenteId),
    asignatura: asignatura(r.asignaturaId),
    lugar: r.modalidad === 'presencial' ? docente(r.docenteId)?.oficina : docente(r.docenteId)?.sala,
  });

  /** Horarios tomados por otras personas (catálogo) y por las reservas activas propias. */
  function ocupados(excluirId) {
    const todas = repositorio.listar();
    const clave = (r) => claveHorario(r.docenteId, r.fecha, r.hora);
    const propios = todas
      .filter((r) => r.id !== excluirId && Reserva.estaActiva(r, reloj.ahora()))
      .map(clave);
    const resultado = new Set([...catalogo.ocupados(reloj.ahora()), ...propios]);
    // Al modificar, el horario que ya pertenece a esa reserva sigue disponible para ella.
    const editada = todas.find((r) => r.id === excluirId);
    if (editada) resultado.delete(clave(editada));
    return resultado;
  }

  function consultarDisponibilidad({ docenteId, modalidad, excluirId }) {
    const d = docente(docenteId);
    if (!d || !modalidad) return [];
    return calcularDisponibilidad({
      docente: d, modalidad, ahora: reloj.ahora(), ocupados: ocupados(excluirId),
    });
  }

  function exigirHorarioLibre(datos, excluirId) {
    const d = docente(datos.docenteId);
    if (!d || !d.asignaturas.includes(datos.asignaturaId)) {
      throw new ErrorValidacion({ docenteId: 'El docente elegido no dicta esa asignatura.' });
    }
    const choque = repositorio
      .listar()
      .find((r) => r.id !== excluirId && Reserva.estaActiva(r, reloj.ahora())
        && r.fecha === datos.fecha && r.hora === datos.hora);
    if (choque) throw new ErrorConflictoEstudiante(choque.codigo);
    const horario = consultarDisponibilidad({
      docenteId: datos.docenteId, modalidad: datos.modalidad, excluirId,
    })
      .find((dia) => dia.fecha === datos.fecha)
      ?.horarios.find((h) => h.hora === datos.hora);
    if (!horario || horario.ocupado) throw new ErrorHorarioNoDisponible();
  }

  function buscar(id) {
    const r = repositorio.listar().find((x) => x.id === id);
    if (!r) throw new ErrorEstadoReserva('No se encontró la reserva.');
    return r;
  }

  return {
    listarAsignaturas: () => catalogo.asignaturas(),

    consultarDocentes({ asignaturaId = '', texto = '' } = {}) {
      const normal = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
      const busqueda = normal(texto.trim());
      return catalogo
        .docentes()
        .filter((d) => !asignaturaId || d.asignaturas.includes(asignaturaId))
        .map((d) => ({ ...d, materias: d.asignaturas.map((id) => asignatura(id)) }))
        .filter((d) => !busqueda
          || normal(`${d.nombre} ${d.materias.map((m) => m.nombre).join(' ')}`).includes(busqueda));
    },

    consultarDisponibilidad,

    validarPaso: (datos, paso) => Reserva.validarDatos(datos, Reserva.CAMPOS_PASO[paso]),

    registrar(datos) {
      Reserva.exigirDatosValidos(datos);
      exigirHorarioLibre(datos);
      const nueva = Reserva.crearReserva(datos, {
        id: generador.id(), codigo: generador.codigo(repositorio.listar()), ahora: reloj.ahora(),
      });
      repositorio.guardar(nueva);
      return detallar(nueva);
    },

    modificar(id, datos) {
      const actual = buscar(id);
      const cambiada = Reserva.modificarReserva(actual, datos, reloj.ahora());
      exigirHorarioLibre(datos, id);
      repositorio.guardar(cambiada);
      return detallar(cambiada);
    },

    cancelar(id) {
      const cancelada = Reserva.cancelarReserva(buscar(id), reloj.ahora());
      repositorio.guardar(cancelada);
      return detallar(cancelada);
    },

    obtener: (id) => detallar(buscar(id)),

    listar() {
      return repositorio
        .listar()
        .map(detallar)
        .sort((a, b) => Number(b.activa) - Number(a.activa)
          || `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`));
    },
  };
}
