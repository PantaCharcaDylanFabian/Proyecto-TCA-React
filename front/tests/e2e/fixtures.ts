import { test as base, expect } from '@playwright/test';
import { createDatabase, asUser, call, users } from '../helpers/database.mjs';
import type { PGlite } from '@electric-sql/pglite';
import { randomUUID } from 'node:crypto';

export const test = base.extend<{ db: PGlite }>({
  db: async ({ browserName }, provide) => {
    void browserName;
    const db = await createDatabase(); await asUser(db,'manager');
    await call(db,'tca_guardar_producto',[{codigo:'DEMO-A4',nombre:'CUADERNO A4 DEMO',categoria:'Cuadernos',macro_categoria:'Útiles de Oficina',precio:5,stock_actual:20,stock_minimo:10,stock_objetivo:60,codigo_barras:'123456789',activo:true},null,null,randomUUID()]);
    await provide(db); await db.close();
  },
  page: async ({ page, db }, provide) => {
    let queue = Promise.resolve();
    await page.route('**/auth/v1/**', async route => {
      const url=route.request().url();
      if(url.includes('/logout')) return route.fulfill({status:204});
      const body=route.request().postDataJSON();
      const email=body?.email||''; const who=email.split('@')[0];
      if(body?.password!=='Test-password-123' || !users[who]) return route.fulfill({status:400,json:{error:'invalid_grant',error_description:'Invalid login credentials'}});
      const user={id:users[who],email,aud:'authenticated',role:'authenticated',user_metadata:{},app_metadata:{provider:'email'},created_at:new Date().toISOString()};
      const jwt=`${Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')}.${Buffer.from(JSON.stringify({sub:user.id,role:'authenticated',aud:'authenticated',exp:Math.floor(Date.now()/1000)+3600,iat:Math.floor(Date.now()/1000)})).toString('base64url')}.test-signature`;
      return route.fulfill({json:{access_token:jwt,token_type:'bearer',expires_in:3600,refresh_token:'test-refresh-token',user}});
    });
    await page.route('**/rest/v1/rpc/**', async route => {
      const request=route.request(); const name=new URL(request.url()).pathname.split('/').pop()!;
      const args=request.postDataJSON()||{};
      let who='anon';
      try { const sub=JSON.parse(Buffer.from((request.headers().authorization||'').split('.')[1],'base64url').toString()).sub;who=Object.entries(users).find(([,id])=>id===sub)?.[0]||'anon'; } catch { /* public request */ }
      const work=queue.then(async()=>{
        await asUser(db,who);
        if(!/^tca_[a-z_]+$/.test(name)||Object.keys(args).some(k=>!/^p_[a-z_]+$/.test(k)))throw new Error('Invalid test RPC');
        const placeholders=Object.keys(args).map((k,i)=>`${k}=>$${i+1}`).join(',');
        const values=Object.values(args).map(v=>v&&typeof v==='object'?JSON.stringify(v):v);
        return (await db.query(`select public.${name}(${placeholders}) as result`,values)).rows[0].result;
      });
      queue=work.then(()=>{},()=>{});
      try { await route.fulfill({json:await work}); }
      catch(e) { await route.fulfill({status:400,json:{message:(e as Error).message,code:'P0001'}}); }
    });
    await provide(page);
  },
});
export { expect };
export async function login(page: import('@playwright/test').Page, role: string) {
  await page.goto('/login');
  await expect(page.getByRole('heading',{name:'Acceso del equipo TCA'})).toBeVisible();
  await page.locator('main').getByLabel('Correo', { exact: true }).fill(`${role}@demo.test`);
  await page.getByLabel('Contraseña', { exact: true }).fill('Test-password-123');
  await page.getByRole('button',{name:'Iniciar sesión',exact:true}).click();
  await expect(page.getByRole('heading',{name:/Bienvenido/})).toBeVisible();
}
