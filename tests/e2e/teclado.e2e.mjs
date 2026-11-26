// Comprobaciones automáticas: flujo solo con teclado, equivalente a zoom 200 % y móvil emulado.
// No sustituyen una prueba con personas, con lector de pantalla ni en un teléfono físico.
import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { abrirNavegador, pausa } from './navegador.mjs';

let n;
const TECLAS = {
  Tab: { code: 'Tab', windowsVirtualKeyCode: 9 },
  Enter: { code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' },
  ' ': { code: 'Space', windowsVirtualKeyCode: 32, text: ' ' },
  ArrowDown: { code: 'ArrowDown', windowsVirtualKeyCode: 40 },
};

async function pulsarTecla(key) {
  const { text, ...datos } = TECLAS[key];
  await n.enviar('Input.dispatchKeyEvent', { type: text ? 'keyDown' : 'rawKeyDown', key, text, ...datos });
  await n.enviar('Input.dispatchKeyEvent', { type: 'keyUp', key, ...datos });
  await pausa(40);
}

/** Avanza con Tab hasta que el elemento enfocado cumpla la condición. */
async function tabHasta(condicion, maximo = 60) {
  for (let i = 0; i < maximo; i += 1) {
    await pulsarTecla('Tab');
    if (await n.evaluar(`(() => { const a = document.activeElement; return Boolean(${condicion}); })()`)) return;
  }
  throw new Error(`No se alcanzó con Tab: ${condicion}`);
}

const boton = (texto) => `a.textContent.trim() === ${JSON.stringify(texto)}`;

async function elegirEnLista(id) {
  await tabHasta(`a.id === '${id}'`);
  await pulsarTecla('ArrowDown');
  await n.esperar(`document.querySelector('#${id}').value !== ''`);
}

describe('Accesibilidad automatizada', () => {
  before(async () => { n = await abrirNavegador(); });
  after(async () => { await n?.cerrar(); });
  beforeEach(async () => {
    await n.ventana(1366, 768);
    await n.ir();
    await n.evaluar('localStorage.clear()');
  });

  it('reservar y cancelar usando solo el teclado', async () => {
    await n.ir('#/inicio');
    await tabHasta(boton('Reservar una tutoría'));
    await pulsarTecla('Enter');
    await n.esperar("location.hash === '#/reservar/1'");
    await elegirEnLista('asignaturaId');
    await elegirEnLista('docenteId');
    await tabHasta(boton('Continuar'));
    await pulsarTecla('Enter');
    await n.esperar("location.hash === '#/reservar/2'");
    await tabHasta("a.name === 'modalidad'");
    await pulsarTecla(' ');
    await n.esperar("document.querySelector('input[name=fecha]')");
    await tabHasta("a.name === 'fecha'");
    await pulsarTecla(' ');
    await n.esperar("document.querySelector('input[name=hora]')");
    // Si el primer día tiene todo ocupado queda deshabilitado y Tab ya lo omite.
    await tabHasta("a.name === 'hora'");
    await pulsarTecla(' ');
    await n.esperar("document.querySelector('input[name=hora]:checked')");
    await tabHasta(boton('Continuar'));
    await pulsarTecla('Enter');
    await n.esperar("location.hash === '#/reservar/3'");
    await tabHasta("a.id === 'motivo'");
    await n.enviar('Input.insertText', { text: 'Dudas sobre la matriz de trazabilidad' });
    await tabHasta(boton('Continuar'));
    await pulsarTecla('Enter');
    await n.esperar("location.hash === '#/reservar/4'");
    await tabHasta(boton('Confirmar reserva'));
    await pulsarTecla('Enter');
    await n.esperar("document.querySelector('main h1').textContent === 'Reserva confirmada'");
    await tabHasta(boton('Ver mis reservas'));
    await pulsarTecla('Enter');
    await n.esperar("location.hash === '#/reservas'");
    await tabHasta(boton('Cancelar reserva'));
    await pulsarTecla('Enter');
    await n.esperar("document.querySelector('dialog[open]')");
    await tabHasta(boton('Sí, cancelar reserva'), 5);
    await pulsarTecla('Enter');
    await n.esperar("document.querySelector('.insignia-cancelada')");
  });

  for (const [nombre, ancho, alto, escala] of [
    ['equivalente a zoom 200 % en 1366×768', 683, 384, 2],
    ['móvil emulado de 360×800', 360, 800, 3],
  ]) {
    it(`sin desplazamiento horizontal: ${nombre}`, async () => {
      await n.ventana(ancho, alto, escala);
      for (const hash of ['#/inicio', '#/docentes', '#/reservar/1', '#/reservas']) {
        await n.ir(hash);
        const sobra = await n.evaluar('document.documentElement.scrollWidth - document.documentElement.clientWidth');
        assert.ok(sobra <= 0, `${hash}: sobran ${sobra}px`);
      }
    });
  }
});
