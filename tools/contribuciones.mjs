// Genera la lista de commits por autor a partir del historial real. Uso: npm run contribuciones
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const registro = execFileSync('git',
  ['log', '--no-merges', '--reverse', '--format=%h%x09%an%x09%ad%x09%s', '--date=short'], { encoding: 'utf8' });
const porAutor = new Map();
for (const linea of registro.trim().split('\n')) {
  const [hash, autor, fecha, mensaje] = linea.split('\t');
  porAutor.set(autor, [...(porAutor.get(autor) ?? []), `| \`${hash}\` | ${fecha} | ${mensaje.replaceAll('|', '/')} |`]);
}
const secciones = [...porAutor].map(([autor, filas]) =>
  `## ${autor} (${filas.length})\n\n| Hash | Fecha | Mensaje |\n|---|---|---|\n${filas.join('\n')}\n`);
writeFileSync('COMMITS.md', `# Commits por autor\n\nGenerado desde el historial de Git.\n\n${secciones.join('\n')}`);
console.log(`COMMITS.md generado para ${porAutor.size} autor(es).`);
