import { defineConfig } from 'vitest/config';
import { devtools } from '@tanstack/devtools-vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// نستخدم (as any) لتجاوز تضارب تعريفات النوع بين Vitest و Vite
export default defineConfig({
  plugins: [
    // هذه الأدوات لن تسبب لكِ خطأ الـ Build الخاص بالمجلدات
    devtools(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    viteReact(),
  ],
  test: {
    environment: 'jsdom', // بيئة الاختبار للمكونات
  },
} as any);