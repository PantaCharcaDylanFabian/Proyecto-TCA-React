# 🧠 TCA - Módulo Backend & Inteligencia Artificial (BACK)

Módulo integral de servidor, API REST de alta precisión y **Suite de Inteligencia Artificial (APF 3)** de Distribuidora TCA, potenciado por **Google Antigravity SDK**, Node.js y Python 3.12.

---

## 📁 Estructura del Módulo Backend

```
back/
├── ai_analytics/                          # Suite de IA, Machine Learning y Algoritmos (Python)
│   ├── reports/                           # Gráficos generados (ROC, dispersión, confusión, feature importance)
│   ├── APF3_TCA_Machine_Learning.ipynb    # Jupyter Notebook interactivo de experimentación
│   ├── catalogo-depurado.json             # Catálogo maestro local para analítica independiente
│   ├── classification_models.py           # Regresión Logística Sigmoide (Riesgo de Quiebre de Stock)
│   ├── data_loader.py                     # Ingeniería de características operativas
│   ├── main.py                            # Orquestador general de métricas
│   ├── ml_algorithms.py                   # Benchmark: SVM, KNN, Decision Tree, AdaBoost, Random Forest
│   ├── regression_models.py               # Regresión Lineal vs Polinomial G2 vs Ridge G3
│   ├── search_algorithms.py               # Algoritmos de ruta en Piura (A*, BFS, DFS, Hill Climbing)
│   └── tca_agent.py                       # Agente Autónomo Copiloto con Google Antigravity SDK
├── api/
│   └── server.js                          # Servidor API REST Node.js (Catálogo, Operaciones, IA, Antigravity)
├── scripts/
│   ├── antigravity-code-quality.mjs       # Auditoría de Calidad y Rúbrica con Google Antigravity SDK
│   └── test-live-concurrency.mjs          # Pruebas de concurrencia y transacciones en vivo
├── services/
│   ├── antigravityService.js              # Motor de razonamiento y Tool Calling del SDK de Antigravity
│   └── supabaseService.js                 # Integración con PostgreSQL / Supabase y fallback resiliente
├── tests/
│   └── backend.test.mjs                   # Suite de pruebas unitarias y de integración del backend
├── package.json                           # Scripts y dependencias del backend
├── requirements.txt                       # Librerías Python de ciencia de datos
└── README.md
```

---

## 🤖 Integración de Google Antigravity SDK

El backend implementa la arquitectura oficial de **Tool Calling** y **Agent Runtime** de Google Antigravity:

1. **Herramientas Registradas (`tools`):**
   - `predecir_demanda`: Proyección no lineal con Regresión Polinomial Grado 2 ($R^2 = 0.9977$).
   - `evaluar_riesgo_inventario`: Diagnóstico de probabilidad de rotura de stock mediante función sigmoide ($F1 = 100\%$, $\text{AUC} = 1.0000$).
   - `optimizar_ruta_despacho`: Búsqueda de camino mínimo con **Algoritmo $A^*$** usando heurística euclidiana admisible sobre la red vial de Piura (costo óptimo global = 43.7 km).
   - `sugerir_reposicion`: Cálculo de déficit respecto a stock objetivo.

2. **Dispatcher Conversacional:**
   - Interpreta consultas en lenguaje natural en `POST /api/antigravity/chat`.
   - Genera trazas de pensamiento estructuradas (`thoughtTrace`).
   - Invoca las herramientas de cálculo con exactitud matemática y devuelve respuestas contextualizadas.

---

## 📡 Catálogo Completo de Endpoints API REST

La API se ejecuta por defecto en `http://localhost:3001`:

### 1. Sistema y Estado
| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/health` | Estado del backend y confirmación de Antigravity SDK |
| `GET` | `/api/antigravity/status` | Metadatos del agente, versión de SDK y herramientas registradas |

### 2. Copiloto Inteligente & Tool Calling (Google Antigravity SDK)
| Método | Endpoint | Payload | Descripción |
|---|---|---|---|
| `POST` | `/api/antigravity/chat` | `{"prompt": "proyecta la demanda de TCA-029085"}` | Chat conversacional con ejecución automática de herramientas |
| `POST` | `/api/antigravity/tools/:name` | Argumentos de la herramienta | Ejecución directa de una herramienta específica |

### 3. Modelos Matemáticos y Algoritmos (APF 3)
| Método | Endpoint | Payload | Descripción |
|---|---|---|---|
| `POST` | `/api/ai/predict-demand` | `{"codigo": "TCA-029085", "demandaSemanal": 31}` | Predicción con Regresión Polinomial G2 |
| `POST` | `/api/ai/stockout-risk` | `{"codigo": "TCA-042822", "stockActual": 15}` | Probabilidad de quiebre con Regresión Logística |
| `POST` | `/api/ai/optimal-route` | `{"origen": "ALMACEN_CENTRAL_CASTILLA", "destino": "BELLAVISTA_SULLANA", "algoritmo": "ASTAR"}` | Cálculo de ruta óptima con $A^*$ |
| `GET` | `/api/ai/routes` | Ninguno | Coordenadas cartesianas de los 11 nodos viales de Piura |

### 4. Gestión de Productos y Catálogo
| Método | Endpoint | Parámetros | Descripción |
|---|---|---|---|
| `GET` | `/api/productos` | `?q=atun&categoria=alimentos&limit=20` | Catálogo paginado con filtros de búsqueda |
| `GET` | `/api/productos/:codigo` | Ninguno | Detalle completo de un producto por código |
| `POST` | `/api/productos` | `{codigo, nombre, precio, stock_actual, ...}` | Creación o actualización de producto |

### 5. Inventario y Operaciones
| Método | Endpoint | Payload | Descripción |
|---|---|---|---|
| `GET` | `/api/inventario` | Ninguno | Resumen valorizado, conteo en quiebre, alerta y óptimo |
| `POST` | `/api/inventario/movimiento` | `{"codigo": "TCA-029085", "tipo": "ENTRADA", "cantidad": 50}` | Registro de movimiento kardex |

### 6. Pedidos y Ventas
| Método | Endpoint | Payload | Descripción |
|---|---|---|---|
| `GET` | `/api/pedidos` | Ninguno | Listado de pedidos y sus estados |
| `POST` | `/api/pedidos/borrador` | `{cliente_nombre, lineas: [{producto_id, cantidad}]}` | Creación atómica de pedido borrador |
| `POST` | `/api/pedidos/:id/confirmar` | Ninguno | Confirmación de pedido y reserva de inventario |

### 7. Auditoría de Calidad
| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/quality/audit` | Dictamen de certificación de calidad de software (100/100%) |

---

## 🚀 Guía de Ejecución

```bash
# 1. Iniciar servidor API en modo producción (puerto 3001)
npm start

# 2. Iniciar servidor en modo desarrollo con recarga automática
npm run dev

# 3. Ejecutar pruebas unitarias de backend
npm test

# 4. Ejecutar auditoría automatizada de calidad
npm run quality:audit

# 5. Ejecutar la suite completa de Machine Learning (Python)
npm run ai:all

# 6. Ejecutar el Agente Inteligente Antigravity (Python)
npm run ai:agent
```
