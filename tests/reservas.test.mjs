// Pruebas funcionales de los casos de uso, una sección por requisito (R1–R6).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearEntorno, datosValidos } from './ayudas.mjs';
import { memoria } from '../src/infrastructure/almacen.js';

describe('R1 · consultar docentes y asignaturas', () => {
  const { servicio } = crearEntorno();

  it('lista las asignaturas y los docentes', () => {
    assert.equal(servicio.listarAsignaturas().length, 5);
    assert.equal(servicio.consultarDocentes().length, 4);
  });

  it('filtra por asignatura', () => {
    const nombres = servicio.consultarDocentes({ asignaturaId: 'hci' }).map((d) => d.id);
    assert.deepEqual(nombres, ['vaca', 'salas']);
  });

  it('busca sin distinguir tildes ni mayúsculas', () => {
    assert.deepEqual(servicio.consultarDocentes({ texto: 'NUNEZ' }).map((d) => d.id), ['nunez']);
    assert.equal(servicio.consultarDocentes({ texto: 'interaccion' }).length, 2);
    assert.equal(servicio.consultarDocentes({ texto: 'zzz' }).length, 0);
  });
});

describe('R2 · seleccionar modalidad, fecha y horario', () => {
  const { servicio } = crearEntorno();

  it('solo ofrece días hábiles posteriores a hoy', () => {
    const dias = servicio.consultarDisponibilidad({ docenteId: 'vaca', modalidad: 'virtual' });
    assert.ok(dias.length > 0);
    for (const { fecha } of dias) {
      const dia = new Date(`${fecha}T12:00`).getDay();
      assert.ok(fecha > '2026-11-30' && dia >= 1 && dia <= 5, fecha);
    }
  });

  it('marca horarios ocupados y muestra el lugar según la modalidad', () => {
    const dias = servicio.consultarDisponibilidad({ docenteId: 'vaca', modalidad: 'virtual' });
    assert.equal(dias[0].horarios[0].ocupado, true);
    assert.ok(dias[0].horarios.every((x) => x.lugar.startsWith('Sala virtual')));
  });

  it('valida cada paso con un mensaje por campo', () => {
    assert.deepEqual(Object.keys(servicio.validarPaso({}, 1)), ['asignaturaId', 'docenteId']);
    assert.deepEqual(Object.keys(servicio.validarPaso({ modalidad: 'virtual' }, 2)), ['fecha', 'hora']);
  });
});

describe('R3 · registrar la reserva', () => {
  it('confirma, asigna código y persiste', () => {
    const storage = memoria();
    const { servicio } = crearEntorno({ storage });
    const r = servicio.registrar(datosValidos(servicio));
    assert.equal(r.codigo, 'TUT-1001');
    assert.equal(r.estadoVigente, 'confirmada');
    // Una segunda instancia sobre el mismo almacenamiento recupera la reserva.
    assert.equal(crearEntorno({ storage }).servicio.listar()[0].codigo, 'TUT-1001');
  });

  it('rechaza un motivo demasiado corto sin guardar nada', () => {
    const { servicio } = crearEntorno();
    assert.throws(() => servicio.registrar({ ...datosValidos(servicio), motivo: '  corto  ' }),
      (e) => Boolean(e.campos.motivo));
    assert.equal(servicio.listar().length, 0);
  });

  it('rechaza un horario ya ocupado', () => {
    const { servicio } = crearEntorno();
    const [dia] = servicio.consultarDisponibilidad({ docenteId: 'vaca', modalidad: 'presencial' });
    const datos = { ...datosValidos(servicio), fecha: dia.fecha, hora: dia.horarios[0].hora };
    assert.throws(() => servicio.registrar(datos), { name: 'ErrorHorarioNoDisponible' });
  });

  it('impide dos reservas del estudiante en la misma fecha y hora', () => {
    const { servicio } = crearEntorno();
    const datos = datosValidos(servicio);
    servicio.registrar(datos);
    assert.throws(() => servicio.registrar(datos), { name: 'ErrorConflictoEstudiante' });
  });

  it('rechaza un docente que no dicta la asignatura', () => {
    const { servicio } = crearEntorno();
    assert.throws(() => servicio.registrar({ ...datosValidos(servicio), asignaturaId: 'cal' }),
      { name: 'ErrorValidacion' });
  });

  for (const [fallo, nombre] of [['guardar', 'ErrorPersistencia'], ['ocupado', 'ErrorHorarioNoDisponible']]) {
    it(`se recupera de un fallo simulado «${fallo}» al reintentar`, () => {
      const { servicio, borrador } = crearEntorno({ fallo });
      const datos = datosValidos(servicio);
      borrador.actualizar(datos);
      assert.throws(() => servicio.registrar(borrador.leer()), { name: nombre });
      assert.equal(borrador.leer().motivo, datos.motivo);
      assert.equal(servicio.registrar(borrador.leer()).estadoVigente, 'confirmada');
    });
  }
});

describe('R4 · consultar reservas y estados', () => {
  it('ordena las activas primero y marca como finalizadas las pasadas', () => {
    const { servicio, reloj } = crearEntorno();
    const primera = servicio.registrar(datosValidos(servicio));
    const segunda = servicio.registrar(datosValidos(servicio, { salto: 3 }));
    servicio.cancelar(primera.id);
    assert.deepEqual(servicio.listar().map((r) => r.id), [segunda.id, primera.id]);
    reloj.actual = new Date(2027, 0, 15);
    assert.equal(servicio.obtener(segunda.id).estadoVigente, 'finalizada');
    assert.equal(servicio.obtener(primera.id).estadoVigente, 'cancelada');
  });
});

describe('R5 · modificar una reserva', () => {
  it('cambia el horario, conserva el código y pasa a Modificada', () => {
    const { servicio } = crearEntorno();
    const r = servicio.registrar(datosValidos(servicio));
    const nueva = datosValidos(servicio, { salto: 2 });
    const m = servicio.modificar(r.id, nueva);
    assert.equal(m.codigo, r.codigo);
    assert.equal(m.hora, nueva.hora);
    assert.equal(m.fecha, nueva.fecha);
    assert.equal(m.estadoVigente, 'modificada');
    assert.equal(servicio.listar().length, 1);
  });

  it('permite cambiar solo el motivo manteniendo el mismo horario', () => {
    const { servicio } = crearEntorno();
    const r = servicio.registrar(datosValidos(servicio));
    assert.equal(servicio.modificar(r.id, { ...r, motivo: 'Revisar el prototipo navegable' }).motivo,
      'Revisar el prototipo navegable');
  });

  it('si el cambio es inválido, la reserva original no se altera', () => {
    const { servicio } = crearEntorno();
    const r = servicio.registrar(datosValidos(servicio));
    assert.throws(() => servicio.modificar(r.id, { ...r, motivo: 'no' }));
    assert.equal(servicio.obtener(r.id).motivo, r.motivo);
  });

  it('el borrador de edición parte de los datos guardados', () => {
    const { servicio, borrador } = crearEntorno();
    const r = servicio.registrar(datosValidos(servicio));
    const b = borrador.desdeReserva(r);
    assert.equal(b.editandoId, r.id);
    assert.equal(b.motivo, r.motivo);
  });
});

describe('R6 · cancelar una reserva', () => {
  it('cambia el estado y libera el horario', () => {
    const { servicio } = crearEntorno();
    const datos = datosValidos(servicio);
    const r = servicio.registrar(datos);
    assert.equal(servicio.cancelar(r.id).estadoVigente, 'cancelada');
    assert.equal(servicio.registrar(datos).estadoVigente, 'confirmada');
  });

  it('no permite cancelar dos veces ni modificar una cancelada', () => {
    const { servicio } = crearEntorno();
    const r = servicio.registrar(datosValidos(servicio));
    servicio.cancelar(r.id);
    assert.throws(() => servicio.cancelar(r.id), { name: 'ErrorEstadoReserva' });
    assert.throws(() => servicio.modificar(r.id, r), { name: 'ErrorEstadoReserva' });
  });
});

describe('Borrador · conserva la información', () => {
  const completo = {
    asignaturaId: 'hci', docenteId: 'vaca', modalidad: 'virtual',
    fecha: '2026-12-02', hora: '09:00', motivo: 'Dudas del proyecto',
  };

  it('guardar el motivo no borra las selecciones', () => {
    const { borrador } = crearEntorno();
    borrador.actualizar(completo);
    assert.equal(borrador.actualizar({ motivo: 'Otro motivo válido' }).hora, '09:00');
  });

  it('cambiar de modalidad descarta solo fecha y hora', () => {
    const { borrador } = crearEntorno();
    borrador.actualizar(completo);
    const b = borrador.actualizar({ modalidad: 'presencial' });
    assert.deepEqual([b.fecha, b.hora, b.docenteId, b.motivo], ['', '', 'vaca', 'Dudas del proyecto']);
  });

  it('volver a elegir el mismo docente no descarta nada', () => {
    const { borrador } = crearEntorno();
    borrador.actualizar(completo);
    assert.equal(borrador.actualizar({ docenteId: 'vaca' }).fecha, '2026-12-02');
  });

  it('un almacenamiento corrupto se trata como vacío', () => {
    const storage = memoria();
    storage.setItem('tutorias.reservas', '{roto');
    assert.deepEqual(crearEntorno({ storage }).servicio.listar(), []);
  });
});
