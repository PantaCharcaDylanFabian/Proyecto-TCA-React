# Distribuidora TCA — inventarios y pedidos

Aplicación React + TypeScript + Vite + Tailwind con Supabase Auth y operaciones transaccionales en PostgreSQL. Implementa el catálogo comercial, acceso interno por roles, productos, entradas, borradores, reservas, entrega parcial, preparación/despacho, reposición y seguimiento.

## Ejecutar

Requiere Node.js 24 y npm.

```powershell
npm ci
# Si .env no existe, créalo a partir de .env.example. Si existe, edítalo.
npm run dev
```

Configura URL y clave pública de Supabase en `.env`. Reinicia Vite después de editarlas. Sin configuración hay una vista pública de ejemplo; el panel y los envíos requieren Supabase habilitado. Una conexión fallida muestra un error y nunca se presenta como un guardado correcto.

**Activación necesaria:** aplica las migraciones y crea los perfiles siguiendo [Activación de Supabase](docs/ACTIVACION_SUPABASE.md). La clave del `.env` original devolvió `Invalid API key` en la verificación; no se modificó ni se desplegó la base remota.

## Comprobaciones

```powershell
npm run check
npm run lint
npm test
npm run build
npm run test:e2e
```

`npm test` ejecuta validadores de producción, controles del catálogo y las migraciones/funciones reales con PostgreSQL embebido (PGlite). No requiere internet ni credenciales. El aislamiento de procesos de Node se desactiva para funcionar en entornos Windows restringidos.

Las pruebas E2E usan Edge instalado en Windows, Chromium en otros sistemas y un servidor Vite aislado en el puerto 4175. Fuera de Windows, instala antes el navegador de Playwright con `npx playwright install chromium`. Auth se simula en el arnés; las RPC usan el PostgreSQL local. Los datos del `.env` del equipo no se emplean en esas pruebas ni se escriben datos remotos.

`npm run preview` sirve la compilación local. El hosting de producción debe redirigir las rutas de la SPA a `index.html`; no expongas `.env` ni los archivos de configuración privada.

## Rutas principales

| Ruta | Acceso |
|---|---|
| `/catalogo`, `/carrito`, `/seguimiento` | Público; seguimiento requiere su enlace privado. |
| `/login` | Cuenta Supabase del equipo. |
| `/panel` | Gerencia, Ventas y Almacén. |
| `/gestion-productos`, `/equipo` | Gerencia. |
| `/inventario`, `/reposicion` | Gerencia y Almacén; solo Gerencia aprueba compras. |
| `/pedidos` | Operaciones disponibles según rol; Almacén prepara y despacha. |
| `/contactos` | Gerencia y Ventas. |

## Decisiones de persistencia

- El inventario central es la fuente de verdad; el catálogo expone únicamente campos comerciales.
- No se guardan tablas privadas como sustituto silencioso de la base remota. El navegador conserva solo la sesión de Auth y los códigos/cantidades del carrito.
- Si este navegador conserva datos locales de la versión anterior, Gerencia puede descargarlos desde el panel para conciliarlos. No se borran ni se importan automáticamente.
- Las RPC de escritura comprueban rol y ejecutan cabecera/ítems, reservas, entradas y despacho dentro de una transacción.
- Las claves de operación permiten reintentar una petición cuya respuesta se perdió, sin duplicar sus efectos. El formulario conserva la clave mientras siga montado; no reutilices una clave para otro contenido.
- La versión del registro impide sobrescribir cambios de otra sesión al editar productos o borradores.
- El catálogo se reconsulta al recuperar foco, cada 30 segundos con la página visible y después de operaciones del inventario. La confirmación vuelve a comprobar existencias en la base.
- La baja de productos es lógica, para preservar su historial. Un producto con reservas no puede desactivarse.

## Semilla

```powershell
npm run seed
```

Regenera `src/data/catalogo-depurado.json`, `supabase/seed.sql` y el informe de recursos; no aplica SQL remoto. Los 160 productos tienen datos de ejemplo identificados y trazabilidad al recurso de origen. La semilla SQL se aplica **después de 003** y agrega faltantes sin restablecer datos de productos existentes. Las imágenes de sustitución son referenciales; valida las presentaciones y categorías con el negocio.

## Documentación de entrega

- [Estado de implementación y límites de validación](docs/ESTADO_IMPLEMENTACION_APF2.md).
- [Configuración, migraciones, cuentas y guion de demostración](docs/ACTIVACION_SUPABASE.md).
- [Plantilla de pruebas con usuarios, sin resultados prefijados](docs/PRUEBAS_USUARIOS.md).
- [Auditoría inicial del código](REVISION_CUMPLIMIENTO_APF2.md).

WhatsApp abre mensajes preparados para envío manual. Contactos y suscripciones se registran para atención del equipo, sin correo automático. La constancia de despacho es interna, no fiscal. Pagos, SUNAT y automatización física quedan fuera del alcance indicado en el PDF.
