/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Usuario con sesión iniciada, o `null` para visitantes. */
    user: import('./lib/auth').SessionUser | null;
    /** Mensaje de resultado de la acción anterior (éxito o error). */
    flash: import('./lib/flash').Flash | null;
  }
}
