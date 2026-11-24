# 🏢 Distribuidora TCA — Arquitectura Monorepo Tripartita

Sistema integral de gestión de inventarios, pedidos, analítica predictiva y optimización logística para **Distribuidora TCA**. El proyecto se encuentra dividido en **3 módulos independientes y desacoplados**:

```
Proyecto-TCA-React/
├── bd/       # 🗄️ Base de Datos (PostgreSQL, Supabase, Migraciones, RLS, Semillas)
├── back/     # 🧠 Backend & IA (API REST, Machine Learning, Algoritmos A*, Agente Antigravity)
└── front/    # 💻 Frontend (React 19, TypeScript, Vite, Tailwind CSS v4)
```

---

## 🏗️ 1. Módulos del Sistema

### 🗄️ Módulo de Base de Datos (`/bd`)
- **Motor:** PostgreSQL gestionado a través de Supabase.
- **Seguridad:** Row Level Security (RLS) estricto con segregación de roles (`GERENCIA`, `VENTAS`, `ALMACEN`, `ANON`).
- **Migraciones:** Esquema versionado (`001_hu11_productos.sql`, `002_hu12_pedidos_borrador.sql`, `003_operacion_integral.sql`).
- **Catálogo:** Carga inicial reproducible de 160 productos mediante `seed.sql`.
- **Pruebas:** Pruebas automatizadas en memoria con `@electric-sql/pglite` (`npm run test:bd`).
- 👉 Más detalles en [bd/README.md](bd/README.md).

### 🧠 Módulo Backend e Inteligencia Artificial (`/back`)
- **API REST (Node.js):** Servidor HTTP con endpoints para catálogo (`/api/catalogo`), predicción de demanda (`/api/ai/predict-demand`), evaluación de rotura de stock (`/api/ai/stockout-risk`) y cálculo de rutas logísticas.
- **Suite de IA y Machine Learning (Python 3.12):**
  - **Búsqueda Heurística:** Modelado formal de espacio de estados y comparación de algoritmos ($A^*$, BFS, DFS, Hill Climbing).
  - **Regresión:** Regresión Lineal vs. Polinomial Grado 2 ($R^2 = 0.9977$) vs. Ridge G3.
  - **Clasificación:** Regresión Logística Sigmoide ($F1 = 100\%$, $\text{AUC} = 1.0000$, $C=1.0$).
  - **Ensambles:** Benchmark cruzado $k=5$ con SVM, KNN, Decision Tree, AdaBoost y Random Forest.
  - **Agente Inteligente:** Copiloto con Tool Calling integrado mediante el SDK de Google Antigravity.
- **Calidad de Software:** Auditoría automatizada con certificación de 100/100% (`npm run quality:audit`).
- 👉 Más detalles en [back/README.md](back/README.md).

### 💻 Módulo Frontend (`/front`)
- **Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4.
- Gerencia y Almacén pueden planificar rutas en `/rutas-de-reparto` y evaluar productos en `/reposicion?vista=prevision`. La previsión consulta la API para estimar demanda quincenal, riesgo de agotamiento y prioridad de reposición.
- **Módulos Operativos:** Catálogo comercial, control de inventario, gestión de pedidos y borradores atómicos, escáner de códigos de barra y reposición inteligente.
- **Pruebas:** Validaciones puras de dominio (`hu11`, `hu12`) y pruebas E2E con Playwright.
- 👉 Más detalles en [front/README.md](front/README.md).

---

## ⚡ Guía de Inicio Rápido (Comandos Globales)

Puedes ejecutar todas las operaciones directamente desde la raíz del monorepo mediante npm workspaces:

| Tarea | Comando en Raíz | Descripción |
|---|---|---|
| **Iniciar Frontend** | `npm run dev` | Inicia el servidor de desarrollo Vite (`localhost:5173`) |
| **Iniciar Backend API** | `npm run start:back` | Inicia la API REST en `localhost:3001` |
| **Compilar Frontend** | `npm run build` | Compila TypeScript y genera el bundle de producción |
| **Linter Frontend** | `npm run lint` | Ejecuta ESLint en el frontend |
| **Pruebas Completas** | `npm test` | Ejecuta las pruebas de frontend y de base de datos |
| **Pruebas de BD** | `npm run test:bd` | Ejecuta la suite de PostgreSQL y RLS |
| **Pruebas de Frontend** | `npm run test:front` | Ejecuta las pruebas de validación de negocio |
| **Modelos de IA** | `npm run test:back` | Ejecuta los modelos de Python y genera reportes |
| **Auditoría de Calidad** | `npm run quality:audit` | Auditoría automatizada con el SDK de Antigravity |

---

## 🔌 Integración con un Nuevo Frontend

Al haberse dividido el repositorio en 3 carpetas independientes:
1. **Consumo de Base de Datos:** El nuevo front puede conectarse directamente a la base de datos Supabase usando las variables de entorno en `.env` y las RPC definidas en `bd/supabase/migrations/`.
2. **Consumo de API Backend / IA:** El nuevo front puede consumir los endpoints REST expuestos por `back/api/server.js` (puerto 3001) para predicciones de Machine Learning, optimización de despacho $A^*$ y auditoría.
3. **Frontend de Referencia:** El directorio `front/` permanece 100% funcional y sirve como referencia completa de componentes, tipos TypeScript (`front/src/types/`) y reglas de validación de negocio (`front/src/domain/validation.ts`).
