# Revisión de accesibilidad · WCAG 2.2 (niveles A y AA)

**Alcance:** criterios aplicables a este flujo; **no es una auditoría de conformidad completa.** Fecha: 2026-11-26. Revisión asistida por IA con mediciones automatizadas en Chrome y lectura del código. Datos en [`evidencias/antes/mediciones.json`](../evidencias/antes/mediciones.json).

**No probado:** lector de pantalla (NVDA, TalkBack o VoiceOver), zoom al 200 % y recorrido manual completo con teclado. Está en la lista de verificación del final.

| Criterio | Nivel | Método | v1 | Nota |
|---|---|---|---|---|
| 1.3.1 Información y relaciones | A | Código y DOM | **Falla** | v1: los errores no se asocian a su campo (H-01) |
| 1.4.3 Contraste del texto | AA | Cálculo sobre variables CSS | **Falla** parcial | Texto principal 14,71:1; secundario 5,42:1; error 6,89:1. El texto de ejemplo del motivo tiene 3,06:1 (H-07) |
| 1.4.10 Reflujo | AA | `scrollWidth` en 320, 360, 768 y 1366 px | Cumple | 0 px sobrantes en las pantallas medidas |
| 1.4.11 Contraste no textual | AA | Cálculo | En revisión | Borde de opciones no elegidas 1,6:1. El texto identifica la opción, pero el límite es poco visible (H-08) |
| 2.1.1 Teclado | A | Código: solo controles nativos | Cumple (código) | Falta recorrido manual completo |
| 2.4.1 Evitar bloques | A | E2E: primer Tab | Cumple | Enlace «Saltar al contenido» |
| 2.4.2 Título de la página | A | DOM | **Falla** | v1: título fijo en todas las pantallas (H-03) |
| 2.4.3 Orden del foco | A | `document.activeElement` | **Falla** | v1: el foco cae en `body` al cambiar de paso (H-03) |
| 2.4.7 Foco visible | AA | Código CSS | Cumple (código) | Contorno de 3 px; 5,02:1 sobre blanco |
| 2.5.8 Tamaño del objetivo | AA | Medición | Cumple por excepción | «Ver mis reservas» mide 21 px de alto, sin objetivos adyacentes (excepción de espaciado); se recomienda ampliarlo (H-09) |
| 3.1.1 Idioma | A | HTML | Cumple | `lang="es"` |
| 3.3.1 Identificación de errores | A | DOM | **Falla** | v1: 0 campos con `aria-invalid` (H-01) |
| 3.3.2 Etiquetas o instrucciones | A | Código | Cumple | `label` y `fieldset`/`legend` |
| 3.3.3 Sugerencia ante errores | AA | Revisión de textos | Cumple | Cada mensaje dice qué hacer |
| 3.3.4 Prevención de errores | AA | Flujo | Cumple | No es un caso legal ni financiero; hay revisión y confirmación |
| 3.3.7 Entrada redundante | A | E2E | Cumple | El borrador conserva lo ingresado |
| 4.1.2 Nombre, función, valor | A | Código | Cumple (código) | Botones repetidos con nombre que incluye docente o código |
| 4.1.3 Mensajes de estado | AA | Código | Cumple (código) | `role="status"` y `role="alert"`; falta oírlo con lector de pantalla |

## Verificación manual del equipo (completar)

| Prueba | Pasos | Resultado | Quién y fecha |
|---|---|---|---|
| Solo teclado | Completar T1, T2 y T3 sin tocar el ratón | | |
| Lector de pantalla | NVDA o TalkBack: errores, cambio de paso, diálogo | | |
| Zoom 200 % | Escritorio, flujo completo | | |
| Celular real | Android o iOS, flujo completo | | |
