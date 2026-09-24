// @ts-check
import { defineConfig } from 'astro/config';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // Reemplazar por el dominio definitivo cuando se publique el sitio.
  site: 'https://example.com',
  trailingSlash: 'ignore',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
});
