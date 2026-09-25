// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

/*
 * Dominio público del sitio. Detrás del proxy HTTPS de un hosting, Astro sólo
 * confía en los encabezados X-Forwarded-* de los dominios listados acá; sin
 * esto, los formularios se rechazarían (verificación de origen) y todas las
 * visitas compartirían la IP del proxy.
 *
 * - SITE_URL: dirección pública completa, p. ej. https://ceduca.up.railway.app
 * - RAILWAY_PUBLIC_DOMAIN: la define Railway automáticamente.
 * - ALLOWED_HOSTS: dominios adicionales separados por coma (p. ej. un dominio propio).
 * Se leen al compilar (npm run build).
 */
const siteUrl =
  process.env.SITE_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : undefined);

const publicHosts = [
  siteUrl && new URL(siteUrl).hostname,
  process.env.RAILWAY_PUBLIC_DOMAIN,
  ...(process.env.ALLOWED_HOSTS ?? '').split(','),
]
  .map((h) => h?.trim())
  .filter((h, i, all) => h && all.indexOf(h) === i);

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: siteUrl ?? 'https://example.com',
  // El contenido se administra desde el panel, por eso las páginas se generan en el servidor.
  output: 'server',
  adapter: node({
    mode: 'standalone',
    // Límite de tamaño de cada solicitud (los archivos individuales tienen límites propios).
    bodySizeLimit: 40 * 1024 * 1024,
  }),
  security: {
    // Rechaza envíos de formularios desde otros sitios (protección CSRF).
    checkOrigin: true,
    allowedDomains: publicHosts.map((hostname) => ({ hostname: /** @type {string} */ (hostname) })),
  },
  trailingSlash: 'ignore',
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  vite: {
    ssr: { external: ['@libsql/client', 'libsql'] },
  },
});
