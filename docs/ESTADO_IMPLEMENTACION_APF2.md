# Estado de implementación frente al PDF

Fecha: 17 de noviembre de 2026. Base Git: `afa6d9b`; cambios en el árbol de trabajo, todavía sin commit ni revisión de otro integrante.

## Funcionalidad implementada

| Historias | Código implementado |
|---|---|
| HU10 / HU13 | Auth, inicio/cierre de sesión, perfiles activos y roles; rutas protegidas, RLS y funciones con comprobación de permisos. Bootstrap administrativo para la primera Gerencia. |
| HU11 / TK09–TK11 | Gestión de productos, validación compartida, códigos únicos, importación transaccional y auditoría de rechazos. Catálogo depurado, semilla repetible, configuración de ejemplo e instrucciones. |
| HU03 / HU04 | Reconocimiento por código/barras, búsqueda alternativa, cámara cuando esté soportada, entradas con actor/fecha/referencia e idempotencia. |
| HU12 | Borrador con cabecera/ítems atómicos, ID generado en servidor, control de versión y precios del catálogo; sin reserva ni descuento. |
| HU01 / HU05 | Faltantes textuales, aceptación explícita de parcial, reservas transaccionales, disponible = físico − reservado y cancelación con liberación. |
| HU06 | Preparación de ítems por código, despacho único, movimiento de salida y constancia interna imprimible. |
| HU07 | Catálogo desde campos comerciales autorizados, búsqueda por nombre/código, precios/disponibilidad, carrito móvil y solicitud revalidada en bandeja de Ventas. |
| HU02 / HU08 | Alerta al alcanzar mínimo, objetivo configurable, regla explícita, compras pendientes descontadas de la sugerencia, propuesta revisable, aprobación y recepción única. |
| HU09 | Enlace privado de seguimiento y mensaje preparado de WhatsApp. No se declara integración de envío automático. |

También se sustituyeron las simulaciones de contacto, suscripción y descarga por almacenamiento real y exportación CSV. El catálogo se reconsulta al recuperar foco, tras operaciones del inventario y cada 30 segundos si la página está visible; no se promete sincronización instantánea.

## Evidencia técnica local

Resultados observados en la verificación de esta entrega:

| Comando | Resultado |
|---|---|
| `npm run check` | Comprobación TypeScript correcta. |
| `npm run lint` | Correcto, sin errores ni advertencias de ESLint. |
| `npm test` | 26 comprobaciones correctas, incluidos subcasos PostgreSQL. |
| `npm run test:e2e` | 8 recorridos correctos en Edge; incluye pérdida de respuesta y reintento tanto del carrito como del borrador interno. |
| `npm run build` | Compilación de producción correcta; pantallas operativas divididas en módulos. |
| Comprobación del proyecto Supabase configurado | Rechazada por `Invalid API key`; no acredita activación remota. |

Los comandos y resultados finales se registran en la entrega. La suite de base de datos ejecuta las migraciones reales en PostgreSQL embebido (PGlite), con roles `anon` y `authenticated` y un esquema Auth de prueba. No es un mock del algoritmo de reservas.

Las pruebas de navegador ejecutan React en Edge y conectan las llamadas RPC a esa base embebida. El intercambio de sesión Auth se simula exclusivamente en el arnés de pruebas; la aplicación utiliza Supabase Auth real. No existen cuentas de demostración ni contraseña fija que permitan saltarse Auth en la aplicación.

Cobertura: accesos permitidos/denegados, 20 + 40 = 60 persistente, reintentos, borrador atómico, precios del servidor, control de versión, parcial, reservas sin sobreventa en operaciones serializadas, cancelación, preparación, despacho único, carrito móvil, seguimiento por token, compras, contacto, descarga y respuesta de red perdida sin pedido duplicado.

Las funciones de inventario adquieren un bloqueo transaccional común para una operación breve y bloqueos de filas. Es una elección conservadora para el tamaño del demo: evita sobreventa entre sesiones; reduce paralelismo y puede requerir particionar bloqueos al escalar. Se incluye un guion separado de concurrencia real con dos conexiones a Supabase; aún no se ejecutó.

## Activación y validaciones pendientes fuera del código

- Aplicar 003 en el Supabase del equipo. La comprobación remota actual devolvió `Invalid API key`; no se alteró la base remota.
- Configurar clave pública válida y cuenta inicial de Gerencia; crear/invitar cuentas de Ventas y Almacén.
- Reconciliar cualquier dato histórico que señale `preflight.sql` y verificar esquema remoto, RLS y persistencia allí.
- Ejecutar el guion de concurrencia con dos sesiones reales y documentar latencia de reconsulta.
- Probar un lector físico y una cámara compatible en el entorno de exposición.
- Confirmar con el negocio categorías, precios, existencias, imágenes y teléfono comercial. Los 160 productos semilla están rotulados como ejemplos; las sustituciones de imágenes son referenciales.
- Realizar revisión por otro integrante, pruebas reales con usuarios y registro por versión. Se incluye una plantilla sin resultados inventados.
- Vincular los cambios reales con Jira y preparar la evidencia de la exposición. No se crearon tickets, actas ni estados de finalización ficticios.

Pagos, emisión SUNAT y automatización física permanecen excluidos por el PDF. Las alertas no se basan en una rotación histórica inexistente y las propuestas no se envían automáticamente a proveedores.
