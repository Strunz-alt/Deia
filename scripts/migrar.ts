/**
 * Aplica las migraciones pendientes de la base de datos.
 * (El servidor también las aplica solo al iniciar; este comando sirve para
 * prepararla antes, por ejemplo en un despliegue.)
 *
 *   npm run db:migrate
 */
import { client, ensureDb } from '../src/db/client.ts';

await ensureDb();
const { rows } = await client.execute("select count(*) as n from sqlite_master where type = 'table'");
console.log(`✔ Base de datos lista (${rows[0].n} tablas).`);
client.close();
