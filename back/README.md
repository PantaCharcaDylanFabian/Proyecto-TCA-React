# 🧠 TCA - Módulo Backend & Inteligencia Artificial (BACK)

Este directorio concentra los servicios de servidor, la API REST y la **Suite Completa de Modelos de Inteligencia Artificial y Machine Learning (APF 3)** de Distribuidora TCA.

---

## 📁 Estructura del Módulo

```
back/
├── ai_analytics/
│   ├── reports/                           # Gráficos generados (ROC, dispersión, confusión, feature importance)
│   ├── APF3_TCA_Machine_Learning.ipynb    # Jupyter Notebook interactivo de sustentación
│   ├── catalogo-depurado.json             # Catálogo maestro para analítica y pipelines
│   ├── classification_models.py           # Regresión Logística Sigmoide (Riesgo de Quiebre de Stock)
│   ├── data_loader.py                     # Carga e ingeniería de características operativas
│   ├── main.py                            # Orquestador y generador de métricas
│   ├── ml_algorithms.py                   # Benchmark: SVM, KNN, Decision Tree, Boosting, Random Forest
│   ├── regression_models.py               # Regresión Lineal vs Polinomial G2 vs Ridge G3
│   ├── search_algorithms.py               # Modelado formal y algoritmos de ruta (A*, BFS, DFS, Hill Climbing)
│   └── tca_agent.py                       # Agente Autónomo Copiloto con Google Antigravity SDK
├── api/
│   └── server.js                          # Servidor API REST en Node.js (Catálogo, Predicciones IA, Rutas)
├── scripts/
│   ├── antigravity-code-quality.mjs       # Auditoría de Calidad basada en el SDK de Antigravity
│   └── test-live-concurrency.mjs          # Pruebas de concurrencia y transacciones en vivo
├── package.json                           # Scripts Node.js para ejecutar la API y auditorías
├── requirements.txt                       # Librerías de Python para la suite de IA/ML
└── README.md
```

---

## 🚀 Cómo Ejecutar

### 1. Servidor API REST (Node.js)
```bash
# Iniciar la API REST en el puerto 3001
npm start
```
Endpoints principales:
- `GET /health`: Estado del servidor.
- `GET /api/catalogo`: Lista completa de productos.
- `POST /api/ai/predict-demand`: Proyección quincenal con Regresión Polinomial Grado 2 ($R^2 = 0.9977$).
- `POST /api/ai/stockout-risk`: Evaluación de riesgo de rotura de inventario con Regresión Logística.
- `GET /api/ai/routes`: Nodos viales para cálculo de rutas $A^*$.

### 2. Suite de Inteligencia Artificial (Python)
```bash
# Instalar dependencias:
pip install -r requirements.txt

# Ejecutar todos los modelos y generar reportes:
python ai_analytics/main.py

# Ejecutar el Agente Inteligente Antigravity:
python ai_analytics/tca_agent.py
```

### 3. Auditoría de Calidad Antigravity
```bash
npm run quality:audit
```
Certifica automáticamente el cumplimiento de los 5 criterios de la rúbrica APF 3 con un puntaje de 100/100%.
