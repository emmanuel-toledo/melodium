import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const examplePath = join(rootDir, '.env.example');
const localPath = join(rootDir, '.env.local');

if (!existsSync(examplePath)) {
  console.error('Missing .env.example; cannot create .env.local.');
  process.exit(1);
}

if (existsSync(localPath)) {
  process.stdout.write('.env.local already exists; leaving it untouched.\n');
} else {
  copyFileSync(examplePath, localPath);
  process.stdout.write('Created .env.local from .env.example.\n');
}
