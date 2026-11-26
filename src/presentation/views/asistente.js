// Asistente de reserva en cuatro pasos. Sirve para crear y para modificar.
import { h } from '../components/dom.js';
import { aviso, grupoOpciones, indicadorPasos, resumenReserva, PASOS } from '../components/ui.js';
import { fechaCorta } from '../components/formato.js';
import { MODALIDADES } from '../../domain/disponibilidad.js';
import { MOTIVO_MAX, MOTIVO_MIN } from '../../domain/reserva.js';

export function vistaAsistente({ reservas, borrador, ir, refrescar, estado }, paso) {
  const datos = borrador.leer();

  // No se puede avanzar a un paso si los anteriores están incompletos.
  for (let previo = 1; previo < paso; previo += 1) {
    if (Object.keys(reservas.validarPaso(datos, previo)).length) {
      ir(`#/reservar/${previo}`);
      return [];
    }
  }

  const docente = reservas.consultarDocentes().find((d) => d.id === datos.docenteId);
  const asignatura = reservas.listarAsignaturas().find((a) => a.id === datos.asignaturaId);
  const errores = estado.errores ?? {};

  const elegir = (cambios) => {
    borrador.actualizar(cambios);
    estado.errores = null;
    refrescar();
  };

  function avanzar(evento) {
    evento.preventDefault();
    const fallos = reservas.validarPaso(borrador.leer(), paso);
    if (Object.keys(fallos).length) {
      estado.errores = fallos;
      refrescar();
      return;
    }
    estado.errores = null;
    ir(`#/reservar/${paso + 1}`);
  }

  function confirmar(evento) {
    evento.preventDefault();
    const boton = evento.target.querySelector('[type=submit]');
    boton.disabled = true;
    boton.textContent = 'Guardando…';
    setTimeout(() => {
      try {
        const actual = borrador.leer();
        const guardada = actual.editandoId
          ? reservas.modificar(actual.editandoId, actual)
          : reservas.registrar(actual);
        borrador.limpiar();
        estado.errores = null;
        ir(`#/confirmacion/${guardada.id}`);
      } catch (error) {
        estado.errores = error.campos ?? { general: error.message };
        if (error.campos?.hora) {
          borrador.actualizar({ hora: '' });
          ir('#/reservar/2');
        } else {
          refrescar();
        }
      }
    }, 600);
  }

  const campoSelect = (id, etiqueta, opciones, valor, vacio) => h('div', { class: 'campo' },
    h('label', { for: id }, etiqueta),
    h('select', { id, onChange: (e) => elegir({ [id]: e.target.value }) },
      h('option', { value: '' }, vacio),
      opciones.map((o) => h('option', { value: o.id, selected: o.id === valor }, o.nombre))));

  function paso1() {
    const docentes = datos.asignaturaId
      ? reservas.consultarDocentes({ asignaturaId: datos.asignaturaId })
      : reservas.consultarDocentes();
    return [
      h('div', { class: 'campo' },
        h('label', { for: 'asignaturaId' }, 'Asignatura'),
        h('select', {
          id: 'asignaturaId',
          onChange: (e) => {
            const asignaturaId = e.target.value;
            const sirve = docente?.asignaturas.includes(asignaturaId);
            elegir(sirve ? { asignaturaId } : { asignaturaId, docenteId: '' });
          },
        },
        h('option', { value: '' }, 'Seleccione una asignatura'),
        reservas.listarAsignaturas().map((a) =>
          h('option', { value: a.id, selected: a.id === datos.asignaturaId }, a.nombre)))),
      campoSelect('docenteId', 'Docente', docentes, datos.docenteId, 'Seleccione un docente'),
    ];
  }

  function paso2() {
    const dias = reservas.consultarDisponibilidad({
      docenteId: datos.docenteId, modalidad: datos.modalidad, excluirId: datos.editandoId,
    });
    const dia = dias.find((d) => d.fecha === datos.fecha);
    return [
      grupoOpciones({
        nombre: 'modalidad', leyenda: 'Modalidad', valor: datos.modalidad,
        opciones: Object.entries(MODALIDADES).map(([valor, texto]) => ({ valor, texto })),
        alElegir: (modalidad) => elegir({ modalidad }),
      }),
      datos.modalidad ? grupoOpciones({
        nombre: 'fecha', leyenda: 'Fecha', valor: datos.fecha,
        opciones: dias.map((d) => ({
          valor: d.fecha,
          texto: fechaCorta(d.fecha),
          deshabilitada: d.horarios.every((x) => x.ocupado),
          detalle: d.horarios.every((x) => x.ocupado) ? 'Sin cupo' : null,
        })),
        alElegir: (fecha) => elegir({ fecha }),
      }) : h('p', { class: 'ayuda' }, 'Elija una modalidad para ver las fechas disponibles.'),
      dia ? grupoOpciones({
        nombre: 'hora', leyenda: 'Horario', valor: datos.hora,
        opciones: dia.horarios.map((x) => ({
          valor: x.hora, texto: x.hora, deshabilitada: x.ocupado,
          detalle: x.ocupado ? 'Ocupado' : x.lugar,
        })),
        alElegir: (hora) => elegir({ hora }),
      }) : null,
    ];
  }

  function paso3() {
    const contador = h('p', { class: 'ayuda', id: 'ayuda-motivo' },
      `Entre ${MOTIVO_MIN} y ${MOTIVO_MAX} caracteres. Lleva ${datos.motivo.trim().length}.`);
    return [h('div', { class: 'campo' },
      h('label', { for: 'motivo' }, 'Motivo de la tutoría'),
      h('textarea', {
        id: 'motivo', rows: 5, maxlength: MOTIVO_MAX, 'aria-describedby': 'ayuda-motivo',
        placeholder: 'Ejemplo: dudas sobre la matriz de trazabilidad del proyecto',
        onInput: (e) => {
          borrador.actualizar({ motivo: e.target.value });
          contador.textContent =
            `Entre ${MOTIVO_MIN} y ${MOTIVO_MAX} caracteres. Lleva ${e.target.value.trim().length}.`;
        },
      }, datos.motivo),
      contador)];
  }

  function paso4() {
    const lugar = datos.modalidad === 'presencial' ? docente?.oficina : docente?.sala;
    return [resumenReserva({ ...datos, asignatura, docente, lugar })];
  }

  const contenido = { 1: paso1, 2: paso2, 3: paso3, 4: paso4 }[paso]();
  const final = datos.editandoId ? 'Guardar cambios' : 'Confirmar reserva';
  const mensajes = Object.values(errores);

  return [
    h('h1', {}, datos.editandoId ? 'Modificar reserva' : 'Reservar tutoría'),
    indicadorPasos(paso),
    datos.editandoId ? aviso('info',
      `Está modificando la reserva ${reservas.obtener(datos.editandoId).codigo}. `,
      h('button', {
        type: 'button', class: 'enlace',
        onClick: () => { borrador.limpiar(); ir('#/reservas'); },
      }, 'Descartar cambios')) : null,
    h('form', { class: 'tarjeta', novalidate: true, onSubmit: paso === 4 ? confirmar : avanzar },
      h('h2', {}, `Paso ${paso} de 4: ${PASOS[paso - 1]}`),
      mensajes.length ? aviso('error', mensajes.join(' ')) : null,
      contenido,
      h('div', { class: 'acciones' },
        paso > 1 ? h('button', {
          type: 'button', class: 'boton secundario',
          onClick: () => { estado.errores = null; ir(`#/reservar/${paso - 1}`); },
        }, 'Atrás') : null,
        h('button', { type: 'submit', class: 'boton' }, paso === 4 ? final : 'Continuar'))),
  ];
}
