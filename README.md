# Tutoría UX · Gestión de tutorías universitarias

Interacción Humano-Computador · Grupo 1 · 2026. Aplicación web para consultar docentes y asignaturas, reservar una tutoría y consultarla, modificarla o cancelarla.

## Estado del proyecto

| Etapa | Estado | Dónde |
|---|---|---|
| Análisis UX y curva emocional | Hecho (hipótesis por validar) | [ux/analisis-ux.md](ux/analisis-ux.md) |
| Requisitos y arquitectura de información | Hecho | [docs/](docs/) |
| Prototipo navegable | Hecho | [ux/prototipo/](ux/prototipo/) |
| Implementación y pruebas funcionales | Hecho | [src/](src/), [tests/](tests/) |
| Heurísticas, recorrido cognitivo y WCAG | Inspección asistida por IA; **verificación del equipo pendiente** | [evaluacion/](evaluacion/) |
| Pilotaje P00 | **Pendiente** | [evaluacion/piloto-P00.md](evaluacion/piloto-P00.md) |
| Sesiones P01 y P02 y métricas | **Pendiente** | [evaluacion/resultados/](evaluacion/resultados/) |
| Corrección de dos problemas prioritarios | Hecho (H-01, H-04 y además H-03) | [evaluacion/hallazgos.md](evaluacion/hallazgos.md) |
| Reevaluación v2 | Técnica hecha; **con usuarios pendiente** | [evaluacion/reevaluacion-v2.md](evaluacion/reevaluacion-v2.md) |

## Instalación

Requisitos: [Node.js](https://nodejs.org) 22 o superior. Las pruebas en navegador necesitan Chrome o Edge. No hay paquetes que instalar.

```powershell
git clone <URL-DEL-REPOSITORIO>
```

## Ejecución

```powershell
npm start
```

Abrir <http://localhost:5173/>. Para otro puerto en PowerShell: `$env:PORT=8080; npm start`. La aplicación necesita servidor: abrir el HTML con doble clic no carga los módulos.

| Para probar | Dirección |
|---|---|
| Fallo al guardar (una vez) | `http://localhost:5173/src/presentation/?fallo=guardar` |
| Horario que se ocupa al confirmar (una vez) | `http://localhost:5173/src/presentation/?fallo=ocupado` |
| Estado inicial | Botón «Restablecer datos de demostración» al pie |

Versión anterior a las correcciones: `git worktree add ../tutoria-v1 v1` y `npm start` dentro de esa carpeta.

## Pruebas

```powershell
npm test
```

```powershell
npm run test:e2e
```

La primera cubre los casos de uso (R1–R6), el borrador y el cálculo de métricas. La segunda recorre la aplicación en un navegador real: camino exitoso, errores y recuperación, conservación de datos, reflujo en cuatro anchos y las correcciones de la v2. Si el navegador no se detecta, definir `CHROME_PATH`.

```powershell
npm run metricas
```

Genera `evaluacion/resultados/metricas.md` solo a partir de las sesiones registradas.

## Funcionalidades

- Consulta y búsqueda de docentes y asignaturas (R1).
- Selección de modalidad, fecha y horario con disponibilidad (R2).
- Registro en cuatro pasos con validación, revisión y código de confirmación (R3).
- Lista de reservas con estados Confirmada, Modificada, Cancelada y Finalizada (R4).
- Modificación (R5) y cancelación con confirmación (R6).
- Borrador que sobrevive a retrocesos, recargas y errores.
- Diseño mobile first, HTML semántico, enlace de salto, foco visible y errores accesibles.

## Arquitectura

```
src/
├── domain/          reglas de reserva, disponibilidad, errores
├── application/     casos de uso y borrador
├── infrastructure/  localStorage, catálogo, reloj, fallos simulados
├── presentation/    enrutador, vistas, componentes, estilos
└── main.js          raíz de composición
```

Diagrama y decisiones en [docs/arquitectura.md](docs/arquitectura.md).

## Limitaciones

- Sin servidor ni autenticación: las reservas se guardan en `localStorage` y solo existen en ese navegador.
- Docentes, oficinas, salas y disponibilidad son **ficticios**. La disponibilidad se calcula sobre los próximos diez días hábiles.
- Los horarios ocupados por «otras personas» se simulan (el primero de cada docente y modalidad); cambian al pasar los días.
- No hay concurrencia real ni sincronización entre pestañas.
- Sin feriados ni calendario académico. No se envían correos ni enlaces de videollamada.
- La revisión de accesibilidad es parcial: faltan lector de pantalla, zoom y recorrido manual.
- Hallazgos pendientes: ver [backlog](evaluacion/backlog.md).

## Documentación y evidencias

- [Requisitos](docs/requisitos.md) · [Sitemap](docs/sitemap.md) · [User flow](docs/flujo-usuario.md) · [Arquitectura](docs/arquitectura.md) · [Trazabilidad](docs/trazabilidad.md)
- [Análisis UX](ux/analisis-ux.md) · [Wireframes](ux/wireframes/) · [Prototipo](ux/prototipo/)
- [Plan](evaluacion/plan.md) · [Consentimiento](evaluacion/consentimiento.md) · [Piloto](evaluacion/piloto-P00.md) · [Heurísticas](evaluacion/heuristicas.md) · [Recorrido cognitivo](evaluacion/recorrido-cognitivo.md) · [Accesibilidad](evaluacion/accesibilidad.md)
- [Resultados y métricas](evaluacion/resultados/) · [Hallazgos](evaluacion/hallazgos.md) · [Backlog](evaluacion/backlog.md) · [Reevaluación](evaluacion/reevaluacion-v2.md)
- Evidencias [antes](evidencias/antes/) y [después](evidencias/despues/)
- [Contribuciones por integrante](CONTRIBUCIONES.md)

## Uso de asistencia de IA

El código, las pruebas, los diagramas, la documentación base, las mediciones automáticas y la inspección inicial (heurísticas, recorrido cognitivo y accesibilidad) se produjeron con asistencia de **Claude (Anthropic)**. Cada integrante sube, revisa y debe poder defender las partes que figuran a su nombre en [CONTRIBUCIONES.md](CONTRIBUCIONES.md). El pilotaje, las sesiones con usuarios y sus resultados los realiza y registra el equipo; ninguno es simulado.
