// Pruebas funcionales de extremo a extremo en un navegador real.
import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { abrirNavegador, cancelarPrimeraReserva, completarAsistente } from './navegador.mjs';

let n;
const titulo = () => n.evaluar("document.querySelector('main h1').textContent");
const texto = () => n.evaluar("document.querySelector('main').textContent");

describe('Flujo de reserva en el navegador', () => {
  before(async () => { n = await abrirNavegador(); });
  after(async () => { await n?.cerrar(); });
  beforeEach(async () => {
    await n.ventana(1280, 800);
    await n.ir();
    await n.evaluar('localStorage.clear()');
  });

  it('camino exitoso: reservar, consultar, modificar y cancelar', async () => {
    await completarAsistente(n);
    await n.pulsar('Confirmar reserva');
    await n.esperar("document.querySelector('main h1').textContent === 'Reserva confirmada'");
    assert.match(await texto(), /TUT-1001/);

    await n.pulsar('Ver mis reservas');
    await n.esperar("document.querySelector('.insignia-confirmada')");
    await n.clic('button[aria-label="Modificar reserva TUT-1001"]');
    await n.esperar("location.hash.startsWith('#/reservar/')");
    for (let i = 0; i < 4; i += 1) {
      if (await n.evaluar("location.hash === '#/reservar/3'")) {
        await n.escribir('#motivo', 'Ahora necesito revisar el prototipo');
      }
      if (await n.evaluar("location.hash === '#/reservar/4'")) break;
      await n.pulsar('Continuar');
    }
    if (!(await texto()).includes('revisar el prototipo')) {
      await n.ir('#/reservar/3');
      await n.escribir('#motivo', 'Ahora necesito revisar el prototipo');
      await n.pulsar('Continuar');
    }
    await n.pulsar('Guardar cambios');
    await n.esperar("document.querySelector('main h1').textContent === 'Cambios guardados'");

    await n.pulsar('Ver mis reservas');
    await cancelarPrimeraReserva(n);
    await n.esperar("document.querySelector('.insignia-cancelada')");
    assert.match(await texto(), /fue cancelada/);
  });

  it('retroceder y recargar conservan las selecciones y el motivo', async () => {
    await completarAsistente(n);
    await n.pulsar('Atrás');
    assert.equal(await n.evaluar("document.querySelector('#motivo').value"), 'Dudas sobre la matriz de trazabilidad');
    await n.pulsar('Atrás');
    assert.ok(await n.evaluar("document.querySelector('input[name=hora]:checked')"));
    await n.ir('#/reservar/4');
    assert.match(await texto(), /Dudas sobre la matriz/);
  });

  it('la validación explica el error y no avanza', async () => {
    await n.ir('#/reservar/1');
    await n.pulsar('Continuar');
    assert.match(await texto(), /Seleccione una asignatura/);
    assert.equal(await n.evaluar('location.hash'), '#/reservar/1');
  });

  it('un fallo al guardar conserva los datos y permite reintentar', async () => {
    await completarAsistente(n);
    await n.ir('#/reservar/4', '?fallo=guardar');
    await n.pulsar('Confirmar reserva');
    await n.esperar("document.querySelector('[role=alert]')");
    assert.match(await texto(), /No se pudo guardar[\s\S]*Dudas sobre la matriz/);
    await n.pulsar('Confirmar reserva');
    await n.esperar("document.querySelector('main h1').textContent === 'Reserva confirmada'");
  });

  it('un horario que se ocupa devuelve al paso 2 sin perder el motivo', async () => {
    await completarAsistente(n);
    await n.ir('#/reservar/4', '?fallo=ocupado');
    await n.pulsar('Confirmar reserva');
    await n.esperar("location.hash === '#/reservar/2'");
    assert.match(await texto(), /acaba de ser ocupado/);
    await n.clic('input[name=hora]:not([disabled])');
    await n.pulsar('Continuar');
    assert.equal(await n.evaluar("document.querySelector('#motivo').value"), 'Dudas sobre la matriz de trazabilidad');
  });

  it('no hay desplazamiento horizontal en 320, 360, 768 y 1366 px', async () => {
    await completarAsistente(n);
    for (const ancho of [320, 360, 768, 1366]) {
      await n.ventana(ancho, 800);
      for (const hash of ['#/inicio', '#/docentes', '#/reservar/2', '#/reservar/4', '#/reservas']) {
        await n.ir(hash);
        const sobra = await n.evaluar('document.documentElement.scrollWidth - document.documentElement.clientWidth');
        assert.ok(sobra <= 0, `${hash} a ${ancho}px sobra ${sobra}px`);
      }
    }
  });

  it('el primer Tab lleva al enlace de salto y el título tiene un solo h1', async () => {
    await n.ir('#/docentes');
    await n.tecla('Tab');
    assert.equal(await n.evaluar('document.activeElement.className'), 'saltar');
    assert.equal(await n.evaluar("document.querySelectorAll('h1').length"), 1);
    assert.equal(await titulo(), 'Docentes y asignaturas');
  });

  it('no se produjeron errores de JavaScript', () => {
    assert.deepEqual(n.erroresPagina, []);
  });
});
