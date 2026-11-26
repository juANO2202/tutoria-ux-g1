// Servidor estático sin dependencias. Uso: npm start  (PORT opcional).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json',
  '.md': 'text/plain; charset=utf-8', '.csv': 'text/csv; charset=utf-8',
};

export function crearServidor(raiz = RAIZ) {
  return createServer(async (peticion, respuesta) => {
    try {
      let ruta = decodeURIComponent(new URL(peticion.url, 'http://localhost').pathname);
      if (ruta === '/') {
        const consulta = new URL(peticion.url, 'http://localhost').search;
        respuesta.writeHead(302, { Location: `/src/presentation/${consulta}` }).end();
        return;
      }
      if (ruta.endsWith('/')) ruta += 'index.html';
      const archivo = normalize(join(raiz, ruta));
      const publico = ['src', 'ux', 'evaluacion', 'evidencias']
        .some((carpeta) => archivo.startsWith(join(raiz, carpeta) + sep));
      if (!publico) throw new Error('fuera de las carpetas publicadas');
      const cuerpo = await readFile(archivo);
      respuesta.writeHead(200, {
        'Content-Type': TIPOS[extname(archivo)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      }).end(cuerpo);
    } catch {
      respuesta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No encontrado');
    }
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const puerto = Number(process.env.PORT) || 5173;
  crearServidor().listen(puerto, '127.0.0.1', () => {
    console.log(`Tutoría UX en http://localhost:${puerto}/`);
  });
}
