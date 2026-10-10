import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { assumptionsMarkdown, sourcesMarkdown } from '../../scripts/docs';

const root = resolve(import.meta.dirname, '../..');

describe('generated docs', () => {
  it('SOURCES.md is up to date (run `npm run docs`)', () => {
    expect(readFileSync(resolve(root, 'SOURCES.md'), 'utf8')).toBe(sourcesMarkdown());
  });
  it('ASSUMPTIONS.md is up to date (run `npm run docs`)', () => {
    expect(readFileSync(resolve(root, 'ASSUMPTIONS.md'), 'utf8')).toBe(assumptionsMarkdown());
  });
});
