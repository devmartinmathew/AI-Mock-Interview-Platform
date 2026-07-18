import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Raise the warning threshold to avoid noise about Firebase + Gemini bundle size
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        // Split vendor chunks for better caching in production
        codeSplitting: true,
      },
    },
  },
  server: {
    port: 5173,
    open: true,  // Auto-open browser when running `npm run dev`
  },
});
