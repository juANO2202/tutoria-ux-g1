# Evaluación heurística (Nielsen) · v1

| Dato | Valor |
|---|---|
| Fecha | 2026-11-26 |
| Objeto | v1 en vista móvil (390 px) y escritorio (1366 px) |
| Método | Inspección del código y ejecución automatizada en Chrome con capturas y mediciones |
| Evaluador | **Asistente de IA (Claude).** No es una evaluación independiente: la misma herramienta ayudó a construir la v1. |
| Verificación del equipo | **Pendiente.** Cada integrante reproduce los casos y llena la última tabla. |

| Heurística | Observado en v1 | Hallazgo | Severidad |
|---|---|---|---|
| H1 Visibilidad del estado | Indicador de pasos, «Guardando…», estados con texto. Al cambiar de docente se borran fecha y hora sin avisar. | H-05 | 2 |
| H2 Correspondencia con el mundo real | Fechas escritas en español, términos propios del contexto. | — | 0 |
| H3 Control y libertad | Hay «Atrás» y «Descartar cambios». Para corregir el paso 1 desde la revisión se necesitan 6 pulsaciones entre ir y volver. | H-02 | 2 |
| H4 Consistencia y estándares | Botones y estados uniformes; controles nativos. | — | 0 |
| H5 Prevención de errores | Ocupados deshabilitados y revisión previa. La cancelación solo pregunta «¿Está seguro?». Modificar sobrescribe sin aviso una reserva nueva a medio llenar. | H-04, H-06 | 3, 2 |
| H6 Reconocer antes que recordar | Hay resumen antes de confirmar. El diálogo de cancelar obliga a recordar qué tarjeta se pulsó. | H-04 | 3 |
| H7 Flexibilidad y eficiencia | Se puede reservar desde la ficha del docente. La revisión no ofrece atajos de edición. | H-02 | 2 |
| H8 Diseño estético y minimalista | Una decisión por paso, sin contenido sobrante. | — | 0 |
| H9 Reconocer y recuperarse de errores | Los mensajes se juntan en un bloque; no señalan el campo ni llevan a él. | H-01 | 3 |
| H10 Ayuda y documentación | Ayuda contextual en el motivo y la modalidad. Suficiente para el alcance. | — | 0 |

Detalle, evidencia y recomendación en [hallazgos.md](hallazgos.md).

## Verificación del equipo (completar)

| Integrante | Hallazgos reproducidos | ¿Cambiaría alguna severidad? ¿Por qué? | Problemas nuevos |
|---|---|---|---|
| Juan | | | |
| Shantall | | | |
| Korayma | | | |
| Sandro | | | |
