import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The base path is passed by the GitHub Actions workflow (--base=/<repo>/),
// so the same code works both locally and on GitHub Pages.
export default defineConfig({
  plugins: [react()],
})
