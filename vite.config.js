import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Absolute base so assets resolve from nested routes like /mortgage
  base: '/',
  test: {
    environment: 'node',
  },
});
