// Dev-only static server for game/ (Node 22, standard library only).
// `node serve.ts` serves game/ on http://localhost:8080 — not part of the entry.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const port = Number(process.argv[2] || '8080');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
};

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = resolve(join(root, normalize(pathname)));
  if (file !== root && !file.startsWith(root + sep)) { response.writeHead(403).end('forbidden'); return; }
  try {
    const size = statSync(file).size;
    response.writeHead(200, { 'content-type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream', 'content-length': size });
    createReadStream(file).pipe(response);
  } catch { response.writeHead(404).end('not found'); }
}).listen(port, '127.0.0.1', () => console.log(`game/ is on http://localhost:${port}`));
