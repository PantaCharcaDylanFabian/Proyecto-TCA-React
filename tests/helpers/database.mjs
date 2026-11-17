import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
export const users = { manager: '10000000-0000-4000-8000-000000000001', sales: '10000000-0000-4000-8000-000000000002', warehouse: '10000000-0000-4000-8000-000000000003', outsider: '10000000-0000-4000-8000-000000000004' };
export async function createDatabase() {
  const db = new PGlite();
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated;
    ALTER DEFAULT PRIVILEGES GRANT ALL ON TABLES TO anon,authenticated;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY, email text);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    GRANT USAGE ON SCHEMA auth TO anon,authenticated;
    GRANT EXECUTE ON FUNCTION auth.uid() TO anon,authenticated;
    INSERT INTO auth.users VALUES ('${users.manager}','manager@demo.test'),('${users.sales}','sales@demo.test'),('${users.warehouse}','warehouse@demo.test'),('${users.outsider}','outsider@demo.test');`);
  for (const file of ['001_hu11_productos.sql','002_hu12_pedidos_borrador.sql','003_operacion_integral.sql']) {
    try { await db.exec(await readFile(`supabase/migrations/${file}`,'utf8')); }
    catch (error) { throw new Error(`Migration ${file}: ${error.message}`, { cause: error }); }
  }
  await db.exec(`INSERT INTO public.perfiles(id,nombre,rol) VALUES('${users.manager}','Gerencia Demo','GERENCIA'),('${users.sales}','Ventas Demo','VENTAS'),('${users.warehouse}','Almacén Demo','ALMACEN');`);
  return db;
}
export async function asUser(db, name) {
  await db.exec('RESET ROLE');
  await db.query(`SELECT set_config('request.jwt.claim.sub',$1,false)`,[users[name]||'']);
  await db.exec(name === 'anon' ? 'SET ROLE anon' : 'SET ROLE authenticated');
}
export async function call(db, name, args = []) {
  const params = args.map((_,i) => `$${i+1}`).join(',');
  const result = await db.query(`SELECT public.${name}(${params}) AS value`,args.map(x => x && typeof x === 'object' ? JSON.stringify(x) : x));
  return result.rows[0].value;
}
