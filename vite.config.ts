import { defineConfig } from 'vitest/config'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// نستخدم (as any) هنا لنتجاوز تعارض أنواع الـ Plugins بين Vite و Vitest
export default defineConfig(({ command }) => {
  const isBuild = command === 'build';

  return {
    plugins: [
      devtools(),
      tsconfigPaths({ projects: ['./tsconfig.json'] }),
      tailwindcss(),
      // إذا كان build، نمرر false للـ plugin ليتم تجاهله
      !isBuild ? tanstackRouter({ target: 'react' }) : false,
      viteReact(),
    ],
    test: {
      environment: 'jsdom',
    },
  } as any // هذا الجزء هو السحر الذي سيحل كل أخطاء Typescript
})