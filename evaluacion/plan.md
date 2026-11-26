# Plan de evaluación de usabilidad

## Objetivo y preguntas

Determinar si una persona ajena al desarrollo puede reservar, modificar y cancelar una tutoría sin ayuda, y recuperarse de un fallo sin perder datos.

1. ¿Dónde duda al elegir horario (momento crítico TP2)?
2. ¿Reconoce que la reserva quedó registrada (TP4)?
3. ¿Se recupera de un error sin reescribir?
4. ¿Distingue qué reserva va a cancelar?

## Secuencia

| Fase | Qué | Versión | Estado |
|---|---|---|---|
| 1 | Pilotaje P00 y ajustes al protocolo | v1 | **Pendiente (equipo)** |
| 2 | Heurísticas, recorrido cognitivo y WCAG | v1 | Hecho (inspección asistida por IA; falta verificación del equipo) |
| 3 | Sesiones P01 y P02 | v1 | **Pendiente (equipo)** |
| 4 | Consolidar hallazgos y priorizar | — | Inspección hecha; falta sumar lo observado con usuarios |
| 5 | Corregir problemas prioritarios | v2 | Hecho: H-01 y H-04 (más H-03) |
| 6 | Reevaluación | v2 | Técnica hecha; **con usuarios pendiente** |

La v1 es la etiqueta `v1` del repositorio. Para ejecutarla sin perder el trabajo actual:

```powershell
git worktree add ../tutoria-v1 v1
```

Luego, dentro de `../tutoria-v1`, ejecutar `npm start`. Para detener y volver, cerrar el servidor y regresar a la carpeta del repositorio.

## Participantes

- **P00** (pilotaje), **P01** y **P02**: estudiantes que **no desarrollaron** la aplicación ni la han visto. P01 y P02 deben ser personas distintas entre sí y de P00.
- Solo se registra el código. No se anotan nombres, correos ni rostros.

## Tareas y criterios de éxito observables

Antes de **cada participante**: abrir la app y pulsar «Restablecer datos de demostración».

| Tarea | Enunciado que se lee al participante | Éxito (se cumple todo, sin ayuda) | Referencia de tiempo |
|---|---|---|---|
| **T1** Reservar | «Necesita ayuda con Bases de Datos y prefiere que sea virtual. Averigüe quién puede atenderle y reserve una tutoría en un horario disponible, explicando su duda.» | Aparece «Reserva confirmada» con código; asignatura Bases de Datos y modalidad Virtual. | 180 s |
| **T2** Modificar | «Le surgió un compromiso ese día. Cambie esa tutoría a otro día, sin cambiar nada más.» | Aparece «Cambios guardados»; mismo código, fecha distinta; asignatura, docente, modalidad y motivo sin cambios. | 120 s |
| **T3** Recuperarse y cancelar | «Reserve además una tutoría presencial de Interacción Humano-Computador. Si ocurre algún problema, resuélvalo. Después, ya no necesita la de Bases de Datos: anúlela.» | La de HCI queda Confirmada tras el fallo sin que el moderador intervenga; la de Bases de Datos queda Cancelada; la de HCI no se cancela. | 240 s |

**Preparación de T3:** antes de leerla, el moderador edita la dirección a `http://localhost:5173/src/presentation/?fallo=guardar#/inicio` y recarga. Las reservas se conservan y el primer guardado fallará.

El tiempo de referencia no decide el éxito; sirve para detectar demoras.

## Métricas

| Métrica | Definición |
|---|---|
| Tiempo | Segundos desde que termina la lectura del enunciado hasta que la persona dice «listo» o abandona. |
| Éxito | `si`: cumple el criterio sin ayuda. `parcial`: cumple con ayuda, o cumple solo una parte. `no`: no lo cumple. |
| Error | Acción que aleja del objetivo o requiere corregirse (opción equivocada, envío rechazado). El fallo simulado no cuenta. |
| Ayuda | Cada pista verbal del moderador. |
| SEQ | Tras cada tarea: «¿Qué tan fácil fue?» 1 muy difícil, 7 muy fácil. |
| SUS | Al final: 10 afirmaciones de 1 a 5. |

## Guion del moderador

1. Leer: «Probamos la aplicación, no a usted. Puede detenerse cuando quiera. Piense en voz alta.»
2. Firmar el [consentimiento](consentimiento.md).
3. Leer cada tarea literalmente. No señalar la pantalla.
4. Si se bloquea más de 60 s: preguntar «¿Qué está buscando?». Si después se da una pista, se cuenta como ayuda.
5. Pedir SEQ tras cada tarea y SUS al final.
6. Preguntar: «¿Qué fue lo más confuso?» y «¿Cómo supo que la reserva quedó guardada?».

## Roles y registro

Un **moderador** y un **observador**. El observador usa [`instrumentos/registro-sesion.html`](instrumentos/registro-sesion.html), pega las filas en `resultados/sesiones.csv` y `resultados/sus.csv`, completa la hoja de observación y ejecuta `npm run metricas`.

## Severidad (Nielsen, 0–4)

0 no es un problema · 1 cosmético · 2 menor · 3 mayor, prioridad alta · 4 catastrófico, debe corregirse antes de publicar. Se valora frecuencia, impacto y persistencia.

## Amenazas a la validez

Muestra de dos personas, datos simulados, entorno controlado y fallo inducido. Los resultados describen lo observado y no se generalizan.
