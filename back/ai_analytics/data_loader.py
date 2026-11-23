import json
import os
import numpy as np
import pandas as pd

def load_tca_dataset(seed=42):
    """
    Carga el catálogo maestro depurado de TCA (160 productos) y construye
    un dataset operativo enriquecido con variables cuantitativas y operativas
    para tareas de Regresión, Clasificación y Modelos de ML.
    """
    np.random.seed(seed)
    
    json_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'catalogo-depurado.json')
    if not os.path.exists(json_path):
        json_path = os.path.join(os.path.dirname(__file__), 'catalogo-depurado.json')
        
    with open(json_path, 'r', encoding='utf-8') as f:
        catalog = json.load(f)
        
    records = []
    
    # Mapeo de categorías a ponderaciones de rotación comercial
    category_velocity = {
        'ACEITES': 1.8,
        'ARROZ': 2.0,
        'CONSERVAS': 1.5,
        'GALLETAS': 1.6,
        'FIDEOS': 1.7,
        'BEBIDAS': 1.9,
        'CERVEZAS': 1.7,
        'CONFITERIA': 1.3,
        'LIMPIEZA': 1.2,
        'UTILES': 0.9,
        'OTROS': 1.0
    }
    
    for idx, item in enumerate(catalog):
        codigo = item.get('codigo', f'TCA-{idx:04d}')
        nombre = item.get('nombre', 'PRODUCTO SIN NOMBRE')
        categoria = item.get('categoria', 'OTROS').upper()
        precio = float(item.get('precio', 10.0))
        stock_actual = int(item.get('stock_actual', item.get('stock', 25)))
        stock_minimo = int(item.get('stock_minimo', 5))
        stock_objetivo = int(item.get('stock_objetivo', max(30, stock_minimo * 3)))
        
        # Encontrar factor de rotación de categoría
        cat_key = next((k for k in category_velocity if k in categoria), 'OTROS')
        velocity = category_velocity[cat_key]
        
        # Generar variables operativas realistas para distribuidora
        lead_time_days = np.random.choice([2, 3, 5, 7, 10], p=[0.25, 0.35, 0.20, 0.15, 0.05])
        frecuencia_pedidos_semana = max(1, int(np.random.poisson(lam=velocity * 3.5)))
        promedio_unidades_por_pedido = max(2, int(np.random.exponential(scale=12.0 / (precio ** 0.3))))
        
        # Demanda semanal real
        demanda_semanal = int(frecuencia_pedidos_semana * promedio_unidades_por_pedido * np.random.uniform(0.85, 1.15))
        
        # Demanda diaria estimada
        demanda_diaria = demanda_semanal / 7.0
        dias_inventario = stock_actual / (demanda_diaria + 0.01)
        
        # Variable Objetivo 1: Regresión -> Demanda proyectada próximo ciclo (quincenal)
        demanda_proyectada = float(np.round(demanda_semanal * 2.14 + (stock_objetivo - stock_actual) * 0.2 + np.random.normal(0, 3.5), 2))
        demanda_proyectada = max(1.0, demanda_proyectada)
        
        # Variable Objetivo 2: Clasificación Binaria -> Riesgo de Desabastecimiento (Stockout Risk)
        # 1 = Riesgo Alto (stock cubre menos días que el lead time o stock_actual <= stock_minimo)
        riesgo_stockout = 1 if (dias_inventario <= lead_time_days * 1.3 or stock_actual <= stock_minimo) else 0
        
        # Variable Objetivo 3: Clasificación Multiclase -> Prioridad de Reposición (0: Normal, 1: Media, 2: Crítica)
        if stock_actual <= stock_minimo or dias_inventario <= lead_time_days:
            prioridad = 2 # Crítica
        elif dias_inventario <= lead_time_days * 2.5:
            prioridad = 1 # Media
        else:
            prioridad = 0 # Normal/Baja
            
        records.append({
            'codigo': codigo,
            'nombre': nombre,
            'categoria': categoria,
            'precio': precio,
            'stock_actual': stock_actual,
            'stock_minimo': stock_minimo,
            'stock_objetivo': stock_objetivo,
            'lead_time_days': lead_time_days,
            'frecuencia_pedidos': frecuencia_pedidos_semana,
            'unidades_promedio_pedido': promedio_unidades_por_pedido,
            'demanda_semanal': demanda_semanal,
            'dias_inventario': np.round(dias_inventario, 2),
            'demanda_proyectada': demanda_proyectada,
            'riesgo_stockout': riesgo_stockout,
            'prioridad_reposicion': prioridad
        })
        
    df = pd.DataFrame(records)
    return df

if __name__ == '__main__':
    df = load_tca_dataset()
    print("Dataset TCA cargado exitosamente.")
    print(f"Dimensiones: {df.shape[0]} filas, {df.shape[1]} columnas")
    print(df[['codigo', 'nombre', 'precio', 'stock_actual', 'demanda_proyectada', 'riesgo_stockout']].head())
