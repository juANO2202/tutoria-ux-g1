// Calcula las métricas SOLO a partir de los datos registrados en las sesiones reales.
// Uso: npm run metricas
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const TAREAS = ['T1', 'T2', 'T3'];
const PARTICIPANTES = ['P01', 'P02']; // P00 es el pilotaje y no entra en las métricas.
const EXITOS = ['si', 'parcial', 'no'];

export function leerCSV(texto) {
  const filas = [];
  let fila = [];
  let celda = '';
  let comillas = false;
  const limpio = texto.replace(/^﻿/, '').replace(/\r/g, '');
  for (let i = 0; i < limpio.length; i += 1) {
    const c = limpio[i];
    if (comillas) {
      if (c === '"' && limpio[i + 1] === '"') { celda += '"'; i += 1; } else if (c === '"') comillas = false;
      else celda += c;
    } else if (c === '"') comillas = true;
    else if (c === ',') { fila.push(celda); celda = ''; } else if (c === '\n') {
      filas.push([...fila, celda]); fila = []; celda = '';
    } else celda += c;
  }
  if (celda || fila.length) filas.push([...fila, celda]);
  const [cabecera = [], ...resto] = filas;
  return resto.filter((f) => f.some((v) => v.trim()))
    .map((f) => Object.fromEntries(cabecera.map((k, i) => [k.trim(), (f[i] ?? '').trim()])));
}

function entero(valor, min, max, donde) {
  const n = Number(valor);
  if (valor === '' || !Number.isInteger(n) || n < min || n > max) {
    throw new Error(`${donde}: se esperaba un entero entre ${min} y ${max}, llegó «${valor}».`);
  }
  return n;
}

export function puntajeSUS(respuestas) {
  if (respuestas.length !== 10) throw new Error('SUS requiere 10 respuestas.');
  const suma = respuestas.reduce((s, v, i) => {
    const x = entero(v, 1, 5, `SUS pregunta ${i + 1}`);
    return s + (i % 2 === 0 ? x - 1 : 5 - x);
  }, 0);
  return suma * 2.5;
}

const promedio = (lista) => lista.reduce((s, x) => s + x, 0) / lista.length;

export function calcular(sesiones, sus) {
  const reales = sesiones.filter((f) => PARTICIPANTES.includes(f.participante));
  const faltan = PARTICIPANTES.flatMap((p) => TAREAS
    .filter((t) => reales.filter((f) => f.participante === p && f.tarea === t && f.version === 'v1').length !== 1)
    .map((t) => `${p}-${t}`));
  const filas = reales.map((f) => {
    const donde = `${f.participante} ${f.tarea} (${f.version})`;
    if (!EXITOS.includes(f.exito)) throw new Error(`${donde}: éxito debe ser si, parcial o no.`);
    return {
      ...f,
      tiempo: entero(f.tiempo_s, 1, 3600, `${donde} tiempo_s`),
      errores: entero(f.errores, 0, 99, `${donde} errores`),
      ayudas: entero(f.ayudas, 0, 99, `${donde} ayudas`),
      seq: entero(f.seq, 1, 7, `${donde} seq`),
    };
  });
  const resumen = ['v1', 'v2'].flatMap((version) => TAREAS.map((tarea) => {
    const g = filas.filter((f) => f.version === version && f.tarea === tarea);
    if (!g.length) return null;
    return {
      version, tarea, n: g.length,
      exitos: g.filter((f) => f.exito === 'si').length,
      parciales: g.filter((f) => f.exito === 'parcial').length,
      tiempo: promedio(g.map((f) => f.tiempo)),
      errores: g.reduce((s, f) => s + f.errores, 0),
      ayudas: g.reduce((s, f) => s + f.ayudas, 0),
      seq: promedio(g.map((f) => f.seq)),
    };
  }).filter(Boolean));
  const puntajes = sus.filter((f) => PARTICIPANTES.includes(f.participante)).map((f) => ({
    participante: f.participante,
    version: f.version,
    sus: puntajeSUS(Array.from({ length: 10 }, (_, i) => f[`q${i + 1}`])),
  }));
  return { filas, resumen, puntajes, faltan };
}

export function informe({ filas, resumen, puntajes, faltan }) {
  const cabecera = '# Métricas de las pruebas con usuarios\n\n> Archivo generado con `npm run metricas` a partir de `sesiones.csv` y `sus.csv`. No se edita a mano.\n';
  if (!filas.length) {
    return `${cabecera}\n**PENDIENTE:** todavía no hay sesiones reales registradas de P01 y P02.\n`;
  }
  const tabla = (titulos, datos) => [titulos, titulos.map(() => '---'), ...datos]
    .map((f) => `| ${f.join(' | ')} |`).join('\n');
  return `${cabecera}
${faltan.length ? `**INCOMPLETO:** faltan en v1: ${faltan.join(', ')}.\n` : ''}
## Detalle por participante

${tabla(['Participante', 'Versión', 'Tarea', 'Tiempo (s)', 'Éxito', 'Errores', 'Ayudas', 'SEQ (1–7)'],
    filas.map((f) => [f.participante, f.version, f.tarea, f.tiempo, f.exito, f.errores, f.ayudas, f.seq]))}

## Resumen por tarea

${tabla(['Versión', 'Tarea', 'n', 'Éxito completo', 'Parcial', 'Tiempo medio (s)', 'Errores', 'Ayudas', 'SEQ medio'],
    resumen.map((r) => [r.version, r.tarea, r.n, `${r.exitos}/${r.n}`, r.parciales,
      r.tiempo.toFixed(1), r.errores, r.ayudas, r.seq.toFixed(1)]))}

## SUS

${puntajes.length ? tabla(['Participante', 'Versión', 'SUS (0–100)'], puntajes.map((p) => [p.participante, p.version, p.sus]))
    : 'Sin cuestionarios SUS registrados (SEQ cubre la satisfacción por tarea).'}

Con dos participantes estas cifras describen lo observado; no permiten generalizar ni afirmar mejoras estadísticas.
`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const ruta = (n) => fileURLToPath(new URL(`../evaluacion/resultados/${n}`, import.meta.url));
  try {
    const datos = calcular(leerCSV(readFileSync(ruta('sesiones.csv'), 'utf8')),
      leerCSV(readFileSync(ruta('sus.csv'), 'utf8')));
    writeFileSync(ruta('metricas.md'), informe(datos));
    console.log(`metricas.md actualizado (${datos.filas.length} filas de P01/P02).`);
    if (datos.faltan.length) console.log(`Faltan en v1: ${datos.faltan.join(', ')}`);
  } catch (error) {
    console.error(`No se generaron métricas: ${error.message}`);
    process.exitCode = 1;
  }
}
