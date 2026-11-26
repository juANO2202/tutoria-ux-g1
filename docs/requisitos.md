# Requisitos

## Funcionales

| ID | Requisito | Criterios de aceptación | Origen |
|---|---|---|---|
| **R1** | El estudiante **consulta** docentes y asignaturas. | Lista docentes con sus asignaturas, oficina y sala. Filtra por asignatura y busca por texto sin distinguir tildes. Si no hay resultados, lo dice y sugiere cómo seguir. | N1, TP1 |
| **R2** | El estudiante **selecciona** asignatura, docente, modalidad, fecha y horario. | Solo se ofrecen días hábiles futuros con agenda. Los ocupados aparecen rotulados y no se pueden elegir. Se muestra oficina o sala. Retroceder conserva las selecciones. | N2, N3, TP2 |
| **R3** | El estudiante **registra** la reserva. | Motivo de 10 a 300 caracteres. Hay un paso de revisión. Mientras guarda muestra «Guardando…» y bloquea el botón. Al terminar muestra un código `TUT-####`. Ante un error explica qué pasó y conserva los datos. | N3, N4, TP3, TP4 |
| **R4** | El estudiante **consulta** sus reservas. | Cada reserva muestra código, datos y estado en texto: Confirmada, Modificada, Cancelada o Finalizada. Las activas van primero. Hay estado vacío. Persisten al recargar. | N4, N5, TP5 |
| **R5** | El estudiante **modifica** una reserva activa. | El asistente se abre con los datos cargados. Conserva el código y pasa a «Modificada». Puede descartar los cambios. Si algo falla, la reserva original no cambia. | N3, N5, TP5 |
| **R6** | El estudiante **cancela** una reserva activa. | Pide confirmación. Pasa a «Cancelada», se muestra un mensaje y el horario queda libre. No se puede cancelar dos veces. | N5, TP5 |

## Reglas de negocio

1. Un horario solo admite una reserva activa.
2. El estudiante no puede tener dos reservas activas en la misma fecha y hora.
3. El docente debe dictar la asignatura elegida.
4. Solo se modifican o cancelan reservas activas (Confirmada o Modificada).
5. Una reserva cuya fecha pasó se muestra como Finalizada.
6. Al modificar, el horario propio sigue disponible para esa reserva.

## No funcionales

| ID | Requisito | Verificación |
|---|---|---|
| RNF1 | Mobile first y sin desplazamiento horizontal en 320, 360, 768 y 1366 px. | `npm run test:e2e` |
| RNF2 | HTML semántico, controles nativos, enlace de salto y foco visible. | `evaluacion/accesibilidad.md` |
| RNF3 | Persistencia local entre recargas; datos corruptos no rompen la app. | `npm test` |
| RNF4 | El texto del usuario nunca se interpreta como HTML. | `components/dom.js` |
| RNF5 | Sin dependencias externas en ejecución ni pruebas. | `package.json` |
