# 💻 TCA - Módulo Frontend (FRONT)

Este directorio contiene la interfaz web de usuario de **Distribuidora TCA**, construida con **React 19**, **TypeScript**, **Vite** y **Tailwind CSS v4**.

---

## 📁 Estructura del Módulo

```
front/
├── public/                 # Assets estáticos, logos, imágenes de productos
│   ├── favicon.svg
│   ├── icons.svg
│   └── imagenes/           # Inventario físico de imágenes de 160 productos
├── src/
│   ├── assets/             # Logos y gráficos en código
│   ├── components/         # Componentes reutilizables (Header, Footer, Modales, Scanner)
│   │   ├── admin/          # Formularios e importador de productos
│   │   ├── modals/         # Modales de detalle y zoom
│   │   └── orders/         # Gestión y borradores de pedidos
│   ├── context/            # Estados globales (AuthContext, CommerceContext, UIContext)
│   ├── data/               # Catálogo de datos en JSON y categorías
│   ├── domain/             # Reglas de negocio puras y validaciones (HU11, HU12)
│   ├── hooks/              # Custom Hooks de React
│   ├── lib/                # Clientes Supabase y API
│   ├── pages/              # Páginas del sistema
│   │   ├── APF3AnalyticsPage.tsx  # ✨ Dashboard Interactivo APF 3 (DevOps, IA, A*, Agente)
│   │   ├── HomePage.tsx           # Vista principal con Hero Banner
│   │   ├── CatalogPage.tsx        # Catálogo comercial público
│   │   ├── DashboardPage.tsx      # Métricas de ventas e inventario
│   │   ├── InventoryPage.tsx      # Gestión de stock físico y mínimo
│   │   ├── OrdersPage.tsx         # Gestión de pedidos y despacho
│   │   └── ReplenishmentPage.tsx  # Reposición inteligente sugerida
│   ├── services/           # Servicios de integración (Calidad Antigravity, Supabase)
│   ├── types/              # Definiciones de tipos TypeScript
│   ├── utils/              # Funciones auxiliares de formato y descarga
│   ├── App.tsx             # Enrutador y layout principal
│   └── main.tsx            # Punto de entrada de React
├── tests/
│   ├── hu11-validation.test.mjs    # Pruebas unitarias de validación de productos
│   ├── hu12-order-draft.test.mjs   # Pruebas unitarias de validación de pedidos
│   └── e2e/                        # Pruebas End-to-End con Playwright
├── .env                    # Variables de entorno locales
├── .env.example            # Plantilla de variables de entorno
├── index.html              # Plantilla HTML base
├── vite.config.ts          # Configuración de Vite y Tailwind
├── tsconfig.json           # Configuración de TypeScript
└── README.md
```

---

## 🚀 Cómo Ejecutar el Frontend

```bash
# 1. Instalar dependencias (desde front/ o raíz con npm workspaces)
npm install

# 2. Iniciar servidor de desarrollo Vite
npm run dev

# 3. Compilar para producción
npm run build

# 4. Análisis estático (ESLint)
npm run lint

# 5. Ejecutar pruebas unitarias de frontend
npm test
```

> **Nota para el nuevo Frontend**: Si se va a crear un nuevo frontend (por ejemplo Next.js, Mobile App, o nuevo diseño), este directorio `front/` puede utilizarse como referencia completa de todos los componentes, contratos TypeScript (`src/types/index.ts`) y validaciones (`src/domain/validation.ts`).
