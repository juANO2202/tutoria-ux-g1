import { h } from '../components/dom.js';

export function vistaDocentes({ reservas, borrador, ir }) {
  const filtro = { asignaturaId: '', texto: '' };
  const lista = h('ul', { class: 'lista' });
  const conteo = h('p', { role: 'status', class: 'conteo' });

  function reservarCon(docente) {
    if (borrador.leer().editandoId) borrador.limpiar();
    const previa = borrador.leer().asignaturaId;
    const asignaturaId = filtro.asignaturaId
      || (docente.asignaturas.includes(previa) ? previa : '')
      || (docente.asignaturas.length === 1 ? docente.asignaturas[0] : '');
    borrador.actualizar({ asignaturaId, docenteId: docente.id });
    ir('#/reservar/1');
  }

  function pintar() {
    const encontrados = reservas.consultarDocentes(filtro);
    conteo.textContent = encontrados.length
      ? `${encontrados.length} ${encontrados.length === 1 ? 'docente encontrado' : 'docentes encontrados'}`
      : 'No hay docentes que coincidan. Cambie la búsqueda o elija otra asignatura.';
    lista.replaceChildren(...encontrados.map((d) => h('li', { class: 'tarjeta' },
      h('h2', {}, d.nombre),
      h('p', {}, h('strong', {}, 'Asignaturas: '), d.materias.map((m) => m.nombre).join(', ')),
      h('p', {}, `${d.oficina} · ${d.sala}`),
      h('button', {
        type: 'button', class: 'boton', 'aria-label': `Reservar con ${d.nombre}`,
        onClick: () => reservarCon(d),
      }, 'Reservar con este docente'))));
  }

  pintar();
  return [
    h('h1', {}, 'Docentes y asignaturas'),
    h('form', { class: 'filtros', role: 'search', onSubmit: (e) => e.preventDefault() },
      h('div', { class: 'campo' },
        h('label', { for: 'buscar' }, 'Buscar por docente o asignatura'),
        h('input', {
          id: 'buscar', type: 'search', autocomplete: 'off',
          onInput: (e) => { filtro.texto = e.target.value; pintar(); },
        })),
      h('div', { class: 'campo' },
        h('label', { for: 'filtro-asignatura' }, 'Asignatura'),
        h('select', {
          id: 'filtro-asignatura',
          onChange: (e) => { filtro.asignaturaId = e.target.value; pintar(); },
        },
        h('option', { value: '' }, 'Todas'),
        reservas.listarAsignaturas().map((a) => h('option', { value: a.id }, a.nombre))))),
    conteo,
    lista,
  ];
}
