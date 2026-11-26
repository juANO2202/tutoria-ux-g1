# Hallazgos

Origen: **inspección** (heurísticas, recorrido cognitivo y WCAG) sobre la v1. Los hallazgos de usuarios se agregan en la segunda parte, solo después de las sesiones. Capturas en [`evidencias/antes/`](../evidencias/antes/).

## H-01 · Los errores no señalan el campo (severidad 3)

- **Fuente:** Nielsen H9; WCAG 3.3.1 y 1.3.1.
- **Evidencia:** [captura](../evidencias/antes/03-error-validacion-movil.png). `mediciones.json`: 0 campos con `aria-invalid`, `aria-describedby` nulo, 0 enlaces en la alerta y foco en `BODY`.
- **Impacto:** quien usa lector de pantalla o teclado no sabe qué campo corregir; bloquea la recuperación en el flujo principal.
- **Recomendación:** resumen enlazado que reciba el foco, mensaje junto a cada campo, `aria-invalid` y `aria-describedby`.
- **Estado:** ⏳ por corregir (**prioritario 1**).

## H-02 · La revisión no permite editar directamente (severidad 2)

- **Fuente:** Nielsen H3 y H7.
- **Evidencia:** [captura](../evidencias/antes/05-revision-movil.png): solo «Atrás» y «Confirmar reserva». `mediciones-flujo.json`: 6 pulsaciones para ir del paso 4 al 1 y volver.
- **Recomendación:** enlace «Editar» por sección y botón «Guardar y volver a revisar».
- **Estado:** ⏳ backlog. No se pierden datos, por eso no se priorizó.

## H-03 · El foco se pierde y el título no cambia (severidad 3)

- **Fuente:** WCAG 2.4.3 y 2.4.2.
- **Evidencia:** `mediciones.json`: `focoTrasAvanzar` es `BODY` y `tituloDocumento` es «Tutoría UX».
- **Impacto:** con teclado hay que recorrer otra vez la cabecera en cada paso; un lector de pantalla no anuncia la pantalla nueva.
- **Recomendación:** enfocar el encabezado y actualizar `document.title`.
- **Estado:** ⏳ por corregir (corrección adicional).

## H-04 · La cancelación no identifica la reserva (severidad 3)

- **Fuente:** Nielsen H5 y H6.
- **Evidencia:** `mediciones.json`: `mensajeCancelar` = «¿Está seguro?» (diálogo nativo). La captura de [Mis reservas](../evidencias/antes/08-mis-reservas-movil.png) muestra la pantalla de origen; el diálogo nativo no aparece en capturas automáticas.
- **Impacto:** puede cancelarse la reserva equivocada y la acción no se deshace.
- **Recomendación:** diálogo con código, asignatura, docente, fecha y consecuencia; botones con verbos; foco inicial en la opción segura.
- **Estado:** ⏳ por corregir (**prioritario 2**).

## H-05 · Cambiar de docente borra fecha y hora sin avisar (severidad 2)

- **Fuente:** Nielsen H1.
- **Evidencia:** `mediciones-flujo.json`: tras cambiar de docente, `fecha` y `hora` quedan vacías y no hay texto que lo informe.
- **Recomendación:** mensaje de estado que explique que el horario depende del docente.
- **Estado:** ⏳ backlog.

## H-06 · Modificar sobrescribe una reserva nueva a medio llenar (severidad 2)

- **Fuente:** Nielsen H5; requisito de conservar datos.
- **Evidencia:** `mediciones-flujo.json`: con un borrador nuevo, pulsar «Modificar» y luego «Descartar cambios» deja el borrador en `null`.
- **Recomendación:** guardar por separado el borrador nuevo y el de edición.
- **Estado:** ⏳ backlog.

## H-07 · Texto de ejemplo con poco contraste (severidad 1)

- **Fuente:** WCAG 1.4.3. **Evidencia:** 3,06:1 (mínimo 4,5:1). La etiqueta y la ayuda sí cumplen.
- **Recomendación:** usar `--suave` (5,42:1). **Estado:** ⏳ backlog.

## H-08 · Borde tenue en opciones no seleccionadas (severidad 1)

- **Fuente:** WCAG 1.4.11. **Evidencia:** 1,6:1; ver [horario](../evidencias/antes/04-horario-movil.png).
- **Recomendación:** borde con al menos 3:1. **Estado:** ⏳ backlog.

## H-09 · Enlace de 21 px de alto en Inicio (severidad 1)

- **Fuente:** WCAG 2.5.8 (cumple por espaciado). **Evidencia:** `mediciones.json`, `objetivosMenores24px`.
- **Recomendación:** área táctil de 44 px. **Estado:** ⏳ backlog.

## Criterio de priorización

Severidad 3: H-01, H-03 y H-04. Los dos prioritarios son **H-01** (afecta a la recuperación en todos los pasos y falla un criterio de nivel A) y **H-04** (única acción irreversible). H-03 también se corregirá por ser de nivel A.

---

## Hallazgos de las sesiones con usuarios (P01, P02)

**PENDIENTE.** No agregar nada que no se haya observado. Si un hallazgo de usuario coincide con uno anterior, anotar la evidencia debajo de él.

| ID | Participante y tarea | Qué ocurrió (hecho observado o cita) | Severidad 0–4 | Recomendación | Estado |
|---|---|---|---|---|---|
| U-01 | | | | | |
| U-02 | | | | | |

Si P01 o P02 revelan un problema de severidad 3 o 4, corregirlo en un commit propio y reevaluarlo.
