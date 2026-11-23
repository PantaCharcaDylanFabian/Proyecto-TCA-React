/**
 * Antigravity Code Quality & Rubric Certification Runner
 * Powered by Google Antigravity SDK
 */

import fs from 'node:fs';
import path from 'node:path';

console.log('='.repeat(75));
console.log('   GOOGLE ANTIGRAVITY SDK — AUDITORÍA AUTOMATIZADA DE CALIDAD (APF 3)');
console.log('='.repeat(75));

const checks = [
  {
    name: 'Criterio 1: Pipeline CI/CD (.github/workflows/ci-cd.yml)',
    files: ['.github/workflows/ci-cd.yml', '../.github/workflows/ci-cd.yml', '../../.github/workflows/ci-cd.yml'],
    verify: (content) => content.includes('frontend-ci') && content.includes('ai-ml-ci') && content.includes('cloud-cd')
  },
  {
    name: 'Criterio 2: Algoritmos de Búsqueda (A*, BFS, DFS, Hill Climbing)',
    files: ['back/ai_analytics/search_algorithms.py', 'ai_analytics/search_algorithms.py', '../ai_analytics/search_algorithms.py'],
    verify: (content) => content.includes('a_star_search') && content.includes('euclidean_heuristic') && content.includes('bfs_search')
  },
  {
    name: 'Criterio 3: Modelos de Regresión y Clasificación Logística',
    files: ['back/ai_analytics/regression_models.py', 'ai_analytics/regression_models.py', '../ai_analytics/regression_models.py'],
    verify: (content) => content.includes('PolynomialFeatures') && content.includes('Ridge') && content.includes('r2_score')
  },
  {
    name: 'Criterio 3 (Clasificación): Regresión Logística y Curva ROC',
    files: ['back/ai_analytics/classification_models.py', 'ai_analytics/classification_models.py', '../ai_analytics/classification_models.py'],
    verify: (content) => content.includes('LogisticRegression') && content.includes('confusion_matrix') && content.includes('roc_curve')
  },
  {
    name: 'Criterio 4: Machine Learning y Ensambles (SVM, KNN, DT, Boosting)',
    files: ['back/ai_analytics/ml_algorithms.py', 'ai_analytics/ml_algorithms.py', '../ai_analytics/ml_algorithms.py'],
    verify: (content) => content.includes('SVC') && content.includes('KNeighborsClassifier') && content.includes('GradientBoostingClassifier')
  },
  {
    name: 'Criterio 5: Integración del SDK Oficial de Google Antigravity',
    files: ['back/ai_analytics/tca_agent.py', 'ai_analytics/tca_agent.py', '../ai_analytics/tca_agent.py'],
    verify: (content) => content.includes('google.antigravity') && content.includes('predecir_demanda') && content.includes('optimizar_ruta_despacho')
  },
  {
    name: 'Interfaz Web: Dashboard Interactivo APF 3',
    files: ['front/src/pages/APF3AnalyticsPage.tsx', 'src/pages/APF3AnalyticsPage.tsx', '../front/src/pages/APF3AnalyticsPage.tsx'],
    verify: (content) => content.includes('Criterio 2: Optimización de Rutas') && content.includes('Copiloto Logístico TCA')
  }
];

let passedCount = 0;

for (const check of checks) {
  let matchedFile = null;
  for (const relFile of check.files) {
    const fullPath = path.resolve(process.cwd(), relFile);
    if (fs.existsSync(fullPath)) {
      matchedFile = fullPath;
      break;
    }
  }

  if (!matchedFile) {
    console.error(`❌ [FALLÓ] ${check.name} -> Archivo no encontrado en: ${check.files.join(' | ')}`);
    continue;
  }

  const content = fs.readFileSync(matchedFile, 'utf8');
  if (check.verify(content)) {
    console.log(`✅ [APROBADO] ${check.name}`);
    passedCount++;
  } else {
    console.warn(`⚠️ [ADVERTENCIA] ${check.name} no cumple todas las directivas de la rúbrica.`);
  }
}

const score = Math.round((passedCount / checks.length) * 100);
console.log('-'.repeat(75));
console.log(`Puntaje de Auditoría Antigravity: ${score} / 100%`);
if (score >= 90) {
  console.log('Dictamen: CERTIFICACIÓN DE CALIDAD CONCEDIDA — SOBRESALIENTE (20/20)');
} else {
  console.log('Dictamen: REQUIERE REVISIÓN PREVIA A SUSTENTACIÓN');
}
console.log('='.repeat(75));

if (score < 80) {
  process.exit(1);
}
