# Centro de Estudiantes de Derecho · UCA — Sitio web y panel

Sitio público del Centro de Estudiantes de la Facultad de Derecho (UCA) con **cuentas de usuario**, **biblioteca de resúmenes protegida** y **panel de administración** para gestionar el contenido sin tocar código.

## Puesta en marcha

Requisitos: **Node.js 22.18 o superior**.

```bash
npm install
cp .env.example .env            # opcional: los valores por defecto sirven para desarrollo
npm run admin -- --email tu@correo.com --nombre "Tu Nombre"   # crea la primera cuenta administradora (pide contraseña)
npm run db:demo                 # opcional: carga contenido de ejemplo para recorrer el sitio
npm run dev                     # http://localhost:4321
```

- Panel de administración: **http://localhost:4321/admin** (ingresá con la cuenta creada arriba).
- La base de datos (`data/ced.db`) y los archivos subidos (`data/uploads/`) se crean solos. Las migraciones se aplican al iniciar.
- Para quitar el contenido de ejemplo: `npm run db:demo -- --quitar` (sólo borra lo marcado como «Ejemplo ·»).

### Producción

```bash
npm run build      # verificación de tipos + compilación
npm start          # servidor Node en HOST:PORT (por defecto 0.0.0.0:4321)
```

El servidor necesita **disco persistente** para `data/` (base y archivos). Sirve en cualquier VPS o plataforma con volúmenes (Railway, Render, Fly.io…). Detrás de un proxy con HTTPS, la cookie de sesión se marca `Secure` automáticamente (`X-Forwarded-Proto`). Hacé copias de seguridad periódicas de la carpeta `data/`.

Variables (ver `.env.example`): `DATABASE_URL`, `DATABASE_AUTH_TOKEN` (para Turso/libSQL remoto), `UPLOADS_DIR`, `HOST`, `PORT`.

## Usuarios y permisos

| Rol | Puede |
|---|---|
| Visitante | Navegar todas las secciones institucionales. Ve la lista de materias de la biblioteca, pero no los materiales. |
| Estudiante | Todo lo anterior + ver y descargar resúmenes y apuntes. No puede modificar contenido. |
| Administrador | Todo lo anterior + panel `/admin` para crear, editar y eliminar contenido y gestionar usuarios. |

- El **registro público** (`/registro`) crea siempre cuentas de estudiante: el rol no se lee del formulario.
- La **primera cuenta administradora** se crea desde la consola del servidor con `npm run admin` (sólo lo puede hacer quien tiene acceso al servidor). Luego, un administrador puede otorgar o quitar el rol desde **Panel → Usuarios y permisos**. Nadie puede cambiar su propio rol, y siempre queda al menos un administrador.
- Otros comandos: `npm run admin -- --listar`, `--email x --password` (cambiar contraseña), `--email x --quitar` (quitar rol).
- Los permisos se validan **en el servidor**: el middleware protege `/admin` y cada página o endpoint administrativo vuelve a verificar el rol; los archivos de estudio se entregan sólo con sesión iniciada (`/apuntes/archivo/<id>`).
- El **cargo** de la sección Miembros (presidencia, secretaría…) es independiente de los permisos del sitio.

Seguridad implementada: contraseñas con scrypt, sesiones con token aleatorio (en la base sólo se guarda su hash) en cookie `httpOnly` + `SameSite=Lax`, límite de intentos de ingreso y de registros, verificación de origen en formularios (CSRF), validación de tipo real (firma del archivo) y tamaño de cada subida, nombres de archivo aleatorios y cabeceras de seguridad.

## Panel de administración

| Sección | Qué permite |
|---|---|
| Materias y cátedras | Crear/editar/eliminar materias (con imagen y año) y sus cátedras. Al eliminar una materia o cátedra con contenido, pide elegir entre **mover** los materiales o **eliminarlos** con sus archivos: no quedan registros ni archivos huérfanos. |
| Materiales | Subir PDF, Word o PowerPoint (hasta 25 MB), asociarlos a materia y cátedra, reemplazar el archivo, eliminar. Búsqueda y filtros por materia y cátedra. |
| Miembros | Nombre, foto, cargo, área y descripción; orden manual. |
| Logros | Título, descripción, fecha, área, varias imágenes, destacados y orden manual. |
| Noticias | Borradores, publicar/despublicar, portada, resumen, contenido y fecha. Vista previa de borradores. |
| Charlas | Título, formato, temática, descripción, oradores, fecha, horario, lugar, modalidad, imagen y enlace de inscripción opcional. Se clasifican solas en próximas y realizadas. |
| INTERUCA | Año, disciplina, rama, equipo/participantes, resultado, detalle, descripción, fotos y destacado. El historial público resalta los campeonatos. |
| Usuarios y permisos | Buscar usuarios, otorgar/quitar el rol de administrador y generar contraseñas temporales. |

Formularios con validación en el servidor, mensajes de error por campo, estados de carga, vista previa de imágenes antes de guardar y confirmación antes de eliminar. Imágenes: JPG, PNG o WebP de hasta 5 MB.

## Tecnología y estructura

[Astro](https://astro.build) con renderizado en el servidor (adaptador `@astrojs/node`), base SQLite/libSQL con [Drizzle ORM](https://orm.drizzle.team) y archivos en disco. Sin frameworks de interfaz: componentes `.astro` y scripts livianos.

```
src/
  db/            esquema (schema.ts) y conexión (client.ts)
  lib/           autenticación, permisos, almacenamiento, validación
  lib/services/  lógica de cada sección (guardar, eliminar, listar)
  middleware.ts  sesión, protección de /admin y cabeceras de seguridad
  pages/         sitio público, /ingresar, /registro, /admin/**
  components/    componentes del sitio, formularios (forms/) y panel (admin/)
  layouts/       BaseLayout (sitio) y AdminLayout (panel)
  styles/        global.css (tokens de identidad) y admin.css
  data/          contenido que todavía no se administra desde el panel
drizzle/         migraciones SQL
scripts/         admin.ts, migrar.ts, cargar-demo.ts
public/brand/    logo del Centro
```

Para cambiar el esquema: editar `src/db/schema.ts` y ejecutar `npm run db:generate`.

## Identidad visual

Basada en las publicaciones del Centro: rojo del escudo `#AB1717`, bordó profundo, papel claro y el azul de las piezas «Olimpiadas INTERUCA»; titulares en mayúsculas condensadas (Bebas Neue y Oswald) y texto en Montserrat. Los tokens están en `:root` de `src/styles/global.css`. El logo está en `public/brand/`.

## Pendiente o a confirmar

- **Acción Social, Deportes (disciplinas y agenda) y Relaciones Institucionales** siguen con contenido de ejemplo en `src/data/*.ts`; no forman parte del panel en esta etapa.
- **Contacto y redes** (`src/data/site.ts`): la ubicación «CEDUCA · 2.º piso del edificio Moro» se tomó de las publicaciones; correo, horario y enlaces a redes están pendientes.
- **Recuperación de contraseña por correo**: requiere un servicio de envío de e-mails (no configurado). Mientras tanto, un administrador genera una contraseña temporal desde el panel.
- **Almacenamiento en la nube**: los archivos se guardan en disco. Para un hosting sin disco persistente habría que agregar un almacenamiento compatible con S3 (la lógica está centralizada en `src/lib/storage.ts`).
- El límite de intentos de ingreso vive en memoria: si se escala a varias instancias, conviene moverlo a un almacenamiento compartido.
- Antes de publicar: definir el dominio en `astro.config.mjs` y quitar el `noindex` de `src/layouts/BaseLayout.astro`.
