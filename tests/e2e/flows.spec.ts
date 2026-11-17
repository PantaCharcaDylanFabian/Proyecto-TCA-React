import { test, expect, login } from './fixtures';
import { asUser, call } from '../helpers/database.mjs';
import { randomUUID } from 'node:crypto';

test('acceso protegido, credenciales inválidas, entrada persistente y cierre de sesión',async({page})=>{
  await page.goto('/inventario');await expect(page.getByRole('heading',{name:'Acceso del equipo TCA'})).toBeVisible();
  await page.locator('main').getByLabel('Correo',{exact:true}).fill('warehouse@demo.test');await page.getByLabel('Contraseña').fill('wrong');await page.getByRole('button',{name:'Iniciar sesión',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('inválidos');
  await login(page,'warehouse');await page.locator('.tca-team').getByRole('link',{name:'Inventario',exact:true}).click();
  await page.getByLabel('Código de producto o barras').fill('123456789');await page.getByRole('button',{name:'Reconocer',exact:true}).click();
  await expect(page.getByText('✓ Código reconocido: CUADERNO A4 DEMO')).toBeVisible();
  await page.getByLabel('Cantidad recibida').fill('40');await page.getByLabel('Guía o referencia').fill('GUIA-TEST');await page.getByRole('button',{name:'Confirmar recepción',exact:true}).click();
  await expect(page.getByText('Entrada registrada. El nuevo saldo está guardado.')).toBeVisible();
  await page.reload();await expect(page.getByRole('cell',{name:'60',exact:true})).toBeVisible();
  await page.locator('.tca-team').getByRole('button',{name:'Cerrar sesión',exact:true}).click();await page.goto('/inventario');await expect(page.getByRole('heading',{name:'Acceso del equipo TCA'})).toBeVisible();
});

test('carrito móvil envía solicitud sin reservar; enlace privado conserva el seguimiento',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/catalogo');
  await expect(page.getByRole('heading',{name:'CUADERNO A4 DEMO',exact:true})).toBeVisible();
  await page.screenshot({path:'test-results/catalogo-movil.png',fullPage:true});
  await page.getByRole('button',{name:'Agregar al carrito',exact:true}).click();await page.getByRole('button',{name:/Ver carrito/}).click();
  await page.getByLabel('Nombre o razón social').fill('BODEGA DE PRUEBA');await page.getByLabel('Teléfono',{exact:true}).fill('900123456');await page.getByRole('button',{name:'Enviar solicitud a Ventas',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Solicitud recibida en Ventas'})).toBeVisible();
  await page.getByRole('link',{name:'Ver seguimiento',exact:true}).click();await expect(page.getByRole('heading',{name:'BORRADOR',exact:true})).toBeVisible();
  await page.reload();await expect(page.getByText(/CUADERNO A4 DEMO: 1 solicitados/)).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
});

test('Ventas no entra a inventario y la entrega parcial exige aceptación explícita',async({page})=>{
  await login(page,'sales');await page.goto('/inventario');await expect(page.getByRole('heading',{name:'Acceso restringido'})).toBeVisible();
  await page.goto('/pedidos');await page.getByRole('button',{name:'Nuevo borrador'}).click();
  await page.getByPlaceholder('Ej. Bodega San José E.I.R.L.').fill('CLIENTE PARCIAL');
  await page.getByRole('spinbutton').first().fill('24');await page.getByRole('button',{name:'+ Agregar al Pedido',exact:true}).click();await page.getByRole('button',{name:'Guardar Pedido en Borrador',exact:true}).click();
  await expect(page.getByRole('button',{name:'Entregar lo disponible'})).toBeDisabled();
  await page.getByRole('checkbox',{name:/Acepto explícitamente/}).check();await page.getByRole('button',{name:'Entregar lo disponible'}).click();
  await expect(page.getByText('Pedido confirmado. Las unidades fueron reservadas.')).toBeVisible();await expect(page.getByText('4 pendientes',{exact:true})).toBeVisible();
});

test('Gerencia crea un producto y revisa una propuesta; Almacén recibe la compra',async({page,db})=>{
  await asUser(db,'manager');await call(db,'tca_guardar_producto',[{codigo:'DEMO-LOW',nombre:'LEJÍA DEMO',categoria:'Limpieza',precio:4,stock_actual:5,stock_minimo:10,stock_objetivo:30,activo:true},null,null,randomUUID()]);
  await login(page,'manager');await page.goto('/gestion-productos');await page.getByRole('button',{name:'Crear producto',exact:true}).click();
  await page.getByPlaceholder('Ej. 029085 o PRD-001').fill('DEMO-NEW');await page.getByPlaceholder('Ej. ACEITE DE OLIVA EXTRA VIRGEN 500ML').fill('PRODUCTO NUEVO');await page.getByRole('button',{name:'Registrar Producto',exact:true}).click();await expect(page.getByText('Producto guardado en el inventario central.')).toBeVisible();
  await page.goto('/reposicion');await page.getByRole('checkbox',{name:'Seleccionar LEJÍA DEMO'}).check();await page.getByLabel('Proveedor de la propuesta').fill('Proveedor Demo');await page.getByRole('button',{name:'Crear propuesta revisable'}).click();await expect(page.getByText('Propuesta creada para revisión. No se envió al proveedor.')).toBeVisible();
  await page.getByRole('button',{name:'Aprobar propuesta'}).click();await expect(page.getByText(/Compra aprobada/)).toBeVisible();
  await page.locator('.tca-team').getByRole('button',{name:'Cerrar sesión'}).click();await login(page,'warehouse');await page.goto('/reposicion');
  page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Recibir todas las unidades'}).click();await expect(page.getByText('Recepción registrada y orden cerrada.')).toBeVisible();
  await expect(page.getByRole('heading',{name:/RECIBIDA/})).toBeVisible();
});

test('respuesta perdida no declara éxito; reintentar usa la misma operación y no duplica pedido',async({page,db})=>{
  await page.goto('/catalogo');await page.getByRole('button',{name:'Agregar al carrito',exact:true}).click();await page.getByRole('button',{name:/Ver carrito/}).click();
  await page.getByLabel('Nombre o razón social').fill('CLIENTE REINTENTO');await page.getByLabel('Teléfono',{exact:true}).fill('900765432');
  const endpoint='**/rest/v1/rpc/tca_enviar_pedido';
  const loseResponse=async(route:import('@playwright/test').Route)=>{const args=route.request().postDataJSON();await asUser(db,'anon');await call(db,'tca_enviar_pedido',[args.p_pedido,args.p_operacion]);await route.abort('failed');};
  await page.route(endpoint,loseResponse);await page.getByRole('button',{name:'Enviar solicitud a Ventas'}).click();await expect(page.getByRole('alert')).toBeVisible();await expect(page.getByRole('heading',{name:'Solicitud recibida en Ventas'})).toHaveCount(0);
  await page.unroute(endpoint,loseResponse);await page.getByRole('button',{name:'Enviar solicitud a Ventas'}).click();await expect(page.getByRole('heading',{name:'Solicitud recibida en Ventas'})).toBeVisible();
  await asUser(db,'manager');expect((await call(db,'tca_pedidos')).filter(o=>o.cliente_nombre==='CLIENTE REINTENTO')).toHaveLength(1);
});

test('pedido interno: borrador, reserva, preparación y constancia de despacho',async({page})=>{
  await login(page,'manager');await page.locator('.tca-team').getByRole('link',{name:'Pedidos',exact:true}).click();await page.getByRole('button',{name:'Nuevo borrador',exact:true}).click();
  await page.getByPlaceholder('Ej. Bodega San José E.I.R.L.').fill('CLIENTE DE PRUEBA');await page.getByRole('button',{name:'+ Agregar al Pedido',exact:true}).click();await page.getByRole('button',{name:'Guardar Pedido en Borrador',exact:true}).click();
  await expect(page.getByText('Borrador guardado. No se reservó ni descontó stock.')).toBeVisible();
  await page.getByRole('button',{name:'Confirmar y reservar',exact:true}).click();await expect(page.getByText('Pedido confirmado. Las unidades fueron reservadas.')).toBeVisible();
  await page.getByLabel('Código',{exact:true}).fill('123456789');await page.getByLabel('Cantidad preparada',{exact:true}).fill('10');await page.getByRole('button',{name:'Registrar preparación',exact:true}).click();
  await expect(page.getByText('Preparación guardada.')).toBeVisible();await page.getByRole('button',{name:'Confirmar despacho',exact:true}).click();
  await expect(page.getByRole('button',{name:'Imprimir constancia',exact:true})).toBeVisible();await expect(page.getByText('Despacho registrado una sola vez. Constancia interna disponible.')).toBeVisible();
});

test('contacto persistido y descarga CSV real',async({page})=>{
  await page.goto('/');await page.locator('footer').getByRole('button',{name:'Solicitar contacto',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Solicitar contacto'});
  await dialog.getByLabel('Nombre o razón social').fill('PERSONA DEMO');await dialog.getByLabel('Correo',{exact:true}).fill('demo@example.test');await dialog.getByLabel('Teléfono').fill('900123456');await dialog.getByRole('button',{name:'Enviar solicitud',exact:true}).click();
  await expect(dialog.getByText(/Solicitud registrada/)).toBeVisible();await dialog.getByRole('button',{name:'Cerrar contacto'}).click();
  await page.getByRole('button',{name:/CATÁLOGO|DESCARGAR/i}).first().click();
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Descargar CSV',exact:true}).click();const download=await downloadPromise;expect(download.suggestedFilename()).toBe('catalogo-tca.csv');
});

test('borrador interno conserva su operación al reintentar una respuesta perdida',async({page,db})=>{
  await login(page,'sales');await page.goto('/pedidos');await page.getByRole('button',{name:'Nuevo borrador'}).click();
  await page.getByPlaceholder('Ej. Bodega San José E.I.R.L.').fill('CLIENTE BORRADOR REINTENTO');await page.getByRole('button',{name:'+ Agregar al Pedido',exact:true}).click();
  const endpoint='**/rest/v1/rpc/tca_guardar_borrador';
  const loseResponse=async(route:import('@playwright/test').Route)=>{const args=route.request().postDataJSON();await asUser(db,'sales');await call(db,'tca_guardar_borrador',[args.p_pedido,args.p_id,args.p_version,args.p_operacion]);await route.abort('failed');};
  await page.route(endpoint,loseResponse);await page.getByRole('button',{name:'Guardar Pedido en Borrador',exact:true}).click();await expect(page.getByRole('dialog',{name:'Crear borrador'})).toBeVisible();await expect(page.getByRole('button',{name:'Guardar Pedido en Borrador'})).toBeEnabled();
  await page.unroute(endpoint,loseResponse);await page.getByRole('button',{name:'Guardar Pedido en Borrador',exact:true}).click();await expect(page.getByText('Borrador guardado. No se reservó ni descontó stock.')).toBeVisible();
  await asUser(db,'manager');expect((await call(db,'tca_pedidos')).filter(o=>o.cliente_nombre==='CLIENTE BORRADOR REINTENTO')).toHaveLength(1);
});
