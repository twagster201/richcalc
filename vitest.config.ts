import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/engine/**/*.test.ts', 'tests/unit/**/*.test.ts', 'tests/docs/**/*.test.ts'],
    environment: 'node',
  },
});
