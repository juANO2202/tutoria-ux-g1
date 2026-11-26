// Reevaluación técnica de la v2: pruebas de cada hallazgo corregido.
import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { abrirNavegador, completarAsistente, pausa } from './navegador.mjs';

let n;
const activo = (expresion) => n.evaluar(`(() => { const a = document.activeElement; return ${expresion}; })()`);

async function crearReservaYAbrirLista() {
  await completarAsistente(n);
  await n.pulsar('Confirmar reserva');
  await n.esperar("document.querySelector('.aviso-exito')");
  await n.ir('#/reservas');
}

describe('Correcciones de la v2', () => {
  before(async () => { n = await abrirNavegador(); });
  after(async () => { await n?.cerrar(); });
  beforeEach(async () => {
    await n.ventana(390, 844);
    await n.ir();
    await n.evaluar('localStorage.clear()');
  });

  it('H-01: resume los errores, recibe el foco y los asocia a cada campo', async () => {
    await n.ir('#/reservar/1');
    await n.pulsar('Continuar');
    assert.equal(await activo("a.hasAttribute('data-resumen-errores')"), true);
    assert.equal(await n.evaluar("document.querySelectorAll('[role=alert] a').length"), 2);
    assert.equal(await n.evaluar("document.querySelectorAll('[aria-invalid=true]').length"), 2);
    assert.equal(await n.evaluar("document.querySelector('#docenteId').getAttribute('aria-describedby')"), 'error-docenteId');
    await n.clic('[data-ir-a=docenteId]');
    assert.equal(await activo('a.id'), 'docenteId');
    assert.equal(await n.evaluar('location.hash'), '#/reservar/1');
  });

  it('H-01: en grupos de opciones el enlace lleva a una opción disponible', async () => {
    await completarAsistente(n);
    await n.ir('#/reservar/4', '?fallo=ocupado');
    await n.pulsar('Confirmar reserva');
    await n.esperar("location.hash === '#/reservar/2' && document.activeElement.hasAttribute('data-resumen-errores')");
    await n.clic('[data-ir-a=hora]');
    assert.equal(await activo('a.name'), 'hora');
  });

  it('H-03: al cambiar de paso el foco va al encabezado y cambia el título', async () => {
    await n.ir('#/reservar/1');
    await n.escribir('#asignaturaId', 'hci', 'change');
    await n.escribir('#docenteId', 'vaca', 'change');
    await n.pulsar('Continuar');
    await pausa(100);
    assert.match(await activo('a.textContent'), /^Paso 2 de 4/);
    assert.match(await n.evaluar('document.title'), /paso 2 de 4 · Tutoría UX/);
  });

  it('H-04: el diálogo identifica la reserva, protege por defecto y devuelve el foco', async () => {
    await crearReservaYAbrirLista();
    await n.evaluar("document.querySelector('button[aria-label^=\"Cancelar reserva\"]').focus()");
    await n.clic('button[aria-label^="Cancelar reserva"]');
    const contenido = await n.evaluar("document.querySelector('dialog[open]').textContent");
    assert.match(contenido, /TUT-1001[\s\S]*Interacción Humano-Computador con Ing\. Elena Vaca[\s\S]*no se puede deshacer/);
    assert.equal(await activo('a.textContent'), 'Conservar reserva');
    await n.pulsar('Conservar reserva');
    await pausa(100);
    assert.match(await activo("a.getAttribute('aria-label')"), /Cancelar reserva TUT-1001/);
    assert.ok(await n.evaluar("document.querySelector('.insignia-confirmada') !== null"));
    await n.clic('button[aria-label^="Cancelar reserva"]');
    await n.clic('dialog[open] [data-confirmar]');
    await n.esperar("document.querySelector('.insignia-cancelada')");
    assert.match(await activo('a.textContent'), /fue cancelada/);
  });

  it('H-04: Escape cierra el diálogo sin cancelar', async () => {
    await crearReservaYAbrirLista();
    await n.clic('button[aria-label^="Cancelar reserva"]');
    await n.tecla('Escape', 'Escape', 27);
    await n.esperar("!document.querySelector('dialog')");
    assert.ok(await n.evaluar("document.querySelector('.insignia-confirmada') !== null"));
  });
});
