import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'dist-ssr', 'node_modules', 'test-results', 'playwright-report'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    // The engine, rules and assumptions must stay pure: no UI framework, no DOM, no app code.
    files: ['engine/**/*.ts', 'rules/**/*.ts', 'assumptions/**/*.ts'],
    languageOptions: { globals: { ...globals.es2022 } },
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['preact', 'preact/*', '@preact/*'], message: 'The engine must not depend on a UI framework.' },
          { group: ['**/src/**', '../src/*', '../../src/*'], message: 'The engine must not import app code.' },
        ],
      }],
      'no-restricted-globals': ['error', 'window', 'document', 'localStorage', 'navigator', 'fetch'],
    },
  },
);
