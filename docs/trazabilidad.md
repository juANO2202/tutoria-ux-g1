# Matriz de trazabilidad

| Req. | Pantallas (ruta) | Wireframe | Componentes | Caso de uso / dominio | Pruebas | Hallazgos |
|---|---|---|---|---|---|---|
| R1 | Docentes (`#/docentes`) | W1 | `views/docentes.js` | `consultarDocentes`, `listarAsignaturas` | «R1» en `reservas.test.mjs`; e2e reflow | — |
| R2 | Pasos 1 y 2 | W2 | `views/asistente.js`, `grupoOpciones`, `indicadorPasos` | `consultarDisponibilidad`, `validarPaso`, `disponibilidad.js`, `borrador.js` | «R2», «Borrador»; e2e «retroceder y recargar» | H-01, H-03, H-05 |
| R3 | Pasos 3 y 4, Confirmación | W2, W3 | `resumenReserva`, `views/confirmacion.js`, `components/errores.js` | `registrar`, `crearReserva` | «R3»; e2e camino exitoso, validación, fallo y horario ocupado; H-01 | H-01, H-02, H-07, H-08 |
| R4 | Mis reservas (`#/reservas`) | W3 | `views/mis-reservas.js`, `insigniaEstado` | `listar`, `estadoVigente` | «R4»; e2e camino exitoso | H-09 |
| R5 | Mis reservas → pasos 1–4 | W3 | `views/asistente.js` | `modificar`, `borrador.desdeReserva` | «R5»; e2e camino exitoso | H-02, H-06 |
| R6 | Mis reservas + diálogo | W3 | `components/dialogo.js` | `cancelar`, `cancelarReserva` | «R6»; e2e camino exitoso y H-04 | H-04 |

## De la necesidad a la prueba con usuarios

| Tarea | Requisitos | Touchpoints |
|---|---|---|
| T1 Reservar | R1, R2, R3 | TP1–TP4 |
| T2 Modificar | R4, R5 | TP5 |
| T3 Recuperarse y cancelar | R3, R4, R6 | TP4, TP5 |

## De hallazgo a commit

Completar con el hash después de subir (`git log --oneline`).

| Hallazgo | Commit sugerido | Hash real | Prueba |
|---|---|---|---|
| H-01 | `fix(ux): asocia los errores a cada campo y enfoca el resumen (H-01)` | _completar_ | `correcciones.e2e.mjs` H-01 |
| H-04 | `fix(ux): confirma la cancelacion identificando la reserva (H-04)` | _completar_ | `correcciones.e2e.mjs` H-04 |
| H-03 | `fix(a11y): enfoca el encabezado y actualiza el titulo al navegar (H-03)` | _completar_ | `correcciones.e2e.mjs` H-03 |
