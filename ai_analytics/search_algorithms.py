"""
Módulo de Fundamentos de IA y Algoritmos de Búsqueda (APF 3 - Criterio 2)
Problema: Optimización de Rutas de Despacho Logístico para Distribuidora TCA (Región Piura)

Modelado Formal del Espacio de Estados:
- S: Conjunto de estados (Nodos de distribución/distritos)
- s_0: Estado inicial (Almacén Central TCA en Castilla, Piura)
- G: Estado objetivo (Punto de entrega en minimarket/bodega destino)
- A: Acciones disponibles (Moverse hacia un nodo vecino conectado en la red vial)
- Costo c(s, a, s'): Distancia vial en kilómetros entre nodos
- Heurística h(n): Distancia euclidiana en línea recta al nodo objetivo (Admisible: h(n) <= c*(n))
"""

import heapq
import time
from collections import deque
import numpy as np

# Coordenadas relativas en km (proyección local 2D centrada en Piura)
COORDINATES = {
    'ALMACEN_CENTRAL_CASTILLA': (0.0, 0.0),
    'PIURA_CENTRO': (2.1, 1.2),
    'URB_SANTA_ISABEL': (3.5, 3.0),
    'VEINTISEIS_DE_OCTUBRE': (4.8, 0.5),
    'CATACAOS': (1.0, -11.5),
    'LA_UNION': (3.2, -24.0),
    'SECHURA': (8.5, -45.0),
    'SULLANA_CENTRO': (-15.0, 32.0),
    'BELLAVISTA_SULLANA': (-14.0, 34.5),
    'TAMBOGRANDE': (18.0, 35.0),
    'PAITA_PUERTO': (-42.0, 18.0)
}

# Red de conexiones viales ponderadas por distancia real en carretera (km)
ROAD_NETWORK = {
    'ALMACEN_CENTRAL_CASTILLA': [
        ('PIURA_CENTRO', 2.8),
        ('URB_SANTA_ISABEL', 4.5),
        ('CATACAOS', 12.0),
        ('TAMBOGRANDE', 42.0)
    ],
    'PIURA_CENTRO': [
        ('ALMACEN_CENTRAL_CASTILLA', 2.8),
        ('URB_SANTA_ISABEL', 2.5),
        ('VEINTISEIS_DE_OCTUBRE', 3.8),
        ('CATACAOS', 11.2)
    ],
    'URB_SANTA_ISABEL': [
        ('PIURA_CENTRO', 2.5),
        ('ALMACEN_CENTRAL_CASTILLA', 4.5),
        ('VEINTISEIS_DE_OCTUBRE', 3.2),
        ('SULLANA_CENTRO', 36.0)
    ],
    'VEINTISEIS_DE_OCTUBRE': [
        ('PIURA_CENTRO', 3.8),
        ('URB_SANTA_ISABEL', 3.2),
        ('PAITA_PUERTO', 52.0),
        ('SULLANA_CENTRO', 37.5)
    ],
    'CATACAOS': [
        ('ALMACEN_CENTRAL_CASTILLA', 12.0),
        ('PIURA_CENTRO', 11.2),
        ('LA_UNION', 16.5)
    ],
    'LA_UNION': [
        ('CATACAOS', 16.5),
        ('SECHURA', 22.0)
    ],
    'SECHURA': [
        ('LA_UNION', 22.0)
    ],
    'SULLANA_CENTRO': [
        ('URB_SANTA_ISABEL', 36.0),
        ('VEINTISEIS_DE_OCTUBRE', 37.5),
        ('BELLAVISTA_SULLANA', 3.2),
        ('TAMBOGRANDE', 39.0),
        ('PAITA_PUERTO', 58.0)
    ],
    'BELLAVISTA_SULLANA': [
        ('SULLANA_CENTRO', 3.2),
        ('TAMBOGRANDE', 41.0)
    ],
    'TAMBOGRANDE': [
        ('ALMACEN_CENTRAL_CASTILLA', 42.0),
        ('SULLANA_CENTRO', 39.0),
        ('BELLAVISTA_SULLANA', 41.0)
    ],
    'PAITA_PUERTO': [
        ('VEINTISEIS_DE_OCTUBRE', 52.0),
        ('SULLANA_CENTRO', 58.0)
    ]
}

def euclidean_heuristic(node_a, node_b):
    """
    Función Heurística h(n): Distancia euclidiana en línea recta.
    Propiedad: Admisible (nunca sobrestima la distancia vial real) y consistente.
    """
    pos_a = COORDINATES[node_a]
    pos_b = COORDINATES[node_b]
    return np.sqrt((pos_a[0] - pos_b[0])**2 + (pos_a[1] - pos_b[1])**2)

# ==============================================================================
# 1. ALGORITMO NO INFORMADO: BFS (Breadth-First Search)
# ==============================================================================
def bfs_search(start, goal):
    """Búsqueda en Anchura: Explora nivel por nivel (cola FIFO)."""
    t0 = time.perf_counter()
    queue = deque([(start, [start], 0.0)])
    visited = set()
    nodes_expanded = 0
    
    while queue:
        current, path, cost = queue.popleft()
        nodes_expanded += 1
        
        if current == goal:
            elapsed = (time.perf_counter() - t0) * 1000
            return {
                'algorithm': 'BFS (Anchura)',
                'path': path,
                'cost': cost,
                'nodes_expanded': nodes_expanded,
                'time_ms': round(elapsed, 4),
                'optimal': False # BFS optimiza número de aristas, no costo ponderado
            }
            
        if current not in visited:
            visited.add(current)
            for neighbor, weight in ROAD_NETWORK.get(current, []):
                if neighbor not in visited:
                    queue.append((neighbor, path + [neighbor], cost + weight))
                    
    return None

# ==============================================================================
# 2. ALGORITMO NO INFORMADO: DFS (Depth-First Search)
# ==============================================================================
def dfs_search(start, goal):
    """Búsqueda en Profundidad: Explora ramas completas (pila LIFO)."""
    t0 = time.perf_counter()
    stack = [(start, [start], 0.0)]
    visited = set()
    nodes_expanded = 0
    
    while stack:
        current, path, cost = stack.pop()
        nodes_expanded += 1
        
        if current == goal:
            elapsed = (time.perf_counter() - t0) * 1000
            return {
                'algorithm': 'DFS (Profundidad)',
                'path': path,
                'cost': cost,
                'nodes_expanded': nodes_expanded,
                'time_ms': round(elapsed, 4),
                'optimal': False
            }
            
        if current not in visited:
            visited.add(current)
            for neighbor, weight in reversed(ROAD_NETWORK.get(current, [])):
                if neighbor not in visited:
                    stack.append((neighbor, path + [neighbor], cost + weight))
                    
    return None

# ==============================================================================
# 3. ALGORITMO INFORMADO: A* (A-Star)
# ==============================================================================
def a_star_search(start, goal):
    """
    Búsqueda A*: Evalúa f(n) = g(n) + h(n)
    Garantiza encontrar la ruta óptima de mínimo costo si h(n) es admisible.
    """
    t0 = time.perf_counter()
    frontier = []
    # (f_cost, g_cost, current_node, path)
    h_start = euclidean_heuristic(start, goal)
    heapq.heappush(frontier, (h_start, 0.0, start, [start]))
    
    best_g = {start: 0.0}
    nodes_expanded = 0
    
    while frontier:
        f_cost, g_cost, current, path = heapq.heappop(frontier)
        nodes_expanded += 1
        
        if current == goal:
            elapsed = (time.perf_counter() - t0) * 1000
            return {
                'algorithm': 'A* (A-Star)',
                'path': path,
                'cost': round(g_cost, 2),
                'nodes_expanded': nodes_expanded,
                'time_ms': round(elapsed, 4),
                'optimal': True
            }
            
        if g_cost > best_g.get(current, float('inf')):
            continue
            
        for neighbor, weight in ROAD_NETWORK.get(current, []):
            new_g = g_cost + weight
            if new_g < best_g.get(neighbor, float('inf')):
                best_g[neighbor] = new_g
                h_val = euclidean_heuristic(neighbor, goal)
                new_f = new_g + h_val
                heapq.heappush(frontier, (new_f, new_g, neighbor, path + [neighbor]))
                
    return None

# ==============================================================================
# 4. ALGORITMO INFORMADO: Hill Climbing (Ascenso de Colina)
# ==============================================================================
def hill_climbing_search(start, goal):
    """
    Hill Climbing: Búsqueda local voraz (Greedy Local Search).
    En cada paso selecciona el vecino con menor valor heurístico h(n).
    Puede estancarse en mínimos locales o ciclos.
    """
    t0 = time.perf_counter()
    current = start
    path = [current]
    cost = 0.0
    nodes_expanded = 0
    visited = set([current])
    
    while current != goal:
        nodes_expanded += 1
        neighbors = ROAD_NETWORK.get(current, [])
        unvisited_neighbors = [(n, w) for n, w in neighbors if n not in visited]
        
        if not unvisited_neighbors:
            # Estancamiento / Mínimo local sin salida
            break
            
        # Elegir vecino que minimice h(n)
        best_neighbor, best_weight = min(
            unvisited_neighbors, 
            key=lambda item: euclidean_heuristic(item[0], goal)
        )
        
        # Verificar si hay mejora heurística o estancamiento
        if euclidean_heuristic(best_neighbor, goal) >= euclidean_heuristic(current, goal):
            # Aceptamos avance si es el mejor camino disponible no visitado
            pass
            
        visited.add(best_neighbor)
        path.append(best_neighbor)
        cost += best_weight
        current = best_neighbor
        
    elapsed = (time.perf_counter() - t0) * 1000
    reached = (current == goal)
    return {
        'algorithm': 'Hill Climbing (Voraz)',
        'path': path if reached else path + ['[ESTANCAMIENTO]'],
        'cost': round(cost, 2) if reached else float('inf'),
        'nodes_expanded': nodes_expanded,
        'time_ms': round(elapsed, 4),
        'optimal': False,
        'success': reached
    }

def benchmark_search_algorithms(start='ALMACEN_CENTRAL_CASTILLA', goal='BELLAVISTA_SULLANA'):
    """Ejecuta y compara todos los algoritmos en una misma ruta objetivo."""
    res_bfs = bfs_search(start, goal)
    res_dfs = dfs_search(start, goal)
    res_astar = a_star_search(start, goal)
    res_hc = hill_climbing_search(start, goal)
    return [res_bfs, res_dfs, res_astar, res_hc]

if __name__ == '__main__':
    results = benchmark_search_algorithms()
    print("=== COMPARATIVA DE ALGORITMOS DE BÚSQUEDA TCA (APF 3 - CRITERIO 2) ===")
    print(f"{'Algoritmo':<22} | {'Costo (km)':<10} | {'Nodos Exp.':<10} | {'Tiempo (ms)':<10} | {'Óptimo':<8}")
    print("-" * 72)
    for r in results:
        print(f"{r['algorithm']:<22} | {str(r['cost']):<10} | {r['nodes_expanded']:<10} | {r['time_ms']:<10} | {str(r.get('optimal', False)):<8}")
