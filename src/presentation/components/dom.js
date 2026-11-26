// Creación segura de elementos: el texto del usuario nunca se interpreta como HTML.

export function h(etiqueta, atributos = {}, ...hijos) {
  const el = document.createElement(etiqueta);
  for (const [nombre, valor] of Object.entries(atributos)) {
    if (valor === false || valor === null || valor === undefined) continue;
    if (nombre.startsWith('on')) el.addEventListener(nombre.slice(2).toLowerCase(), valor);
    else if (valor === true) el.setAttribute(nombre, '');
    else el.setAttribute(nombre, valor);
  }
  el.append(...hijos.flat().filter((x) => x !== null && x !== undefined && x !== false));
  return el;
}
