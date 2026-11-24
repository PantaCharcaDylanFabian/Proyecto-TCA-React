"""
Módulo de Modelos de Regresión (APF 3 - Criterio 3)
Problema: Proyección de Demanda de Reposición Quincenal en Distribuidora TCA

Modelos Evaluados:
1. Regresión Lineal Múltiple (OLS)
2. Regresión Polinomial Grado 2 (No Lineal)
3. Regresión Polinomial Grado 3 con Regularización Ridge (Hiperparámetro alpha)

Métricas de Evaluación:
- R^2 (Coeficiente de Determinación)
- MSE (Mean Squared Error)
- RMSE (Root Mean Squared Error)
- MAE (Mean Absolute Error)
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

from data_loader import load_tca_dataset

def train_and_evaluate_regression(reports_dir=None):
    df = load_tca_dataset()
    
    # Variables predictoras (X) y objetivo (y)
    # X: precio, stock_actual, stock_minimo, frecuencia_pedidos, demanda_semanal
    features = ['precio', 'stock_actual', 'stock_minimo', 'frecuencia_pedidos', 'demanda_semanal']
    X = df[features]
    y = df['demanda_proyectada']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
    
    results = {}
    
    # 1. Regresión Lineal Múltiple
    lin_reg = Pipeline([
        ('scaler', StandardScaler()),
        ('model', LinearRegression())
    ])
    lin_reg.fit(X_train, y_train)
    y_pred_lin = lin_reg.predict(X_test)
    
    results['Regresion_Lineal'] = {
        'model': lin_reg,
        'r2': r2_score(y_test, y_pred_lin),
        'mse': mean_squared_error(y_test, y_pred_lin),
        'rmse': np.sqrt(mean_squared_error(y_test, y_pred_lin)),
        'mae': mean_absolute_error(y_test, y_pred_lin),
        'y_pred': y_pred_lin
    }
    
    # 2. Regresión Polinomial Grado 2 (No Lineal)
    poly2_reg = Pipeline([
        ('poly', PolynomialFeatures(degree=2, include_bias=False)),
        ('scaler', StandardScaler()),
        ('model', LinearRegression())
    ])
    poly2_reg.fit(X_train, y_train)
    y_pred_poly2 = poly2_reg.predict(X_test)
    
    results['Regresion_Polinomial_Grado2'] = {
        'model': poly2_reg,
        'r2': r2_score(y_test, y_pred_poly2),
        'mse': mean_squared_error(y_test, y_pred_poly2),
        'rmse': np.sqrt(mean_squared_error(y_test, y_pred_poly2)),
        'mae': mean_absolute_error(y_test, y_pred_poly2),
        'y_pred': y_pred_poly2
    }
    
    # 3. Regresión Polinomial Grado 3 con Regularización Ridge (alpha=10.0)
    poly3_ridge = Pipeline([
        ('poly', PolynomialFeatures(degree=3, include_bias=False)),
        ('scaler', StandardScaler()),
        ('model', Ridge(alpha=10.0))
    ])
    poly3_ridge.fit(X_train, y_train)
    y_pred_poly3 = poly3_ridge.predict(X_test)
    
    results['Regresion_Polinomial_Grado3_Ridge'] = {
        'model': poly3_ridge,
        'r2': r2_score(y_test, y_pred_poly3),
        'mse': mean_squared_error(y_test, y_pred_poly3),
        'rmse': np.sqrt(mean_squared_error(y_test, y_pred_poly3)),
        'mae': mean_absolute_error(y_test, y_pred_poly3),
        'y_pred': y_pred_poly3
    }
    
    # Generar gráfico de comparación de predicción
    reports_dir = reports_dir or os.path.join(os.path.dirname(__file__), 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    
    plt.figure(figsize=(10, 6))
    plt.scatter(y_test, y_pred_lin, color='#2563eb', alpha=0.7, label=f"Lineal (R²={results['Regresion_Lineal']['r2']:.3f})")
    plt.scatter(y_test, y_pred_poly2, color='#16a34a', alpha=0.7, label=f"Polinomial G2 (R²={results['Regresion_Polinomial_Grado2']['r2']:.3f})")
    plt.scatter(y_test, y_pred_poly3, color='#dc2626', alpha=0.7, label=f"Polinomial G3 Ridge (R²={results['Regresion_Polinomial_Grado3_Ridge']['r2']:.3f})")
    
    # Línea ideal y = x
    min_val = min(y_test.min(), min(y_pred_lin.min(), y_pred_poly2.min()))
    max_val = max(y_test.max(), max(y_pred_lin.max(), y_pred_poly2.max()))
    plt.plot([min_val, max_val], [min_val, max_val], 'k--', lw=2, label='Predicción Perfecta (y = x)')
    
    plt.xlabel('Demanda Real (Unidades)', fontsize=12)
    plt.ylabel('Demanda Predicha por el Modelo (Unidades)', fontsize=12)
    plt.title('Distribuidora TCA: Ajuste y Desempeño de Modelos de Regresión', fontsize=14, fontweight='bold')
    plt.legend(loc='upper left')
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.tight_layout()
    plt.savefig(os.path.join(reports_dir, 'regression_comparison.png'), dpi=200)
    plt.close()
    
    return results, X_test, y_test

if __name__ == '__main__':
    res, _, _ = train_and_evaluate_regression()
    print("=== EVALUACIÓN COMPARATIVA DE MODELOS DE REGRESIÓN TCA ===")
    print(f"{'Modelo':<35} | {'R²':<8} | {'MSE':<10} | {'RMSE':<10} | {'MAE':<10}")
    print("-" * 80)
    for name, m in res.items():
        print(f"{name:<35} | {m['r2']:<8.4f} | {m['mse']:<10.4f} | {m['rmse']:<10.4f} | {m['mae']:<10.4f}")
