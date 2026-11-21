"""
Script Principal de Ejecución y Consolidación de Métricas APF 3
Curso: Innovación y Transformación Digital - UTP
Proyecto: Distribuidora TCA
"""

import sys
import os
import pandas as pd

from search_algorithms import benchmark_search_algorithms
from regression_models import train_and_evaluate_regression
from classification_models import train_and_evaluate_logistic
from ml_algorithms import train_and_evaluate_ml_suite

def run_full_benchmark():
    print("=" * 80)
    print("      CONSOLIDADO GENERAL DE RESULTADOS - APF 3: IA Y MACHINE LEARNING")
    print("=" * 80)
    
    # 1. Búsqueda
    print("\n[CRITERIO 2] FUNDAMENTOS DE IA Y BÚSQUEDA (Rutas de Despacho Piura):")
    search_res = benchmark_search_algorithms()
    df_search = pd.DataFrame(search_res)[['algorithm', 'cost', 'nodes_expanded', 'time_ms', 'optimal']]
    df_search.columns = ['Algoritmo', 'Distancia (km)', 'Nodos Exp.', 'Tiempo (ms)', 'Óptimo']
    print(df_search.to_string(index=False))
    
    # 2. Regresión
    print("\n[CRITERIO 3.1] MODELOS DE REGRESIÓN (Predicción de Demanda Quincenal):")
    reg_res, _, _ = train_and_evaluate_regression()
    reg_rows = []
    for k, v in reg_res.items():
        reg_rows.append({
            'Modelo': k,
            'R²': round(v['r2'], 4),
            'MSE': round(v['mse'], 4),
            'RMSE': round(v['rmse'], 4),
            'MAE': round(v['mae'], 4)
        })
    print(pd.DataFrame(reg_rows).to_string(index=False))
    
    # 3. Clasificación Logística
    print("\n[CRITERIO 3.2] REGRESIÓN LOGÍSTICA (Detección de Riesgo de Quiebre de Stock):")
    log_res = train_and_evaluate_logistic()
    print(f" -> Mejor Hiperparámetro C: {log_res['best_c']}")
    print(f" -> Accuracy: {log_res['accuracy']*100:.2f}% | Precision: {log_res['precision']*100:.2f}% | Recall: {log_res['recall']*100:.2f}% | F1: {log_res['f1']*100:.2f}% | AUC: {log_res['auc']:.4f}")
    
    # 4. Machine Learning & Ensambles
    print("\n[CRITERIO 4] MACHINE LEARNING: MODELOS INDIVIDUALES VS ENSAMBLES (Reposición):")
    df_ml, _ = train_and_evaluate_ml_suite()
    print(df_ml[['Modelo', 'Tipo', 'CV_F1_Mean', 'Test_Accuracy', 'Test_F1']].to_string(index=False))
    
    print("\n" + "=" * 80)
    print("   TODOS LOS MODELOS Y GRÁFICOS HAN SIDO GENERADOS EN ai_analytics/reports/")
    print("=" * 80)

if __name__ == '__main__':
    run_full_benchmark()
