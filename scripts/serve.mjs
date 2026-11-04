import http from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = await realpath(process.argv.includes('--dist') ? path.join(projectRoot, 'dist') : projectRoot);
const host = '127.0.0.1';
const port = 4173;
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const isContained = (target) => {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
};

const fail = (response, code, text) => {
  response.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(text);
};

const server = http.createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    return fail(response, 405, 'Metod nije dozvoljen.');
  }

  try {
    // Razdvajanje pre dekodiranja čuva i kodirane pokušaje izlaska iz direktorijuma.
    const pathname = decodeURIComponent((request.url || '/').split('?')[0]);
    if (pathname.includes('\0') || pathname.includes('\\')) {
      return fail(response, 400, 'Neispravna putanja.');
    }
    const parts = pathname.split('/').filter(Boolean);
    if (parts.some((part) => part === '..' || part.startsWith('.'))) {
      return fail(response, 403, 'Pristup nije dozvoljen.');
    }
    const allowedRootFiles = ['index.html', 'styles.css', 'app.js', 'robots.txt', 'favicon.ico'];
    if (parts.length && !['assets', 'data'].includes(parts[0]) && !allowedRootFiles.includes(pathname.slice(1))) {
      return fail(response, 404, 'Stranica nije pronađena.');
    }

    const target = path.resolve(root, pathname === '/' ? 'index.html' : `.${pathname}`);
    if (!isContained(target)) return fail(response, 403, 'Pristup nije dozvoljen.');
    const resolved = await realpath(target);
    if (!isContained(resolved)) return fail(response, 403, 'Pristup nije dozvoljen.');
    const info = await stat(resolved);
    if (!info.isFile()) return fail(response, 404, 'Stranica nije pronađena.');

    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(resolved).toLowerCase()] || 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    if (request.method === 'HEAD') return response.end();
    createReadStream(resolved).on('error', () => response.destroy()).pipe(response);
  } catch (error) {
    if (error instanceof URIError) return fail(response, 400, 'Neispravna putanja.');
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return fail(response, 404, 'Stranica nije pronađena.');
    return fail(response, 500, 'Greška pri čitanju datoteke.');
  }
});

server.on('error', (error) => {
  console.error(`Server nije pokrenut: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, host, () => console.log(`Local: http://${host}:${port}`));
