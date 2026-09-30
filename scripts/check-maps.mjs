import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, logLevel: 'error' });
try {
  const { MAPS } = await server.ssrLoadModule('/src/maps/index.ts');
  const { SCRIPTS, TRAINERS } = await server.ssrLoadModule('/src/story/index.ts');
  const { validateMaps } = await server.ssrLoadModule('/src/world/validate.ts');
  const errors = validateMaps(MAPS, SCRIPTS, TRAINERS);
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else console.log(`OK: ${Object.keys(MAPS).length} maps, 8 integrity checks`);
} finally { await server.close(); }
