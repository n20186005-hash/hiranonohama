import type { APIRoute } from 'astro';
import { DEFAULT_SITE_URL } from '@/config/site';

const paths = [
  '/',
  '/access/',
  '/photo/',
  '/diamond-fuji/',
  '/food/',
  '/nearby/',
  '/faq/',
  '/photo-card/',
  '/about/',
  '/privacy/',
];

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL(DEFAULT_SITE_URL)).toString().replace(/\/$/, '');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
    .map((path) => `  <url><loc>${base}${path}</loc></url>`)
    .join('\n')}\n</urlset>`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
