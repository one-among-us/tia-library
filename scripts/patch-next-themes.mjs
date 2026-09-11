// next-themes renders a <script> from a Client Component. React 19 never
// executes those on the client and logs a warning; keep the script on SSR only.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const pattern =
  /return t\.createElement\("script",(\{[\s\S]*?__html:`\(\$\{[A-Za-z]\.toString\(\)\}\)\(\$\{p\}\)`\}\}\))/g;

function patchFile(file) {
  if (!existsSync(file)) return;
  const source = readFileSync(file, 'utf8');
  if (!pattern.test(source)) return;
  pattern.lastIndex = 0;
  writeFileSync(
    file,
    source.replace(
      pattern,
      'return typeof window=="undefined"?t.createElement("script",$1:null',
    ),
  );
}

let main;
try {
  main = require.resolve('next-themes');
} catch {
  process.exit(0);
}

patchFile(main);
patchFile(main.replace(/index\.js$/, 'index.mjs'));
