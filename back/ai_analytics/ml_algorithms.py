"""
Módulo de Algoritmos de Machine Learning y Ensambles (APF 3 - Criterio 4)
Problema: Clasificación Multiclase de Prioridad de Reposición en TCA
Categorías: 0 = Normal / Baja, 1 = Media, 2 = Crítica / Urgente

Algoritmos Evaluados:
1. Modelos Individuales:
   - SVM (Support Vector Machines con Kernel RBF y Linear)
   - KNN (k-Nearest Neighbors con k óptimo)
   - Árbol de Decisión (Decision Tree Classifier con control de profundidad)
2. Métodos de Ensamble:
   - Gradient Boosting Classifier (Boosting por gradiente)
   - AdaBoost Classifier (Boosting adaptativo)
   - Random Forest (Bagging de referencia comparativa)

Métricas Comparativas:
- Validación Cruzada 5-Fold (Media y Desviación Estándar)
- Exactitud (Accuracy)
- Precisión Ponderada (Weighted Precision)
- Exhaustividad Ponderada (Weighted Recall)
- F1-Score Ponderado (Weighted F1)
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import GradientBoostingClassifier, AdaBoostClassifier, RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, f1_score, precision_score, recall_score

from data_loader import load_tca_dataset

def train_and_evaluate_ml_suite(reports_dir=None):
    df = load_tca_dataset()
    
    # Features y Target Multiclase (prioridad_reposicion: 0=Baja, 1=Media, 2=Critica)
    features = ['precio', 'stock_actual', 'stock_minimo', 'lead_time_days', 
                'frecuencia_pedidos', 'demanda_semanal', 'dias_inventario']
    X = df[features]
    y = df['prioridad_reposicion']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )
    
    # 1. Definición de Modelos Individuales y Ensambles con Pipelines
    models = {
        'KNN (k=3)': Pipeline([
            ('scaler', StandardScaler()),
            ('clf', KNeighborsClassifier(n_neighbors=3, weights='distance'))
        ]),
        'KNN (k=5)': Pipeline([
            ('scaler', StandardScaler()),
            ('clf', KNeighborsClassifier(n_neighbors=5, weights='uniform'))
        ]),
        'SVM (Kernel RBF)': Pipeline([
            ('scaler', StandardScaler()),
            ('clf', SVC(kernel='rbf', C=1.0, gamma='scale', random_state=42))
        ]),
        'SVM (Kernel Lineal)': Pipeline([
            ('scaler', StandardScaler()),
            ('clf', SVC(kernel='linear', C=1.0, random_state=42))
        ]),
        'Árbol de Decisión (Max Depth=4)': Pipeline([
            ('clf', DecisionTreeClassifier(max_depth=4, criterion='gini', random_state=42))
        ]),
        'Árbol de Decisión (Sin Podar)': Pipeline([
            ('clf', DecisionTreeClassifier(max_depth=None, criterion='gini', random_state=42))
        ]),
        'AdaBoost (Ensamble)': Pipeline([
            ('clf', AdaBoostClassifier(n_estimators=50, learning_rate=1.0, random_state=42))
        ]),
        'Gradient Boosting (Ensamble)': Pipeline([
            ('clf', GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42))
        ]),
        'Random Forest (Ensamble Bagging)': Pipeline([
            ('clf', RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42))
        ])
    }
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    results = []
    trained_models = {}
    
    for name, pipeline in models.items():
        # Validación Cruzada 5-Fold en entrenamiento
        cv_scores = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring='f1_weighted')
        
        # Ajuste y prueba final en test set independiente
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        
        is_ensemble = 'Ensamble' in name
        
        results.append({
            'Modelo': name,
            'Tipo': 'Ensamble (Boosting/Bagging)' if is_ensemble else 'Modelo Individual',
            'CV_F1_Mean': cv_scores.mean(),
            'CV_F1_Std': cv_scores.std(),
            'Test_Accuracy': acc,
            'Test_Precision': prec,
            'Test_Recall': rec,
            'Test_F1': f1
        })
        trained_models[name] = pipeline
        
    df_results = pd.DataFrame(results)
    
    # 2. Generación de Gráficos y Reportes
    reports_dir = reports_dir or os.path.join(os.path.dirname(__file__), 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    
    # Gráfico 1: Comparación de F1-Score (Ensambles vs Modelos Individuales)
    plt.figure(figsize=(12, 6))
    colors = ['#16a34a' if 'Ensamble' in m else '#2563eb' for m in df_results['Modelo']]
    bars = plt.barh(df_results['Modelo'], df_results['Test_F1'] * 100, color=colors, alpha=0.85)
    
    plt.xlabel('F1-Score Ponderado en Test Set (%)', fontsize=12)
    plt.title('Comparativa Rigurosa: Ensambles vs Modelos Individuales (TCA APF 3)', fontsize=14, fontweight='bold')
    plt.xlim(70, 105)
    plt.grid(axis='x', linestyle=':', alpha=0.6)
    
    # Etiquetas en las barras
    for bar in bars:
        width = bar.get_width()
        plt.text(width + 0.5, bar.get_y() + bar.get_height()/2, f"{width:.1f}%", 
                 va='center', ha='left', fontsize=10, weight='bold')
                 
    # Leyenda personalizada
    from matplotlib.patches import Patch
    legend_elements = [
        Patch(facecolor='#16a34a', label='Métodos de Ensamble (Boosting / Random Forest)'),
        Patch(facecolor='#2563eb', label='Modelos Individuales (SVM, KNN, Decision Tree)')
    ]
    plt.legend(handles=legend_elements, loc='lower right', fontsize=11)
    plt.tight_layout()
    plt.savefig(os.path.join(reports_dir, 'ml_models_benchmark.png'), dpi=200)
    plt.close()
    
    # Gráfico 2: Importancia de Características (Feature Importance) según Gradient Boosting
    gb_model = trained_models['Gradient Boosting (Ensamble)'].named_steps['clf']
    importances = gb_model.feature_importances_
    sorted_idx = np.argsort(importances)
    
    plt.figure(figsize=(9, 5))
    plt.barh(np.array(features)[sorted_idx], importances[sorted_idx] * 100, color='#8b5cf6', alpha=0.85)
    plt.xlabel('Importancia Relativa (%)', fontsize=12)
    plt.title('Importancia de Variables en la Decisión de Reposición (Gradient Boosting)', fontsize=13, fontweight='bold')
    plt.grid(axis='x', linestyle=':', alpha=0.6)
    plt.tight_layout()
    plt.savefig(os.path.join(reports_dir, 'feature_importance.png'), dpi=200)
    plt.close()
    
    return df_results, trained_models

if __name__ == '__main__':
    df_res, _ = train_and_evaluate_ml_suite()
    print("=== BENCHMARK DE MODELOS DE MACHINE LEARNING TCA (APF 3 - CRITERIO 4) ===")
    print(df_results_str := df_res[['Modelo', 'Tipo', 'CV_F1_Mean', 'Test_Accuracy', 'Test_F1']].to_string(index=False))
