import { cpSync, existsSync, mkdirSync } from 'node:fs';

if (!existsSync('static')) process.exit(0);

mkdirSync('public', { recursive: true });
cpSync('static', 'public', { recursive: true });
