// Verifica el cálculo de métricas con datos de ejemplo que viven solo dentro de esta prueba.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calcular, informe, leerCSV, puntajeSUS } from '../tools/metricas.mjs';

describe('Herramienta de métricas', () => {
  it('calcula SUS en sus extremos y en el punto medio', () => {
    assert.equal(puntajeSUS([5, 1, 5, 1, 5, 1, 5, 1, 5, 1]), 100);
    assert.equal(puntajeSUS([1, 5, 1, 5, 1, 5, 1, 5, 1, 5]), 0);
    assert.equal(puntajeSUS(Array(10).fill(3)), 50);
  });

  it('lee comillas, comas y saltos de línea de Windows', () => {
    assert.deepEqual(leerCSV('a,b\r\n"uno, dos","dijo ""sí"""\r\n'), [{ a: 'uno, dos', b: 'dijo "sí"' }]);
  });

  it('sin datos declara las métricas como pendientes', () => {
    assert.match(informe(calcular([], [])), /PENDIENTE/);
  });

  it('excluye el pilotaje P00 y señala las tareas que faltan', () => {
    const fila = (participante) => ({
      participante, version: 'v1', tarea: 'T1', tiempo_s: '10', exito: 'si', errores: '0', ayudas: '0', seq: '7',
    });
    const r = calcular([fila('P00'), fila('P01')], []);
    assert.equal(r.filas.length, 1);
    assert.equal(r.faltan.length, 5);
    assert.match(informe(r), /INCOMPLETO/);
  });

  it('rechaza valores vacíos o fuera de rango', () => {
    const base = { participante: 'P01', version: 'v1', tarea: 'T1', tiempo_s: '', exito: 'si', errores: '0', ayudas: '0', seq: '7' };
    assert.throws(() => calcular([base], []), /tiempo_s/);
    assert.throws(() => calcular([{ ...base, tiempo_s: '5', seq: '9' }], []), /seq/);
  });
});
