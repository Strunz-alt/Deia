# Centro de Estudiantes de Derecho · UCA — Sitio web

Primera versión navegable del sitio público del Centro de Estudiantes de la Facultad de Derecho (UCA).
Es un esqueleto funcional con **contenido de ejemplo**, pensado para evaluar la organización y la estética antes de cargar la información definitiva.

## Cómo ejecutarlo

Requisitos: Node.js 22.12 o superior.

```bash
npm install
npm run dev        # servidor de desarrollo en http://localhost:4321
npm run build      # verificación de tipos (astro check) + sitio estático en dist/
npm run preview    # sirve la versión compilada
```

## Tecnología

[Astro](https://astro.build): genera un sitio estático con rutas reales, componentes reutilizables y casi nada de JavaScript en el navegador. Solo se usan scripts livianos, sin frameworks, para el menú, los filtros, las animaciones y los avisos. Las fuentes están autoalojadas con Fontsource. Se puede publicar en cualquier hosting estático (Netlify, Vercel, GitHub Pages) y más adelante conectarse a un CMS.

## Estructura

```
src/
  data/         ← TODO el contenido (reemplazar aquí)
    types.ts    ← modelos de datos (contrato para un futuro CMS)
    site.ts     ← nombre, menú, contacto, redes, enlaces útiles
    charlas.ts · noticias.ts · apuntes.ts · deportes.ts (incluye INTERUCA)
    accionSocial.ts · institucional.ts · miembros.ts · logros.ts
  components/   ← componentes reutilizables (tarjetas, encabezados, botones, estados vacíos…)
  layouts/      ← BaseLayout (head, header, footer, scripts globales)
  pages/        ← una ruta por archivo
  scripts/      ← filtros, animaciones de aparición, avisos de acciones pendientes
  styles/       ← global.css: tokens de diseño (colores, tipografías, espaciados)
  lib/format.ts ← formato de fechas y utilidades
public/         ← favicon y, en el futuro, imágenes y PDF
```

## Rutas

| Ruta | Contenido |
|---|---|
| `/` | Inicio: presentación, accesos a las áreas, buscador de apuntes, agenda, noticias y logros |
| `/charlas`, `/charlas/[slug]` | Listado filtrable y detalle (expositores, descripción, inscripción) |
| `/accion-social` | Ejes, iniciativas filtrables, organizaciones y cómo participar |
| `/deportes` | Disciplinas, entrenamientos, agenda e inscripción |
| `/deportes/interuca` | Historial INTERUCA por año y disciplina, con filtros |
| `/apuntes` | Biblioteca: buscador, filtros por año/materia/cátedra/tipo, orden y vista lista/cuadrícula |
| `/relaciones-institucionales` | Vínculos, convenios, visitas y actividades conjuntas |
| `/noticias`, `/noticias/[slug]` | Listado por categoría y detalle reutilizable |
| `/miembros` | Equipo por área (fotos y nombres pendientes) |
| `/logros` | Iniciativas por gestión, con indicadores |

## Contenido provisional

- Todo lo marcado con la etiqueta **«Ejemplo»** es provisional y proviene de `src/data/*.ts` (propiedad `ejemplo: true`).
- **No hay nombres de personas, instituciones, convenios ni resultados reales.** Los miembros y expositores tienen `nombre: null`, que se muestra como «A confirmar». Los resultados de INTERUCA y las cifras de logros (`00`) son ilustrativos.
- Los enlaces, archivos y formularios pendientes se definen con `href: null`. En ese caso el botón se muestra como pendiente y avisa que la acción todavía no está disponible, sin simular envíos ni descargas.
- **Imágenes:** guardarlas en `public/` y referenciarlas con `{ src: '/carpeta/archivo.jpg', alt: '…' }` en el campo `imagen`, `foto` o `logo`.
- **Apuntes:** subir los PDF a `public/apuntes/` (o a un almacenamiento externo) y completar `archivo: '/apuntes/archivo.pdf'`.

## Identidad visual (provisional)

Las publicaciones del Centro no estaban disponibles al construir esta versión, así que la identidad es **provisional**:

- Azul noche, marfil y dorado envejecido.
- *Cormorant Garamond* para los titulares, *Inter* para el texto y *Bebas Neue* para la sección deportiva.
- Un logo-sello genérico en `src/components/Logo.astro`.

Para adaptarla, basta con editar los tokens de `:root` en `src/styles/global.css`, los imports de fuentes en `src/layouts/BaseLayout.astro` y reemplazar el logo.

## Accesibilidad y movimiento

- Enlace para saltar al contenido.
- Navegación completa por teclado: los desplegables se cierran con Esc y el menú móvil mantiene el foco dentro mientras está abierto.
- Foco visible en todos los elementos interactivos.
- Estados `aria-pressed` y `aria-current` en filtros y navegación.
- Contraste AA en el texto.
- Con `prefers-reduced-motion` se desactivan las animaciones.

## Próximos pasos sugeridos

1. Incorporar la identidad visual oficial y el logo.
2. Reemplazar los datos de ejemplo por el contenido real.
3. Conectar formularios reales para inscripciones, voluntariado y envío de material.
4. Migrar `src/data` a *content collections* de Astro o a un CMS headless (por ejemplo Decap, Sanity o Strapi) respetando los tipos de `types.ts`.
5. Definir el dominio en `astro.config.mjs` y quitar el `noindex` de `BaseLayout.astro` al publicar.
