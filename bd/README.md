# 🗄️ TCA - Módulo de Base de Datos (BD)

Este directorio contiene la arquitectura completa de persistencia para el sistema de Distribuidora TCA, basado en **PostgreSQL** y gestionado mediante **Supabase**.

---

## 📁 Estructura del Módulo

```
bd/
├── data/
│   └── catalogo-depurado.json       # Dataset maestro curado (160 productos)
├── scripts/
│   └── build-catalog-seed.mjs       # Generador automatizado de seed.sql
├── supabase/
│   ├── migrations/
│   │   ├── 001_hu11_productos.sql          # Catálogo, inventario y seguridad RLS
│   │   ├── 002_hu12_pedidos_borrador.sql   # Gestión de pedidos, líneas y validaciones
│   │   └── 003_operacion_integral.sql      # Movimientos, kardex, reposición y transacciones
│   ├── bootstrap-gerencia.sql       # Creación del usuario administrador inicial
│   ├── preflight.sql                # Validación previa de extensiones y funciones
│   └── seed.sql                     # Carga masiva de 160 productos iniciales
├── tests/
│   ├── helpers/
│   │   └── database.mjs             # Harness de pruebas con PGlite (PostgreSQL en memoria)
│   ├── database.test.mjs            # Pruebas de integración de permisos RLS, stock y pedidos
│   └── tk11-catalog-seed.test.mjs   # Pruebas de integridad del catálogo de productos
├── package.json                     # Scripts y dependencias para pruebas de base de datos
└── README.md
```

---

## 🛡️ Políticas de Seguridad (RLS) y Roles

La base de datos implementa **Row Level Security (RLS)** estricto con segregación de funciones:
- **`GERENCIA`**: Acceso total (CRUD de productos, creación de usuarios, configuración y auditoría).
- **`VENTAS`**: Creación y visualización de pedidos en estado borrador, consulta de disponibilidad de stock (no puede modificar inventario directamente).
- **`ALMACEN`**: Confirmación de entradas, salidas y despachos (no puede confirmar precios ni roles de usuario).
- **`ANON` (Público)**: Solo lectura de productos activos a través de la función de catálogo seguro `tca_catalogo()`, protegiendo márgenes de ganancia y stock de seguridad.

---

## 🧪 Pruebas Automatizadas de Base de Datos

Las pruebas utilizan `@electric-sql/pglite` para ejecutar un motor PostgreSQL real directamente en Node.js, validando todas las migraciones, funciones almacenadas y políticas RLS sin necesidad de conexión externa:

```bash
# Desde la carpeta bd:
npm test

# Desde la raíz del monorepo:
npm run test:bd
```
