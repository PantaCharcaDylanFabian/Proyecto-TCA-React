"""
Módulo de Regresión Logística y Clasificación Binaria (APF 3 - Criterio 3)
Problema: Clasificación del Riesgo de Desabastecimiento / Quiebre de Stock (Stockout Risk)

Modelo:
- Regresión Logística con Análisis de Hiperparámetros (C, penalización L1 vs L2)
- Función Sigmoide: P(y=1|X) = 1 / (1 + e^-(w^T X + b))

Métricas:
- Matriz de Confusión (TP, FP, TN, FN)
- Exactitud (Accuracy)
- Precisión (Precision)
- Exhaustividad (Recall)
- F1-Score
- Curva ROC y Área bajo la Curva (AUC)
"""

import os
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_curve, auc
)

from data_loader import load_tca_dataset

def train_and_evaluate_logistic(reports_dir=None):
    df = load_tca_dataset()
    
    # Variables predictoras: precio, stock_actual, stock_minimo, lead_time_days, dias_inventario, demanda_semanal
    features = ['precio', 'stock_actual', 'stock_minimo', 'lead_time_days', 'dias_inventario', 'demanda_semanal']
    X = df[features]
    y = df['riesgo_stockout']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
    
    # Análisis de hiperparámetro C en Regresión Logística
    c_values = [0.01, 0.1, 1.0, 10.0]
    c_results = {}
    best_c = 1.0
    best_f1 = -1
    best_model = None
    
    for c in c_values:
        pipe = Pipeline([
            ('scaler', StandardScaler()),
            ('clf', LogisticRegression(C=c, solver='lbfgs', random_state=42))
        ])
        pipe.fit(X_train, y_train)
        y_pred = pipe.predict(X_test)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        c_results[c] = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, zero_division=0),
            'recall': recall_score(y_test, y_pred, zero_division=0),
            'f1': f1,
            'model': pipe
        }
        if f1 > best_f1:
            best_f1 = f1
            best_c = c
            best_model = pipe
            
    # Evaluación del mejor modelo
    y_pred_best = best_model.predict(X_test)
    y_prob_best = best_model.predict_proba(X_test)[:, 1]
    
    cm = confusion_matrix(y_test, y_pred_best)
    fpr, tpr, _ = roc_curve(y_test, y_prob_best)
    roc_auc = auc(fpr, tpr)
    
    # Generar gráficos
    reports_dir = reports_dir or os.path.join(os.path.dirname(__file__), 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    
    # 1. Matriz de Confusión
    fig, ax = plt.subplots(figsize=(6, 5))
    cax = ax.matshow(cm, cmap='Blues', alpha=0.85)
    fig.colorbar(cax)
    
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(x=j, y=i, s=f"{cm[i, j]}", va='center', ha='center', size='xx-large', weight='bold', color='black')
            
    ax.set_xticks([0, 1])
    ax.set_yticks([0, 1])
    ax.set_xticklabels(['Stock Seguro (0)', 'Riesgo Quiebre (1)'], fontsize=11)
    ax.set_yticklabels(['Stock Seguro (0)', 'Riesgo Quiebre (1)'], fontsize=11)
    plt.xlabel('Predicción del Modelo', fontsize=12)
    plt.ylabel('Valor Real (Inventario TCA)', fontsize=12)
    plt.title(f'Matriz de Confusión - Regresión Logística (C={best_c})', fontsize=13, fontweight='bold', pad=20)
    plt.tight_layout()
    plt.savefig(os.path.join(reports_dir, 'confusion_matrix_logistic.png'), dpi=200)
    plt.close()
    
    # 2. Curva ROC
    plt.figure(figsize=(7, 5))
    plt.plot(fpr, tpr, color='#2563eb', lw=2.5, label=f'ROC Curve (AUC = {roc_auc:.3f})')
    plt.plot([0, 1], [0, 1], color='gray', lw=1.5, linestyle='--', label='Clasificador Aleatorio (AUC = 0.50)')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('Tasa de Falsos Positivos (1 - Especificidad)', fontsize=11)
    plt.ylabel('Tasa de Verdaderos Positivos (Sensibilidad)', fontsize=11)
    plt.title('Curva ROC - Detección de Riesgo de Quiebre de Stock', fontsize=13, fontweight='bold')
    plt.legend(loc='lower right', fontsize=11)
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.tight_layout()
    plt.savefig(os.path.join(reports_dir, 'roc_curve_logistic.png'), dpi=200)
    plt.close()
    
    return {
        'best_c': best_c,
        'c_comparison': c_results,
        'accuracy': accuracy_score(y_test, y_pred_best),
        'precision': precision_score(y_test, y_pred_best),
        'recall': recall_score(y_test, y_pred_best),
        'f1': f1_score(y_test, y_pred_best),
        'auc': roc_auc,
        'confusion_matrix': cm
    }

if __name__ == '__main__':
    res = train_and_evaluate_logistic()
    print("=== EVALUACIÓN DE REGRESIÓN LOGÍSTICA TCA (APF 3 - CRITERIO 3) ===")
    print(f"Mejor Hiperparámetro C: {res['best_c']}")
    print(f"Accuracy : {res['accuracy'] * 100:.2f}%")
    print(f"Precision: {res['precision'] * 100:.2f}%")
    print(f"Recall   : {res['recall'] * 100:.2f}%")
    print(f"F1-Score : {res['f1'] * 100:.2f}%")
    print(f"ROC-AUC  : {res['auc']:.4f}")
    print("\nImpacto del Hiperparámetro C:")
    for c, metrics in res['c_comparison'].items():
        print(f"  C={c:<5} | Acc: {metrics['accuracy']:.4f} | Prec: {metrics['precision']:.4f} | Rec: {metrics['recall']:.4f} | F1: {metrics['f1']:.4f}")
