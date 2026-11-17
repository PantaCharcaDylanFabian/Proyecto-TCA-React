# Activación del proyecto TCA

La aplicación y las migraciones están implementadas. La activación en el proyecto Supabase del equipo es un paso separado: la clave pública del `.env` existente respondió `Invalid API key` durante la comprobación del 17 de noviembre de 2026. No se modificaron datos remotos ni se aplicaron migraciones a ese proyecto.

## 1. Preparar las variables públicas

En Supabase, abre la configuración del proyecto y copia la URL del proyecto y su clave **publishable** o **anon**. Edita `.env` utilizando `.env.example` como referencia:

```dotenv
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
VITE_WHATSAPP_NUMBER=
```

La URL no necesita `/rest/v1`. Para WhatsApp puede indicarse un número comercial autorizado con código de país, por ejemplo `51` seguido del celular. Si se deja vacío, WhatsApp permite elegir el destinatario. La aplicación prepara el mensaje; el usuario lo envía manualmente.

No pongas `service_role`, `sb_secret_`, contraseñas de base de datos ni contraseñas de usuarios en variables `VITE_`. La configuración de Vite rechaza claves privilegiadas reconocibles antes de construir el frontend. `.env` está ignorado por Git; no lo adjuntes a evidencias públicas.

Reinicia Vite después de cambiar `.env`.

## 2. Aplicar el esquema

Utiliza un proyecto de prueba y conserva una copia de los datos existentes antes de migrar. Abre **SQL Editor** como administrador del proyecto.

En una base nueva, ejecuta en este orden:

1. `supabase/migrations/001_hu11_productos.sql`.
2. `supabase/migrations/002_hu12_pedidos_borrador.sql`.
3. `supabase/migrations/003_operacion_integral.sql`.
4. Opcional para la demostración: `supabase/seed.sql`.

Si 001 y 002 ya están aplicadas, comienza revisando `supabase/preflight.sql` y aplica únicamente 003. La migración 003 se ejecuta una vez y utiliza una transacción: un fallo revierte su ejecución. No borra productos, pedidos ni líneas históricas.

La migración comprueba unicidad e integridad. Si el esquema previo tiene tipos distintos, códigos repetidos o valores inválidos, revisa el error y reconcilia los datos con el equipo antes de reintentar. No borres registros para forzar el resultado. Las referencias de productos históricos incompatibles se conservan mediante una clave foránea `NOT VALID`; las nuevas escrituras sí se validan. `preflight.sql` identifica líneas antiguas que requieren revisión.

**No ejecutes 001 ni 002 después de 003:** contienen las políticas permisivas antiguas. 003 las sustituye por las políticas de acceso interno y las funciones transaccionales.

La semilla agrega 160 productos identificados como ejemplos. Al repetirla conserva existencias, reservas, precios y ediciones de productos ya presentes. No representa una validación del catálogo comercial real.

## 3. Habilitar cuentas y roles

1. En **Authentication > Users**, crea o invita la cuenta `volklated@gmail.com` y habilita su acceso por correo/contraseña.
2. Ejecuta `supabase/bootstrap-gerencia.sql` como administrador. Ya está configurado para ese correo; asigna el perfil `GERENCIA` a la cuenta existente, sin crear ni cambiar su contraseña.
3. Inicia sesión en `/login` con esa cuenta. Su perfil debe mostrar `GERENCIA`.
4. Crea/invita las otras cuentas en Supabase Auth.
5. En `/equipo`, asigna sus roles y estado activo utilizando sus correos.

El primer perfil de Gerencia se crea desde SQL Editor, no desde una pantalla pública. Ningún usuario puede asignarse un rol desde el navegador. Una cuenta Auth sin perfil activo no accede al panel. Desactivar un perfil impide las siguientes operaciones aunque conserve temporalmente su sesión Auth.

| Rol | Operaciones |
|---|---|
| Gerencia | Productos, importación, equipo, recepción, pedidos, reposición, contactos y exportación. |
| Ventas | Consulta interna de productos, borradores, confirmación, cancelación y contactos. |
| Almacén | Consulta interna, entradas, preparación, despacho y recepción de compras aprobadas. |
| Público | Campos comerciales del catálogo, solicitud web, contacto y seguimiento con enlace privado. |

No se concede escritura directa de tablas al navegador. Las funciones comprueban sesión/rol y ejecutan las operaciones en una transacción. RLS limita también las lecturas directas.

## 4. Verificar el flujo del PDF

1. Como Gerencia, crea un producto con físico **20**, precio positivo, mínimo y objetivo. Define un código de barras si se usará un lector.
2. Como Almacén, entra a `/inventario`, reconoce el código y recibe **40** unidades. Verifica **60** después de recargar.
3. Introduce un código inexistente y verifica la alternativa de búsqueda. El reconocimiento debe ser visualmente claro.
4. Como Ventas, crea un borrador con cliente ficticio e ítems. Recarga; verifica estado e ítems sin modificar stock.
5. Prepara físico **30**, confirma un pedido de **20** y abre otro de **24**: disponible **10**, pendiente **14**. El segundo no puede confirmarse completo; requiere aceptar explícitamente entregar lo disponible.
6. Cancela el primer pedido y verifica que libere las **20** reservadas.
7. Como Almacén, prepara las **10** confirmadas del segundo pedido, despacha y verifica físico **20**, reservado **0**, constancia interna y ausencia de doble descuento.
8. Abre el catálogo como público: debe reflejar los cambios tras reconsultar. Agregar al carrito no reserva unidades; enviar crea una solicitud en la bandeja de Ventas.
9. Consulta la solicitud usando su enlace privado. Otro token no debe devolver datos. La confirmación por WhatsApp se abre como mensaje preparado para envío manual.
10. Revisa alertas al alcanzar el mínimo, crea una propuesta, aprueba y recibe las unidades. No hay envío automático al proveedor.

Registra versión, caso, resultado, usuario de prueba y evidencia. No uses credenciales ni datos personales reales en capturas.

## 5. Prueba real de concurrencia

Las pruebas locales utilizan PostgreSQL embebido. Para comprobar **dos sesiones de red simultáneas** en un proyecto Supabase de prueba, el repositorio incluye `scripts/test-live-concurrency.mjs`.

Configura en el entorno del proceso (nunca con prefijo `VITE_`):

```text
TCA_LIVE_TEST=1
TCA_TEST_MANAGER_EMAIL
TCA_TEST_MANAGER_PASSWORD
TCA_TEST_SALES_EMAIL
TCA_TEST_SALES_PASSWORD
```

Usa dos cuentas de prueba con perfiles Gerencia y Ventas. El script abre dos sesiones de Ventas independientes, crea un producto marcado como ejemplo y dos borradores, intenta reservar las últimas unidades simultáneamente y reenvía el despacho. Al finalizar cancela lo cancelable y desactiva el producto; conserva el historial de prueba.

```powershell
node --env-file=.env scripts/test-live-concurrency.mjs
```

No lo ejecutes en producción. Esta prueba remota quedó sin ejecutar por la clave rechazada del proyecto actual.

## Cámara y lectores

Los lectores USB/Bluetooth que escriben el código y envían Enter funcionan en el campo de reconocimiento. El botón de cámara utiliza `BarcodeDetector` cuando el navegador lo soporta, requiere permiso del usuario y contexto HTTPS (o localhost). Si no está disponible, se ofrece el lector o búsqueda manual. No se certificó hardware físico ni cámara real durante las pruebas automatizadas.

## Referencias técnicas consultadas

- [Funciones de base de datos de Supabase](https://supabase.com/docs/guides/database/functions).
- [Supabase Auth: signInWithPassword](https://supabase.com/docs/reference/javascript/auth-signinwithpassword).
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
