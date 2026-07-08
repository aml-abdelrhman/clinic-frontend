import { defineConfig } from 'vitest/config'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  plugins: [
    devtools(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackRouter({ 
      target: 'react', 
      autoCodeSplitting: true,
      // أضيفي هذا السطر ليوقف البحث عن المجلد المفقود
      routesDirectory: '', 
      generatedRouteTree: '', 
    }) as any, 
    viteReact(),
  ],
  test: {
    environment: 'jsdom',
  },
})

export default config