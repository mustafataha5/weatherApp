import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,       // only used locally
    strictPort: false,
  },
  build: {
    outDir: 'build',  // ensures output goes to /client/build
  },
})
