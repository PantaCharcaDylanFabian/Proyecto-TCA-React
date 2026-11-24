import { test, expect, login } from './fixtures';
import { asUser, call } from '../../../bd/tests/helpers/database.mjs';
import { antigravityService, PIURA_EDGES, PIURA_NODES } from '../../../back/services/antigravityService.js';

test('Almacén compara dos escenarios de abastecimiento con la API de previsiones', async ({ page }) => {
  await login(page, 'warehouse');
  await page.getByRole('link', { name: 'Revisar reposición' }).click();
  await page.getByRole('link', { name: 'Previsión de abastecimiento' }).click();
  await page.getByLabel('Producto a evaluar').selectOption('DEMO-A4');
  const weekly = page.getByLabel('Unidades vendidas por semana');
  await weekly.fill('35');
  await page.getByLabel('Pedidos con este producto por semana').fill('7');
  await page.getByLabel('Plazo del proveedor (días)').fill('5');
  const calculate = page.getByRole('button', { name: 'Calcular previsión' });
  await page.route('**/api/ai/stockout-risk', route => route.abort());
  await calculate.click();
  await expect(page.getByRole('alert')).toContainText('No se pudo conectar');
  await page.unroute('**/api/ai/stockout-risk');
  await calculate.click();
  const result = page.getByRole('region', { name: 'Resultado de la previsión' });
  await expect(result.getByRole('heading')).toHaveText('Previsión para CUADERNO A4 DEMO');
  const first = await result.locator('dd').first().innerText();
  await weekly.fill('60');
  await expect(result).toHaveCount(0);
  await calculate.click();
  await expect(result.locator('dd').first()).not.toHaveText(first);
  await page.getByText('¿Qué precisión tienen las estimaciones?').click();
  await expect(page.getByText(/productos y demanda simulada/)).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('button', { name: 'Crear propuesta revisable' })).toHaveCount(0);
});

test('portada de la tienda permite explorar categorías, fotos y buscar productos', async ({ page }) => {
  await page.goto('/');
  const hero = page.getByRole('region', { name: 'Abastece tu negocio' });
  const categories = page.getByRole('region', { name: 'Compra por categoría' });
  await expect(categories.getByRole('link')).toHaveCount(6);
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.getByRole('searchbox', { name: 'Buscar productos' })).toBeInViewport();
    await expect(hero.getByRole('link', { name: 'Explorar productos' })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (width !== 320) await page.screenshot({ path: `test-results/portada-${width}.png` });
  }
  await hero.getByRole('button', { name: 'Foto siguiente' }).click();
  await expect(hero.getByRole('img')).toHaveAttribute('src', '/imagenes/Bodega.jpg');
  await hero.getByRole('button', { name: 'Foto anterior' }).click();
  await expect(hero.getByRole('img')).toHaveAttribute('src', '/imagenes/bodega2.jpeg');
  await categories.getByRole('link', { name: 'Alimentos' }).click();
  await expect(page.getByRole('combobox', { name: 'Categoría' })).toHaveValue('Alimentos');
  await page.getByRole('searchbox', { name: 'Buscar productos' }).fill('CUADERNO');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'CUADERNO A4 DEMO' })).toBeVisible();
});

test('Marcas permite buscar y abrir solo los productos de la marca elegida', async ({ page, db }) => {
  await asUser(db, 'manager');
  for (const [codigo, marca] of [['MAR-1', 'CAFÉ'], ['MAR-2', 'Café Norte']]) {
    await call(db, 'tca_guardar_producto', [{ codigo, marca, nombre: codigo, categoria: 'Café', precio: 8,
      stock_actual: 10, stock_minimo: 2, stock_objetivo: 15, activo: true }, null, null, randomUUID()]);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/marcas');
  await page.getByRole('searchbox', { name: 'Buscar marca' }).fill('cafe');
  await expect(page.getByRole('link', { name: 'Café Norte 1 producto' })).toBeVisible();
  await page.getByRole('link', { name: 'CAFÉ 1 producto', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Productos de CAFÉ' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'MAR-1' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'MAR-2' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'MAR-1' })).toBeVisible();
});

test('Almacén planifica un reparto y puede reintentar si falla el cálculo', async ({ page }) => {
  const apiRoute = '**/api/ai/optimal-route';
  await page.route('**/api/ai/routes', route => route.fulfill({ json: { nodos: PIURA_NODES, conexiones: PIURA_EDGES } }));
  await page.route(apiRoute, route => route.abort());
  await login(page, 'warehouse');
  await page.getByRole('link', { name: 'Planificar reparto' }).click();
  const routeMap = page.getByRole('region', { name: 'Mapa interactivo de reparto en Piura' });
  await expect(routeMap).toBeVisible();
  await expect(routeMap.locator('.tca-delivery-point')).toHaveCount(Object.keys(PIURA_NODES).length);
  await expect(routeMap.locator('.tca-network-edge')).toHaveCount(Object.values(PIURA_EDGES).flat().length / 2);
  await page.getByLabel('Origen').selectOption('ALMACEN_CENTRAL_CASTILLA');
  await page.getByLabel('Destino').selectOption('BELLAVISTA_SULLANA');
  const calculate = page.getByRole('button', { name: 'Calcular ruta' });
  await calculate.click();
  await expect(page.getByRole('alert')).toContainText('No se pudo conectar');

  await page.unroute(apiRoute);
  await page.route(apiRoute, route => {
    const payload = route.request().postDataJSON();
    expect(payload).toMatchObject({ origen: 'ALMACEN_CENTRAL_CASTILLA', destino: 'BELLAVISTA_SULLANA', algoritmo: 'ASTAR' });
    return route.fulfill({ json: antigravityService.toolOptimizarRuta(payload) });
  });
  await calculate.click();
  const result = page.getByRole('region', { name: 'Recorrido sugerido' });
  await expect(result.getByText(/43[.,]7 km/)).toBeVisible();
  await expect(result.getByRole('listitem').last()).toHaveText('Bellavista (Sullana)');
  await expect(routeMap.locator('.tca-calculated-route')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.getByLabel('Destino').selectOption('CATACAOS');
  await expect(routeMap.locator('.tca-calculated-route')).toHaveCount(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
});
import { randomUUID } from 'node:crypto';

test('acceso protegido, credenciales inválidas, entrada persistente y cierre de sesión',async({page})=>{
  await page.goto('/inventario');await expect(page.getByRole('heading',{name:'Acceso del equipo TCA'})).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeInViewport();
  await page.getByRole('button', { name: 'Mostrar', exact: true }).click();
  await expect(page.getByLabel('Contraseña', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ocultar', exact: true }).click();
  await expect(page.getByLabel('Contraseña', { exact: true })).toHaveAttribute('type', 'password');
  await page.setViewportSize({ width: 1280, height: 800 });
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
  await page.getByRole('button', { name: 'Abrir menú de categorías' }).click();
  const drawer = page.getByRole('dialog');
  await drawer.getByRole('button', { name: 'ALIMENTOS' }).click();
  await drawer.getByRole('button', { name: 'Abarrotes' }).click();
  await expect(drawer.getByRole('link', { name: 'Aceites clásicos' })).toBeVisible();
  await drawer.getByRole('button', { name: /Volver a ALIMENTOS/ }).click();
  await expect(drawer.getByRole('button', { name: 'Abarrotes' })).toBeVisible();
  await drawer.getByRole('button', { name: 'Cerrar menú' }).click();
  await page.getByRole('searchbox', { name: 'Buscar por nombre o código' }).fill('sin coincidencias');
  await expect(page.getByText('No hay productos que coincidan con los filtros.')).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 800 });
  const categoryBox = await page.getByRole('combobox', { name: 'Categoría', exact: true }).boundingBox();
  const clearBox = await page.getByRole('button', { name: 'Limpiar filtros' }).boundingBox();
  expect(Math.abs(categoryBox!.y + categoryBox!.height - clearBox!.y - clearBox!.height)).toBeLessThan(2);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(page.getByRole('heading', { name: 'CUADERNO A4 DEMO', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.screenshot({path:'test-results/catalogo-movil.png',fullPage:true});
  await page.getByRole('button',{name:'Agregar al carrito',exact:true}).click();await page.getByRole('button',{name:/Ver carrito/}).click();
  const quantity = page.getByRole('spinbutton', { name: 'Cantidad de CUADERNO A4 DEMO' });
  await quantity.fill('2');
  await expect(page.getByText('Total referencial')).toBeVisible();
  await expect(quantity).toHaveValue('2');
  await quantity.fill('1');
  await expect(page.getByLabel('Dirección de entrega')).toHaveCount(0);
  await page.getByLabel('Forma de entrega').selectOption('DELIVERY');
  await expect(page.getByLabel('Dirección de entrega')).toBeVisible();
  await page.getByLabel('Forma de entrega').selectOption('RECOJO');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.getByLabel('Nombre o razón social').fill('BODEGA DE PRUEBA');await page.getByLabel('Teléfono',{exact:true}).fill('900123456');await page.getByRole('button',{name:'Enviar solicitud a Ventas',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Solicitud recibida en Ventas'})).toBeVisible();
  await page.reload();
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: 'Copiar enlace de seguimiento' }).click();
  await expect(page.getByText('Enlace copiado.')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await page.getByRole('link', { name: 'Ver seguimiento' }).evaluate(link => (link as HTMLAnchorElement).href));
  await page.getByRole('link',{name:'Ver seguimiento',exact:true}).click();await expect(page.getByRole('heading',{name:'BORRADOR',exact:true})).toBeVisible();
  await page.reload();
  const trackedProducts = page.getByRole('region', { name: 'Productos de la solicitud' });
  await expect(trackedProducts.getByRole('heading', { name: 'CUADERNO A4 DEMO' })).toBeVisible();
  await expect(trackedProducts.getByText('1 unidad solicitada')).toBeVisible();
  await expect(trackedProducts.getByText('Total referencial')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
});

test('Ventas no entra a inventario y la entrega parcial exige aceptación explícita',async({page})=>{
  await login(page,'sales');await page.goto('/inventario');await expect(page.getByRole('heading',{name:'Acceso restringido'})).toBeVisible();
  await expect(page.getByRole('link', { name: 'Rutas de reparto' })).toHaveCount(0);
  await page.goto('/reposicion?vista=prevision');
  await expect(page.getByRole('heading', { name: 'Acceso restringido' })).toBeVisible();
  await expect(page.getByLabel('Producto a evaluar')).toHaveCount(0);
  await page.goto('/pedidos');await page.getByRole('button',{name:'Nuevo borrador'}).click();
  await page.getByPlaceholder('Ej. Bodega San José E.I.R.L.').fill('CLIENTE PARCIAL');
  const unitsToAdd = page.getByRole('spinbutton', { name: 'Unidades a agregar' });
  const unitsInOrder = page.getByRole('spinbutton', { name: /Cantidad en el pedido de/ });
  const addToOrder = page.getByRole('button', { name: '+ Agregar al Pedido', exact: true });
  await unitsToAdd.fill('23');
  await addToOrder.click();
  await expect(unitsToAdd).toHaveValue('1');
  await expect(unitsInOrder).toHaveValue('23');
  await addToOrder.click();
  await expect(unitsInOrder).toHaveValue('24');
  await expect(page.getByText('Ya en el pedido: 24 unidades')).toBeVisible();
  await page.getByRole('button',{name:'Guardar Pedido en Borrador',exact:true}).click();
  await expect(page.getByRole('button',{name:'Entregar lo disponible'})).toBeDisabled();
  await page.getByRole('button', { name: 'Volver al listado' }).click();
  const detailButton = page.getByRole('button', { name: 'Ver detalle' });
  await expect(detailButton).toBeFocused();
  await detailButton.click();
  await expect(page.getByRole('heading', { name: 'Detalle de pedido' })).toBeFocused();
  await page.getByRole('checkbox',{name:/Acepto explícitamente/}).check();await page.getByRole('button',{name:'Entregar lo disponible'}).click();
  await expect(page.getByText('Pedido confirmado. Las unidades fueron reservadas.')).toBeVisible();await expect(page.getByText('4 pendientes',{exact:true})).toBeVisible();
});

test('Gerencia crea un producto y revisa una propuesta; Almacén recibe la compra',async({page,db})=>{
  await asUser(db,'manager');await call(db,'tca_guardar_producto',[{codigo:'DEMO-LOW',nombre:'LEJÍA DEMO',categoria:'Limpieza',precio:4,stock_actual:5,stock_minimo:10,stock_objetivo:30,activo:true},null,null,randomUUID()]);
  await login(page,'manager');
  await page.setViewportSize({ width: 1182, height: 800 });
  const inventory = page.getByRole('region', { name: 'Inventario', exact: true });
  await expect(inventory.getByText('LEJÍA DEMO')).toBeVisible();
  const ordersCard = await page.getByRole('region', { name: 'Pedidos', exact: true }).boundingBox();
  const adminCard = await page.getByRole('region', { name: 'Administración', exact: true }).boundingBox();
  expect(adminCard!.x).toBe(ordersCard!.x);
  expect(adminCard!.y - ordersCard!.y - ordersCard!.height).toBeCloseTo(16, 0);
  await page.goto('/gestion-productos');
  await page.setViewportSize({ width: 390, height: 600 });
  await page.getByRole('button', { name: 'Validar e importar JSON' }).click();
  const importDialog = page.getByRole('dialog', { name: 'Importar catálogo JSON' });
  await expect(importDialog).toBeInViewport({ ratio: 1 });
  await expect(importDialog.getByRole('heading', { name: 'Importar catálogo JSON' })).toBeInViewport();
  await importDialog.getByRole('button', { name: 'Cerrar modal' }).click();
  await page.getByRole('searchbox', { name: 'Buscar producto' }).fill('sin coincidencias');
  await expect(page.getByText('Ningún producto coincide con los filtros.')).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(page.getByRole('cell', { name: /CUADERNO A4 DEMO/ })).toBeVisible();
  await page.getByRole('button',{name:'Crear producto',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeInViewport({ ratio: 1 });
  await expect(page.getByRole('dialog').getByRole('heading')).toBeInViewport();
  await page.getByLabel('Código único').fill('DEMO-NEW');await page.getByPlaceholder('Ej. ACEITE DE OLIVA EXTRA VIRGEN 500ML').fill('PRODUCTO NUEVO');await page.getByRole('button',{name:'Registrar Producto',exact:true}).click();await expect(page.getByText('Producto guardado en el inventario central. Código: DEMO-NEW.')).toBeVisible();
  await page.getByRole('button', { name: 'Crear producto', exact: true }).click();
  const codeField = page.getByLabel('Código único');
  await expect(codeField).toHaveValue('');
  const suggested = await codeField.getAttribute('placeholder');
  expect(suggested).toMatch(/^TCA-[A-F0-9]{16}$/);
  await page.getByPlaceholder('Ej. ACEITE DE OLIVA EXTRA VIRGEN 500ML').fill('PRODUCTO AUTOMÁTICO');
  await page.getByRole('button', { name: 'Registrar Producto', exact: true }).click();
  await expect(page.getByText(`Producto guardado en el inventario central. Código: ${suggested}.`)).toBeVisible();
  await page.reload();
  await expect(page.getByRole('row').filter({ hasText: 'PRODUCTO AUTOMÁTICO' })).toContainText(suggested!);
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
  await page.setViewportSize({ width: 390, height: 600 });
  await expect(page.getByRole('dialog', { name: 'Crear borrador' })).toBeInViewport({ ratio: 1 });
  await page.getByPlaceholder('Ej. Bodega San José E.I.R.L.').fill('CLIENTE BORRADOR REINTENTO');await page.getByRole('button',{name:'+ Agregar al Pedido',exact:true}).click();
  const endpoint='**/rest/v1/rpc/tca_guardar_borrador';
  const loseResponse=async(route:import('@playwright/test').Route)=>{const args=route.request().postDataJSON();await asUser(db,'sales');await call(db,'tca_guardar_borrador',[args.p_pedido,args.p_id,args.p_version,args.p_operacion]);await route.abort('failed');};
  await page.route(endpoint,loseResponse);await page.getByRole('button',{name:'Guardar Pedido en Borrador',exact:true}).click();await expect(page.getByRole('dialog',{name:'Crear borrador'})).toBeVisible();await expect(page.getByRole('button',{name:'Guardar Pedido en Borrador'})).toBeEnabled();
  await page.unroute(endpoint,loseResponse);await page.getByRole('button',{name:'Guardar Pedido en Borrador',exact:true}).click();await expect(page.getByText('Borrador guardado. No se reservó ni descontó stock.')).toBeVisible();
  await asUser(db,'manager');expect((await call(db,'tca_pedidos')).filter(o=>o.cliente_nombre==='CLIENTE BORRADOR REINTENTO')).toHaveLength(1);
});
