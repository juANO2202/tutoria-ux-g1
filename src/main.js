// Raíz de composición: conecta infraestructura -> aplicación -> presentación.
import { crearServicioReservas } from './application/servicio-reservas.js';
import { crearServicioBorrador } from './application/borrador.js';
import { crearAlmacen, memoria } from './infrastructure/almacen.js';
import { crearRepositorioReservas } from './infrastructure/repositorio-reservas.js';
import { catalogo } from './infrastructure/catalogo.js';
import { conFallosSimulados, generador, reloj } from './infrastructure/sistema.js';
import { iniciarAplicacion } from './presentation/app.js';

function almacenamientoDisponible() {
  try {
    localStorage.setItem('tutorias.prueba', '1');
    localStorage.removeItem('tutorias.prueba');
    return localStorage;
  } catch {
    return memoria();
  }
}

const almacen = crearAlmacen(almacenamientoDisponible());
const base = crearRepositorioReservas(almacen);
const fallo = new URLSearchParams(location.search).get('fallo');
const repositorio = conFallosSimulados(base, fallo);
const borrador = crearServicioBorrador(almacen);

iniciarAplicacion({
  reservas: crearServicioReservas({ catalogo, repositorio, reloj, generador }),
  borrador,
  restablecer() {
    base.vaciar();
    borrador.limpiar();
  },
});
