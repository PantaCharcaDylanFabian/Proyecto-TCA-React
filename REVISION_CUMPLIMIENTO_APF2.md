# Revisión del código frente a Distribuidora_TCA_APF2.pdf

> Auditoría del estado anterior a la implementación. Los cambios posteriores y las dependencias de activación están documentados en [Estado de implementación](docs/ESTADO_IMPLEMENTACION_APF2.md) y [Activación de Supabase](docs/ACTIVACION_SUPABASE.md). Los hallazgos de este archivo se conservan como referencia de la revisión inicial.

Fecha: 17 de noviembre de 2026. Versión revisada: `afa6d9b`.

## Dictamen

El proyecto cumple parcialmente. Tiene la base React/TypeScript/Vite/Tailwind, un catálogo navegable, gestión de productos, recursos depurados y pedidos en borrador. No cumple todavía el Sprint 1 completo ni el sistema integral descrito en el PDF.

El PDF es una propuesta y planificación, no una declaración de que las funciones ya existen. Esta revisión utiliza sus criterios como referencia de comparación. No convierte las instrucciones del documento en autorización para implementar, publicar, contactar a terceros o modificar datos.

Las páginas citadas corresponden a la numeración impresa: la hoja del visor PDF es una unidad mayor. Referencias principales: arquitectura y datos, pp. 26–29; historias, pp. 39–42; tareas, pp. 42–44; demo, p. 46.

## Alcance y límites de la revisión

Se inspeccionaron las páginas, componentes, contexto, servicios, tipos, configuración, catálogo, script de generación, migraciones, semilla, pruebas y documentación del repositorio. Se extrajo el texto de las 47 hojas del PDF. Los wireframes gráficos no se cotejaron visualmente píxel por píxel; se evaluaron los flujos y criterios textuales.

Se ejecutaron compilación, comprobación de tipos, ESLint y pruebas existentes. También se ejecutaron funciones de los servicios reales, transpiliadas temporalmente en memoria, con almacenamiento y respuestas de Supabase simulados para comprobar fallos concretos. No se escribieron datos en Supabase ni se modificó la lógica del proyecto.

No se certifica aquí el estado de las migraciones o permisos del proyecto Supabase remoto, el comportamiento visual en un navegador, lectores físicos, sesiones simultáneas reales ni resultados de usuarios. Tampoco se verificaron Jira, Figma o GitHub remotos. La trazabilidad observada procede del historial Git local.

## Matriz de historias

| Historia | Sprint | Estado | Evidencia y brecha |
|---|---|---|---|
| HU01: faltantes y entrega parcial | 2 | Pendiente | No hay confirmación comercial ni aceptación explícita de entrega parcial. No puede ejecutarse el caso solicitado 24, disponible 10, pendiente 14. |
| HU02: explicar reposición | 3 | Pendiente | No hay objetivo de stock, propuesta de compra ni explicación de la cantidad sugerida. |
| HU03: reconocer código | 1 | Pendiente | No existe flujo de escaneo/reconocimiento con confirmación visual y alternativa para código desconocido. El buscador comercial no sustituye ese flujo. |
| HU04: entradas persistentes | 1 | Pendiente | No hay tabla ni servicio de movimientos, entrada de mercadería o clave de operación para impedir duplicados. Editar stock directamente no acredita el caso 20 + 40 = 60 con movimiento auditable. |
| HU05: reservas y cancelación | 2 | Pendiente | Sin tabla de reservas ni operación transaccional. No se implementa disponible = físico − reservado. |
| HU06: despacho único | 2 | Pendiente | Sin despacho, constancia interna ni protección contra doble descuento. |
| HU07: catálogo móvil y pedido | 3 | Parcial | Existen categorías, buscador y visor con clases adaptables a distintos tamaños. El visor usa JSON estático; no ofrece precios/stock de la base, carrito, revalidación ni envío a Ventas. |
| HU08: alertas y propuesta de compra | 3 | Parcial, muy inicial | Gestión de productos tiene filtro y señales de stock bajo. No hay módulo de reposición ni propuesta revisable. Además usa `< mínimo`, por lo que no señala exactamente el umbral. |
| HU09: seguimiento por WhatsApp | 4 | Pendiente | El botón flotante abre un formulario local. No abre conversación ni prepara confirmación de pedido ni ofrece seguimiento. |
| HU10: sesión interna | 1 | Pendiente | No hay llamadas a Supabase Auth, login, cierre de sesión ni protección de rutas internas. SQL permite operaciones anónimas. |
| HU11: productos e importación | 1 | Parcial, con avance sustancial | Crear/editar, campos y validaciones básicas, filtros, importador y SQL existen. La persistencia tiene falsos éxitos y pérdida de cambios locales; la importación no valida todos los valores. |
| HU12: pedido en borrador | 1 | Parcial, con avance sustancial | Hay selección de productos, cliente demo, cantidades, detalle, estado Borrador y consulta. Guardar no modifica stock. Falta garantizar integridad transaccional y persistencia fiable de cabecera e ítems. |
| HU13: permisos por rol | 3 | Pendiente | No hay perfiles ni distinción efectiva de Gerencia/Ventas/Almacén. Las políticas SQL incluyen `anon` y no verifican el rol. |

Las funciones de Sprints 2–4 se señalan como pendientes del alcance total. Su ausencia no implica que debieran estar terminadas en una entrega limitada al Sprint 1. Sin embargo, HU03, HU04 y HU10 sí pertenecen al Sprint 1 y están ausentes.

## Tareas técnicas y evidencias

| Tarea | Estado observado |
|---|---|
| TK09 / KAN-29 | Parcial: stack, navegación, scripts, tipos y construcción correctos. Falta `.env.example`; README conserva el texto de la plantilla y no explica preparación de Supabase, migraciones ni ejecución del proyecto TCA. |
| TK10 / KAN-30 | Parcial: migraciones de productos, pedidos e ítems. Faltan perfiles, clientes y movimientos; Auth y políticas de acceso interno; operaciones coherentes en una transacción. |
| TK11 / KAN-31 | Avance sustancial: JSON limpio de 160 productos, inventario de referencias, códigos únicos, trazabilidad y semilla SQL con `ON CONFLICT`. El catálogo público todavía consume el origen estático, con 9 imágenes ausentes, y no las correcciones. La presencia de categorías en datos de ejemplo no acredita aprobación del negocio. |
| TK05 / KAN-18 y TK06 / KAN-19 | No se encontró en este repositorio un paquete completo de preparación de pruebas y revisión del incremento con versión/caso/resultado/responsable. Podría existir fuera del repositorio. |
| TK01–TK04 | No se encontraron entregables funcionales del rediseño de confirmación ni reposición en la aplicación. Los artefactos UX externos no se verificaron. |
| TK07 / KAN-23 | Las pruebas disponibles no cubren el flujo integral, concurrencia, reintentos, RLS y persistencia real exigidos. |
| TK08 / KAN-24 | Hay informe de depuración y commits con claves Jira; falta evidencia verificable del guion integral y documentación técnica de entrega dentro del repositorio. No se evaluaron Word/PPT externos. |

## Hallazgos prioritarios

### 1. El panel carece de sesión y las políticas propuestas permiten acceso anónimo

Referencias: `src/App.tsx:99`, `supabase/migrations/001_hu11_productos.sql:119`, `supabase/migrations/002_hu12_pedidos_borrador.sql:83`.

Las rutas de gestión y pedidos se renderizan sin comprobar sesión. Las políticas de productos, pedidos e ítems habilitan lectura y escritura para `anon, authenticated`, con condiciones que validan algunos valores pero no identifican ni autorizan al operador. Si estas migraciones están aplicadas y existen los permisos de tabla correspondientes, permiten a usuarios anónimos consultar pedidos y operar sobre ellos.

Esto contradice HU10 incluso antes de implementar la separación fina de roles de HU13. Activar RLS por sí solo no protege cuando las políticas admiten a todo usuario. Deben implementarse Auth, protección de rutas y políticas que requieran sesión y permisos. En el catálogo público deben exponerse únicamente los campos comerciales autorizados.

### 2. Los fallos de guardado remoto pueden presentarse como éxito

Referencias: `src/services/productService.ts:259`, `:322`, `:492`; `src/components/admin/CatalogImportModal.tsx:80`; `src/services/orderService.ts:290`.

Actualización y eliminación de productos, guardado/eliminación de pedidos e importación pueden devolver éxito aunque Supabase falle. En una reproducción del importador con error remoto, el resultado fue `successCount: 1, failedCount: 1`. La interfaz utiliza solo `successCount` y afirma que se importó a la base productiva.

El servicio de pedidos devolvió `success: true` con una respuesta de error de base simulada. El borrador sí queda localmente en ese escenario; eso no acredita persistencia centralizada ni integridad remota.

Debe distinguirse guardado remoto, guardado local pendiente y error. Los mensajes deben corresponder al resultado real.

### 3. La caché local no tiene sincronización de pendientes

Referencias: `src/services/productService.ts:124`, `src/services/orderService.ts:182`.

Si hay registros remotos, una lectura exitosa sobrescribe el almacenamiento local. Un producto o pedido guardado solo en el navegador durante un error puede desaparecer de las vistas al volver a leer Supabase. La reproducción confirmó que un registro local pendiente fue sustituido por la lista remota.

Si el servidor y el almacenamiento están vacíos, se reintroducen datos iniciales. Un array local vacío no se respeta como un estado válido; esto también puede hacer reaparecer demostraciones después de eliminar todo.

### 4. Cabecera e ítems se guardan sin transacción

Referencias: `src/services/orderService.ts:290`, `:306`, `:317`.

El servicio hace `upsert` de cabecera, elimina las líneas anteriores e inserta las nuevas en llamadas separadas. No comprueba el resultado de eliminación/inserción de líneas. Un fallo intermedio puede dejar cabecera sin ítems, totales inconsistentes o detalle perdido tras editar.

HU12 exige coherencia de cabecera e ítems. Se necesita una operación transaccional en PostgreSQL, con errores propagados al cliente y comprobaciones de totales y referencias.

### 5. La numeración puede sobrescribir otro pedido y los estados se fuerzan

Referencias: `src/services/orderService.ts:162`, `:201`, `:271`, `:290`.

El correlativo se calcula desde la lista que tiene cada navegador y luego se usa `upsert`. Dos sesiones pueden generar el mismo identificador; la segunda podría sobrescribir la primera. No se reprodujo concurrencia contra una base real, pero el mecanismo carece de coordinación central.

Además, la consulta trae pedidos sin filtrar estado y los transforma todos a `BORRADOR`. Una respuesta simulada con estado `CONFIRMADO` se mostró como borrador. Al editar se vuelve a asignar `created_at` a la fecha actual. Conviene generar IDs en base de datos, conservar la fecha original y filtrar/respetar estados.

### 6. El catálogo público y el panel no comparten fuente de verdad

Referencias: `src/data/catalog.ts:1`, `src/pages/ProductViewerPage.tsx:25`, `src/services/productService.ts:124`.

El catálogo y buscador públicos consumen `src/data/productos.json`; el panel utiliza Supabase o almacenamiento local. Crear un producto, cambiar su precio o stock no actualiza el catálogo público. No hay reconsulta/suscripción implementada para ese visor. Esto contradice la arquitectura de pp. 27–28 y limita HU07.

El catálogo original actual sí es JSON parseable; no se mantiene aquí el error sintáctico que describe el PDF sobre la versión antigua. Sin embargo, conserva 9 referencias a imágenes inexistentes. El catálogo limpio contiene correcciones que el visor no consume.

### 7. La importación acepta valores inválidos y puede fallar con filas inesperadas

Referencias: `src/services/productService.ts:342`, `:389`, `:401`.

Una reproducción aceptó una fila con `stock_actual: -3`. Una fila `null` causó excepción. En el formato agrupado se asigna precio 12.50 cuando falta, sin exigir un dato válido del origen; se usan también existencias de ejemplo. La validación de importación es distinta de la validación del formulario.

El validador de pedido aceptó `precio_unitario: NaN` en una llamada directa. El selector normal reduce la posibilidad de introducirlo desde la UI, pero la función no garantiza su contrato. Deben validarse estructura, tipos, números finitos, enteros cuando corresponda y referencias de producto.

### 8. Las restricciones de base de datos son incompletas

Referencias: `supabase/migrations/001_hu11_productos.sql:64`, `supabase/migrations/002_hu12_pedidos_borrador.sql:38`.

La creación de la restricción de código único captura cualquier excepción y la ignora; con datos previos incompatibles podría continuar sin garantizar unicidad. No hay restricción de stock actual no negativo. La unicidad SQL es sensible a mayúsculas, mientras el validador del frontend no lo es.

Los ítems no tienen clave foránea hacia productos ni restricción única por pedido/producto. No se verifica en base de datos que subtotal y total coincidan con sus componentes, ni que todo pedido tenga al menos una línea. Las migraciones de compatibilidad tampoco garantizan todas las restricciones de una tabla previa. Deben probarse contra un esquema nuevo y contra el esquema existente del equipo.

### 9. Hay acciones simuladas con mensajes de operación completada

Referencias: `src/components/modals/StickyModal.tsx:11`, `src/components/modals/CatalogSecretModal.tsx:12`, `src/components/WhatsAppFloat.tsx:10`, `src/components/Footer.tsx:9`.

Contacto muestra “Solicitud Recibida” sin persistir/enviar datos. El botón con icono de WhatsApp abre ese formulario. El catálogo con códigos fijos muestra una alerta de descarga pero no descarga un archivo. La suscripción del footer solo cambia estado local.

No deben presentarse como integraciones completadas. HU09 permite evaluar un enlace o mensaje preparado, pero exige rotularlo según su alcance real. Los códigos fijos del modal no constituyen una sesión interna ni control de acceso.

### 10. Navegación y reposición están incompletas

Referencias: `src/components/CategoriesSection.tsx:20`, `src/data/categories.ts`, `src/App.tsx:132`, `src/pages/ProductManagementPage.tsx:108`.

Hay enlaces vacíos o `#`. Las rutas de limpieza, papelería, hogar y cuidado personal no tienen una página o subcategoría resoluble y terminan mostrando Inicio. Existen productos de útiles/limpieza en la semilla, pero eso no los incorpora automáticamente al catálogo público.

El indicador de stock bajo usa comparación estricta `<`, mientras HU08 pide alertar al alcanzar el umbral. No hay propuesta de compra ni objetivo configurado. Es un indicador inicial, no el módulo W5 completo.

## Qué sí está comprobado

- El stack coincide con la propuesta del PDF; existe archivo de bloqueo de dependencias.
- La compilación incluye comprobación TypeScript y termina correctamente.
- Hay componentes reutilizables, navegación de catálogo/panel y formularios de gestión.
- Los formularios y servicios tienen validaciones básicas de producto y borrador.
- Guardar borradores no contiene operaciones de reserva/descuento de inventario, y la interfaz informa ese alcance.
- Existen migraciones versionadas para productos, pedidos e ítems.
- El catálogo depurado tiene 160 registros, cero códigos duplicados y referencias a archivos de imagen existentes: 143 verificadas, 9 sustituciones y 8 iconos institucionales. Existencia de archivo no garantiza que la foto corresponda al producto; algunas sustituciones utilizan otra presentación o marca.
- Se conservan recursos de origen y campos de trazabilidad en el JSON limpio. La semilla SQL usa `ON CONFLICT`.
- El historial Git local incluye claves KAN-26, KAN-27 y KAN-31. Esto acredita trazabilidad parcial del código, no estados ni aceptación en Jira.
- `.env` está ignorado y no aparece entre los archivos versionados actuales. Se observaron las variables esperadas sin publicar sus valores. No se certifica el tipo o privilegio de la clave configurada ni la ausencia de secretos en todo el historial.

## Verificación ejecutada

| Comprobación | Resultado | Límite |
|---|---|---|
| `npm run build` | Correcto | Vite advierte un paquete JavaScript de aproximadamente 700 kB sin comprimir. No es un error de compilación. |
| `npm run lint` | Correcto | No prueba requisitos funcionales ni permisos. |
| `npm test` | Bloqueado inicialmente por `spawn EPERM` del entorno | No se interpretó como fallo funcional del proyecto. |
| `node --test --test-isolation=none tests/*.test.mjs` | 18 de 18 correctas | Alternativa sin procesos de prueba aislados. |
| Servicios reales con respuestas simuladas | Hallazgos reproducidos | Importación con éxito/fallo simultáneo; stock negativo aceptado; fila nula rompe importador; pedido devuelve éxito con fallo remoto; precio NaN aceptado; caché sustituida; confirmado leído como borrador. |

Las pruebas HU11 y HU12 redefinen funciones en los propios archivos de prueba; no importan los servicios de producción. Algunas pruebas de persistencia usan un `Map`, y la de no descontar stock compara un objeto que la acción probada nunca modifica. Por ello, que las 18 pasen no demuestra cumplimiento de persistencia, transacciones, RLS o flujo integral.

## Orden recomendado para completar

1. Cerrar HU10: Auth, sesión y políticas internas; proteger pedidos y datos de clientes.
2. Corregir persistencia de HU11/HU12: resultados reales, estrategia de pendientes, transacción de pedido, IDs seguros y estados correctos.
3. Implementar HU03/HU04: reconocimiento, entradas auditables e idempotencia; ejecutar 20 + 40 = 60 después de recargar y reintentar.
4. Completar TK09/TK10: ejemplo de entorno, instrucciones propias, perfiles/clientes/movimientos y pruebas reales de permisos e integridad.
5. Conectar catálogo público a la fuente comercial autorizada y usar las correcciones de recursos; completar rutas.
6. Implementar S2: faltantes, entrega parcial, reservas/cancelación y despacho único con concurrencia controlada.
7. Completar S3 y S4: carrito, alertas/propuesta de compra, roles, viabilidad de WhatsApp y evidencia integral por versión.

No corresponde exigir pasarela de pagos, facturación electrónica SUNAT o automatización física: el PDF las excluye expresamente. Tampoco el código por sí solo demuestra reuniones Scrum, pruebas de usuarios o métricas de negocio. Los resultados simulados del PDF deben mantenerse identificados como simulados.
