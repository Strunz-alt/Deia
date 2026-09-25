/**
 * Gestión de administradores desde la consola del servidor.
 *
 * Es el mecanismo seguro para crear la PRIMERA cuenta administradora: sólo
 * puede usarlo quien tiene acceso al servidor y a la base de datos. Después,
 * un administrador puede otorgar el rol a otros desde el panel (/admin/usuarios).
 *
 *   npm run admin -- --email correo@ejemplo.com --nombre "Nombre Apellido"
 *       Crea la cuenta como administradora (pide la contraseña) o, si ya
 *       existe, le otorga el rol de administrador.
 *   npm run admin -- --email correo@ejemplo.com --password
 *       Cambia la contraseña de una cuenta existente.
 *   npm run admin -- --email correo@ejemplo.com --quitar
 *       Quita el rol de administrador (siempre queda al menos uno).
 *   npm run admin -- --listar
 *       Lista las cuentas administradoras.
 *
 * Para uso no interactivo, la contraseña puede pasarse en ADMIN_PASSWORD.
 */
import { parseArgs } from 'node:util';
import readline from 'node:readline';
import { and, eq, ne, sql } from 'drizzle-orm';
import { client, db, ensureDb } from '../src/db/client.ts';
import { sesiones, usuarios } from '../src/db/schema.ts';
import { hashPassword, PASSWORD_MAX, PASSWORD_MIN } from '../src/lib/password.ts';

const { values: args } = parseArgs({
  options: {
    email: { type: 'string' },
    nombre: { type: 'string' },
    password: { type: 'boolean', default: false },
    quitar: { type: 'boolean', default: false },
    listar: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

const fail = (msg: string): never => {
  console.error(`✖ ${msg}`);
  client.close();
  process.exit(1);
};

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const rlAny = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
    let muted = false;
    rlAny._writeToOutput = (s: string) => {
      if (!muted || s.includes(question)) rlAny.output.write(s);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
    muted = true;
  });
}

async function readPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  if (!process.stdin.isTTY) fail('Definí la contraseña en la variable ADMIN_PASSWORD o ejecutá el comando en una terminal.');
  const p1 = await askHidden('Contraseña: ');
  const p2 = await askHidden('Repetí la contraseña: ');
  if (p1 !== p2) fail('Las contraseñas no coinciden.');
  return p1;
}

function validPassword(p: string) {
  if (p.length < PASSWORD_MIN) fail(`La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`);
  if (p.length > PASSWORD_MAX) fail(`La contraseña puede tener hasta ${PASSWORD_MAX} caracteres.`);
  return p;
}

if (args.help || (!args.email && !args.listar)) {
  console.log(`Uso:
  npm run admin -- --email correo@ejemplo.com --nombre "Nombre Apellido"   Crear o ascender a administrador
  npm run admin -- --email correo@ejemplo.com --password                   Cambiar contraseña
  npm run admin -- --email correo@ejemplo.com --quitar                     Quitar rol de administrador
  npm run admin -- --listar                                                 Listar administradores`);
  process.exit(args.help ? 0 : 1);
}

await ensureDb();

if (args.listar) {
  const admins = await db.select().from(usuarios).where(eq(usuarios.rol, 'admin'));
  if (!admins.length) console.log('No hay administradores todavía.');
  admins.forEach((a) => console.log(`• ${a.nombre} <${a.email}>`));
  client.close();
  process.exit(0);
}

const email = args.email!.trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('El correo no es válido.');
const [user] = await db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1);

if (args.quitar) {
  if (!user) fail('No existe una cuenta con ese correo.');
  if (user.rol !== 'admin') fail('Esa cuenta no es administradora.');
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)` })
    .from(usuarios)
    .where(and(eq(usuarios.rol, 'admin'), ne(usuarios.id, user.id)));
  if (Number(n) === 0) fail('Es el único administrador: primero otorgá el rol a otra cuenta.');
  await db.update(usuarios).set({ rol: 'estudiante' }).where(eq(usuarios.id, user.id));
  console.log(`✔ ${user.nombre} ya no es administrador/a.`);
} else if (args.password) {
  if (!user) fail('No existe una cuenta con ese correo.');
  const password = validPassword(await readPassword());
  await db.update(usuarios).set({ passwordHash: await hashPassword(password) }).where(eq(usuarios.id, user.id));
  await db.delete(sesiones).where(eq(sesiones.usuarioId, user.id));
  console.log(`✔ Contraseña actualizada para ${user.email}. Se cerraron sus sesiones abiertas.`);
} else if (user) {
  if (user.rol === 'admin') {
    console.log(`ℹ ${user.email} ya es administrador/a.`);
  } else {
    await db.update(usuarios).set({ rol: 'admin' }).where(eq(usuarios.id, user.id));
    console.log(`✔ ${user.nombre} <${user.email}> ahora es administrador/a.`);
  }
} else {
  const nombre = (args.nombre ?? '').trim();
  if (nombre.length < 2) fail('Para crear la cuenta indicá también --nombre "Nombre Apellido".');
  const password = validPassword(await readPassword());
  await db.insert(usuarios).values({ email, nombre, passwordHash: await hashPassword(password), rol: 'admin' });
  console.log(`✔ Cuenta administradora creada para ${nombre} <${email}>. Ya podés ingresar en /ingresar.`);
}

client.close();
