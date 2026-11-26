// Controlador mínimo de Chrome/Edge mediante el protocolo DevTools. Sin dependencias (Node 22+).
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { crearServidor } from '../../tools/serve.mjs';

const RUTAS = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
];

export const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

export async function abrirNavegador() {
  const ejecutable = RUTAS.find((r) => r && existsSync(r));
  if (!ejecutable) throw new Error('No se encontró Chrome ni Edge. Defina la variable CHROME_PATH.');

  const servidor = crearServidor();
  await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${servidor.address().port}/src/presentation/`;

  const perfil = await mkdtemp(join(tmpdir(), 'tutoria-e2e-'));
  const proceso = spawn(ejecutable, [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${perfil}`,
    '--no-first-run', '--no-default-browser-check', '--disable-gpu', 'about:blank',
  ], { stdio: 'ignore' });

  let puerto;
  for (let i = 0; i < 100 && !puerto; i += 1) {
    await pausa(100);
    puerto = await readFile(join(perfil, 'DevToolsActivePort'), 'utf8')
      .then((t) => t.split('\n')[0]).catch(() => null);
  }
  const paginas = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
  const socket = new WebSocket(paginas.find((p) => p.type === 'page').webSocketDebuggerUrl);
  await new Promise((ok, mal) => { socket.onopen = ok; socket.onerror = mal; });

  let secuencia = 0;
  const pendientes = new Map();
  const erroresPagina = [];
  socket.onmessage = ({ data }) => {
    const m = JSON.parse(data);
    if (m.method === 'Runtime.exceptionThrown') {
      erroresPagina.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
    }
    const p = pendientes.get(m.id);
    if (!p) return;
    pendientes.delete(m.id);
    if (m.error) p.mal(new Error(m.error.message));
    else p.ok(m.result);
  };
  const enviar = (method, params = {}) => new Promise((ok, mal) => {
    secuencia += 1;
    pendientes.set(secuencia, { ok, mal });
    socket.send(JSON.stringify({ id: secuencia, method, params }));
  });
  await enviar('Runtime.enable');
  await enviar('Page.enable');

  async function evaluar(expresion) {
    const { result, exceptionDetails } = await enviar('Runtime.evaluate', {
      expression: expresion, returnByValue: true, awaitPromise: true,
    });
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
    return result.value;
  }

  async function esperar(expresion, ms = 4000) {
    const limite = Date.now() + ms;
    while (Date.now() < limite) {
      if (await evaluar(`Boolean(${expresion})`)) return;
      await pausa(50);
    }
    throw new Error(`No se cumplió a tiempo: ${expresion}`);
  }

  const navegador = {
    erroresPagina,
    evaluar,
    esperar,
    enviar,
    async ir(hash = '#/inicio', consulta = '') {
      await enviar('Page.navigate', { url: 'about:blank' });
      await esperar("location.href === 'about:blank'");
      await enviar('Page.navigate', { url: `${base}${consulta}${hash}` });
      await esperar("document.querySelector('main h1')");
    },
    ventana: (width, height, escala = 1) => enviar('Emulation.setDeviceMetricsOverride', {
      width, height, deviceScaleFactor: escala, mobile: false,
    }),
    async clic(selector) {
      await esperar(`document.querySelector(${JSON.stringify(selector)})`);
      await evaluar(`document.querySelector(${JSON.stringify(selector)}).click()`);
      await pausa(60);
    },
    /** Clic en el primer botón o enlace cuyo texto coincida exactamente. */
    async pulsar(texto) {
      const buscar = `[...document.querySelectorAll('main button, main a, dialog button')].find((e) => e.textContent.trim() === ${JSON.stringify(texto)})`;
      await esperar(buscar);
      await evaluar(`${buscar}.click()`);
      await pausa(60);
    },
    async escribir(selector, valor, evento = 'input') {
      await evaluar(`(() => { const e = document.querySelector(${JSON.stringify(selector)});
        e.value = ${JSON.stringify(valor)}; e.dispatchEvent(new Event('${evento}', { bubbles: true })); })()`);
      await pausa(60);
    },
    async tecla(key, code = key, windowsVirtualKeyCode = 9) {
      for (const type of ['keyDown', 'keyUp']) {
        await enviar('Input.dispatchKeyEvent', { type, key, code, windowsVirtualKeyCode });
      }
      await pausa(30);
    },
    async captura(ruta, { completa = true } = {}) {
      const { data } = await enviar('Page.captureScreenshot', {
        format: 'png', captureBeyondViewport: completa,
      });
      await writeFile(ruta, Buffer.from(data, 'base64'));
    },
    async cerrar() {
      socket.close();
      const fin = new Promise((r) => proceso.once('exit', r));
      proceso.kill();
      await fin;
      servidor.closeAllConnections();
      servidor.close();
      await rm(perfil, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 }).catch(() => {});
    },
  };
  return navegador;
}

/** Recorre los tres primeros pasos con el primer horario libre. */
export async function completarAsistente(n, { motivo = 'Dudas sobre la matriz de trazabilidad' } = {}) {
  await n.ir('#/reservar/1');
  await n.escribir('#asignaturaId', 'hci', 'change');
  await n.escribir('#docenteId', 'vaca', 'change');
  await n.pulsar('Continuar');
  await n.clic('#modalidad-presencial');
  await n.clic('input[name=fecha]:not([disabled]) ~ label, input[name=fecha]:not([disabled])');
  // El primer día puede tener un solo horario ocupado: se busca el primero con horario libre.
  await n.evaluar(`(async () => {
    for (let i = 0; i < 10; i += 1) {
      if (document.querySelector('input[name=hora]:not([disabled])')) break;
      [...document.querySelectorAll('input[name=fecha]:not([disabled])')][i + 1]?.click();
    }
  })()`);
  await n.clic('input[name=hora]:not([disabled])');
  await n.pulsar('Continuar');
  await n.escribir('#motivo', motivo);
  await n.pulsar('Continuar');
}

/** Confirma el diálogo de cancelación, sea el nativo (v1) o el propio de la aplicación (v2). */
export async function cancelarPrimeraReserva(n) {
  await n.evaluar('window.confirm = () => true');
  await n.clic('button[aria-label^="Cancelar reserva"]');
  if (await n.evaluar("Boolean(document.querySelector('dialog[open]'))")) {
    await n.clic('dialog[open] [data-confirmar]');
  }
}
