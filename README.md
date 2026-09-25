# Centro de Estudiantes de Derecho · UCA — Sitio web y panel

Sitio público del Centro de Estudiantes de la Facultad de Derecho (UCA) con **cuentas de usuario**, **biblioteca de resúmenes protegida** y **panel de administración** para gestionar el contenido sin tocar código.

## Ejecutarlo en tu computadora

1. Instalá **Node.js 22.18 o superior** desde [nodejs.org](https://nodejs.org) (la versión «LTS» sirve).
2. Descargá el proyecto: `git clone https://github.com/Strunz-alt/Deia.git` (o *Code → Download ZIP* en GitHub) y abrí una terminal en esa carpeta.
3. Ejecutá:

```bash
npm install
npm run admin -- --email tu@correo.com --nombre "Tu Nombre"   # crea tu cuenta administradora (pide contraseña)
npm run db:demo                                              # opcional: contenido de ejemplo
npm run dev
```

4. Abrí **http://localhost:4321** en el navegador. El panel está en **http://localhost:4321/admin**. Para detener el servidor: `Ctrl + C`.

La base de datos (`data/ced.db`) y los archivos subidos (`data/uploads/`) se crean solos. Para quitar el contenido de ejemplo: `npm run db:demo -- --quitar` (sólo borra lo marcado como «Ejemplo ·»).

## Publicarlo en Railway

El proyecto ya incluye `railway.json` (compilación, arranque y control de salud) y `.nvmrc` (versión de Node).

1. Uní el PR a `main` en GitHub (o elegí la rama del PR en el paso 2).
2. En [railway.com](https://railway.com) ingresá con GitHub → **New Project → Deploy from GitHub repo** → elegí `Strunz-alt/Deia` (autorizá el acceso al repositorio si lo pide).
3. En el servicio creado:
   - **Settings → Networking → Generate Domain**: te da una dirección pública del tipo `algo.up.railway.app`.
   - **Volume**: agregá un volumen al servicio con *mount path* `/data` (ahí se guardan la base y los archivos).
   - **Variables**:

     | Variable | Valor |
     |---|---|
     | `HOST` | `0.0.0.0` |
     | `DATABASE_URL` | `file:/data/ced.db` |
     | `UPLOADS_DIR` | `/data/uploads` |
     | `ADMIN_EMAIL` | el correo de la primera cuenta administradora |
     | `ADMIN_PASSWORD` | su contraseña (8 caracteres o más) |
     | `ADMIN_NOMBRE` | su nombre (opcional) |

4. **Deploy** (o **Redeploy** si ya se había publicado antes de generar el dominio: el dominio se lee al compilar).
5. Abrí la dirección pública, entrá a `/ingresar` con `ADMIN_EMAIL` y `ADMIN_PASSWORD`, y después **borrá la variable `ADMIN_PASSWORD`**. Desde el panel podés dar permisos a otros administradores.

Cada push a la rama elegida vuelve a publicar el sitio automáticamente. Railway es un servicio pago (plan básico de pocos dólares por mes: verificá el precio actual). Hacé copias de seguridad del volumen `/data` (base y archivos).

**Dominio propio (más adelante):** agregalo en *Settings → Networking → Custom Domain*, configurá el DNS que indica Railway, definí `SITE_URL=https://tudominio` y volvé a publicar.

> Detrás del HTTPS de un hosting, Astro sólo confía en el dominio público configurado (`SITE_URL`, `RAILWAY_PUBLIC_DOMAIN` o `ALLOWED_HOSTS`). Sin eso, los formularios se rechazarían con error 403.

### Otro servidor

```bash
npm install
npm run build      # verificación de tipos + compilación (con SITE_URL definida)
npm start          # servidor Node en HOST:PORT
```

Necesita disco persistente para `data/` y un proxy HTTPS delante. Variables en `.env.example`.

## Usuarios y permisos

| Rol | Puede |
|---|---|
| Visitante | Navegar todas las secciones institucionales. Ve la lista de materias de la biblioteca, pero no los materiales. |
| Estudiante | Todo lo anterior + ver y descargar resúmenes y apuntes. No puede modificar contenido. |
| Administrador | Todo lo anterior + panel `/admin` para crear, editar y eliminar contenido y gestionar usuarios. |

- El **registro público** (`/registro`) crea siempre cuentas de estudiante: el rol no se lee del formulario.
- La **primera cuenta administradora** se crea desde la consola del servidor con `npm run admin`, o en hostings sin consola con las variables `ADMIN_EMAIL`/`ADMIN_PASSWORD` (sólo se aplican mientras no exista ningún administrador). En ambos casos sólo puede hacerlo quien controla el servidor. Luego, un administrador puede otorgar o quitar el rol desde **Panel → Usuarios y permisos**. Nadie puede cambiar su propio rol, y siempre queda al menos un administrador.
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
- El sitio tiene `noindex` (no aparece en buscadores) mientras se revisa el contenido: quitarlo de `src/layouts/BaseLayout.astro` cuando esté listo.
