// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // Reemplazar por el dominio definitivo cuando se publique el sitio.
  site: 'https://example.com',
  // El contenido se administra desde el panel, por eso las páginas se generan en el servidor.
  output: 'server',
  adapter: node({
    mode: 'standalone',
    // Límite de tamaño de cada solicitud (los archivos individuales tienen límites propios).
    bodySizeLimit: 40 * 1024 * 1024,
  }),
  // Rechaza envíos de formularios desde otros sitios (protección CSRF).
  security: { checkOrigin: true },
  trailingSlash: 'ignore',
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  vite: {
    ssr: { external: ['@libsql/client', 'libsql'] },
  },
});
