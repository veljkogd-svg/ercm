import { cp, mkdir, readFile, realpath, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(projectRoot, 'dist');
const entries = ['index.html', 'styles.css', 'app.js', 'data', 'assets', '_headers'];
const manifestPath = path.join(projectRoot, '.build-files.json');
const generatedFiles = new Set();
let previousFiles = [];
try {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (Array.isArray(manifest)) previousFiles = manifest;
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

// Proverite sve ulaze pre početka kopiranja. Build nikada ne briše direktorijume.
for (const entry of entries) {
  const source = path.join(projectRoot, entry);
  await stat(source);
  const resolved = await realpath(source);
  const relative = path.relative(projectRoot, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Ulaz mora biti unutar projekta: ${entry}`);
  }
}

await mkdir(outputRoot, { recursive: true });
const resolvedOutput = await realpath(outputRoot);
if (resolvedOutput !== outputRoot) {
  throw new Error('Izlazni direktorijum dist ne sme biti simbolički link.');
}

for (const entry of entries) {
  await cp(path.join(projectRoot, entry), path.join(outputRoot, entry), {
    recursive: true,
    force: true,
    dereference: false,
    filter: async (source) => {
      const resolved = await realpath(source);
      const relative = path.relative(projectRoot, resolved);
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error('Datoteke u build-u moraju ostati unutar projekta.');
      }
      if ((await stat(source)).isFile()) {
        generatedFiles.add(path.relative(projectRoot, source).split(path.sep).join('/'));
      }
      return true;
    },
  });
}

// Uklonite samo ranije generisane datoteke koje više ne postoje u izvoru.
// Nepoznate korisničke datoteke i svi direktorijumi ostaju netaknuti.
for (const relative of previousFiles) {
  if (typeof relative !== 'string' || generatedFiles.has(relative)) continue;
  const parts = relative.split('/');
  if (parts.includes('..') || relative.includes('\\') || !entries.includes(parts[0])) continue;
  const target = path.resolve(outputRoot, relative);
  const insideOutput = path.relative(outputRoot, target);
  if (insideOutput.startsWith('..') || path.isAbsolute(insideOutput)) continue;
  try {
    const resolved = await realpath(target);
    const resolvedRelative = path.relative(outputRoot, resolved);
    if (resolvedRelative.startsWith('..') || path.isAbsolute(resolvedRelative)) {
      throw new Error('Zastareli build fajl mora biti unutar dist direktorijuma.');
    }
    if ((await stat(target)).isFile()) await unlink(target);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
await writeFile(manifestPath, `${JSON.stringify([...generatedFiles].sort(), null, 2)}\n`);

console.log(`Statički sajt je spreman: ${outputRoot}`);
