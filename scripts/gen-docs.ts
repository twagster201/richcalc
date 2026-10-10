import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { assumptionsMarkdown, sourcesMarkdown } from './docs';

const root = resolve(import.meta.dirname, '..');
writeFileSync(resolve(root, 'SOURCES.md'), sourcesMarkdown());
writeFileSync(resolve(root, 'ASSUMPTIONS.md'), assumptionsMarkdown());
console.log('Wrote SOURCES.md and ASSUMPTIONS.md');
