// Enrutador por hash y ciclo de pintado.
import { vistaInicio } from './views/inicio.js';
import { vistaDocentes } from './views/docentes.js';
import { vistaAsistente } from './views/asistente.js';
import { vistaConfirmacion } from './views/confirmacion.js';
import { vistaMisReservas } from './views/mis-reservas.js';

const tituloDe = (ruta, paso, encabezado) =>
  (ruta === 'reservar' ? `${encabezado}, paso ${Number(paso) || 1} de 4` : encabezado);

/** Tras cambiar de pantalla, lleva el foco al encabezado nuevo (corrige H-03). */
function enfocarEncabezado(principal) {
  if (principal.contains(document.activeElement) && document.activeElement !== principal) return;
  const encabezado = principal.querySelector('form h2') ?? principal.querySelector('h1');
  encabezado?.setAttribute('tabindex', '-1');
  encabezado?.focus({ preventScroll: true });
}

export function iniciarAplicacion({ reservas, borrador, restablecer }) {
  const principal = document.getElementById('contenido');
  const estado = { errores: null, mensaje: null, enfocarErrores: false };

  const contexto = {
    reservas,
    borrador,
    estado,
    ir(destino) {
      if (location.hash === destino) pintar();
      else location.hash = destino;
    },
    refrescar() {
      // Conserva el foco del control que provocó el repintado (necesario con teclado).
      const foco = document.activeElement?.id;
      const hayErroresNuevos = estado.enfocarErrores;
      pintar();
      if (!hayErroresNuevos && foco) document.getElementById(foco)?.focus();
    },
  };

  function pintar() {
    const [, ruta = 'inicio', parametro] = location.hash.split('/');
    const vistas = {
      inicio: () => vistaInicio(contexto),
      docentes: () => vistaDocentes(contexto),
      reservar: () => vistaAsistente(contexto, Math.min(4, Math.max(1, Number(parametro) || 1))),
      confirmacion: () => vistaConfirmacion(contexto, parametro),
      reservas: () => vistaMisReservas(contexto),
    };
    const nodos = (vistas[ruta] ?? vistas.inicio)();
    principal.replaceChildren(...nodos.filter(Boolean));
    const encabezado = principal.querySelector('h1');
    if (encabezado) document.title = `${tituloDe(ruta, parametro, encabezado.textContent)} · Tutoría UX`;
    if (estado.enfocarErrores) {
      const resumen = principal.querySelector('[data-resumen-errores]');
      if (resumen) {
        resumen.focus();
        estado.enfocarErrores = false;
      }
    }
    document.querySelectorAll('nav a').forEach((a) => {
      if (a.hash.split('/')[1] === ruta) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  document.getElementById('restablecer').addEventListener('click', () => {
    if (!window.confirm('Se borrarán todas las reservas de demostración de este navegador.')) return;
    restablecer();
    estado.errores = null;
    contexto.ir('#/inicio');
  });

  window.addEventListener('hashchange', () => {
    window.scrollTo(0, 0);
    pintar();
    enfocarEncabezado(principal);
  });
  pintar();
}
