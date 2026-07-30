import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { DEFAULT_SITE_URL } from './src/config/site';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? DEFAULT_SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
});
