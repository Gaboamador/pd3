// Solo para ejecutar los tests con Node sin Vite ni dependencias adicionales.
import { readFile } from 'node:fs/promises';
export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('?raw')) {
    const resolved = await nextResolve(specifier.slice(0, -4), context);
    return { url: `${resolved.url}?raw`, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
export async function load(url, context, nextLoad) {
  if (url.endsWith('?raw')) {
    const text = await readFile(new URL(url.slice(0, -4)), 'utf8');
    return { format: 'module', source: `export default ${JSON.stringify(text)}`, shortCircuit: true };
  }
  if (url.endsWith('.json')) {
    const json = await readFile(new URL(url), 'utf8');
    return { format: 'module', source: `export default ${json.trim()};`, shortCircuit: true };
  }
  return nextLoad(url, context);
}
