import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'MermaidDrakon',
      formats: ['es']
    },
    rollupOptions: {
      external: ['mermaid'],
      output: {
        globals: {
          mermaid: 'mermaid'
        }
      }
    }
  }
})