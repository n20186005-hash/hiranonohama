import type { APIRoute } from 'astro';
import { DEFAULT_SITE_URL } from '@/config/site';

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL(DEFAULT_SITE_URL)).toString().replace(/\/$/, '');
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
