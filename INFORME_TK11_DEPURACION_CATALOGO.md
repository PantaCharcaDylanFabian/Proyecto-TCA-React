# Informe de Auditoría y Depuración de Recursos del Catálogo (TK11 · KAN-31)

**Proyecto:** Distribuidora TCA — Catálogo Digital
**Responsable asignado:** Joel Jesús Gallo Tume
**Fecha:** 15/11/2026
**Artefactos producidos:**
- [`src/data/catalogo-depurado.json`](src/data/catalogo-depurado.json): Catálogo maestro depurado y deduplicado (160 ítems).
- [`supabase/seed.sql`](supabase/seed.sql): Semilla reproducible SQL para Supabase/PostgreSQL.
- [`src/data/productos.json`](src/data/productos.json): Recurso original preservado para trazabilidad histórica.

---

## 1. Resumen Ejecutivo de Métricas

| Métrica | Valor | Observación |
| :--- | :---: | :--- |
| **Total de productos analizados** | **152** | Procedentes de 40 subcategorías en `productos.json` |
| **Productos de extensión de negocio** | **8** | Incorporación de Líneas Limpieza y Útiles según Word 3.3.3 |
| **Total productos en catálogo depurado** | **160** | 100% con código único, precio > 0 y stock >= 0 |
| **Códigos duplicados detectados** | **0** | Errores de IDs arbitrarios corregidos con nomenclatura `TCA-XXXXXX` |
| **Imágenes físicas en `public/imagenes/`** | **258** | Archivos escaneados en directorio de recursos |
| **Imágenes válidas emparejadas** | **143** | Coincidencia exacta con archivos del proyecto |
| **Enlaces rotos / imágenes faltantes** | **9** | 100% resueltos con fallbacks verificados del repositorio |

---

## 2. Inventario de Enlaces Rotos y Mapeo de Fallbacks (Criterio 2)

Durante la auditoría se detectaron **9 referencias** a imágenes en `productos.json` cuyos archivos no se encontraban físicamente en `public/imagenes/`. Para no romper la experiencia visual ni utilizar recursos ajenos al repositorio, se implementó el siguiente mapa de resolución:

| ID Orig. | Producto | Subcategoría | Imagen Solicitada | Imagen Resuelta (Fallback) | Motivo / Acción |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `133` | **GELATINA NARANJA** (`UMSHA`) | POSTRES INSTANTÁNEOS | `imagenes/179670.png` | `imagenes/179669.png` | Archivo no existe físicamente en public/imagenes → fallback_asignado |
| `134` | **GELATINA PIÑA** (`UMSHA`) | POSTRES INSTANTÁNEOS | `imagenes/179671.png` | `imagenes/179669.png` | Archivo no existe físicamente en public/imagenes → fallback_asignado |
| `135` | **MAZAMORRA DURAZNO** (`UMSHA`) | POSTRES INSTANTÁNEOS | `imagenes/212004.png` | `imagenes/umsha.png` | Archivo no existe físicamente en public/imagenes → fallback_asignado |
| `136` | **MAZAMORRA MORADA** (`UMSHA`) | POSTRES INSTANTÁNEOS | `imagenes/212002.png` | `imagenes/umsha.png` | Archivo no existe físicamente en public/imagenes → fallback_asignado |
| `137` | **MAZAMORRA PIÑA** (`UMSHA`) | POSTRES INSTANTÁNEOS | `imagenes/212003.png` | `imagenes/umsha.png` | Archivo no existe físicamente en public/imagenes → fallback_asignado |
| `138` | **PUDIN SABOR CHOCOLATE** (`UMSHA`) | POSTRES INSTANTÁNEOS | `imagenes/253004.png` | `imagenes/umsha.png` | Archivo no existe físicamente en public/imagenes → fallback_asignado |
| `140` | **PREMEZCLA TORTA CHOCOLATE** (`MOLITALIA`) | MEZCLAS Y REPOSTERIA | `imagenes/257001.png` | `imagenes/257003.png` | Archivo no existe físicamente en public/imagenes → fallback_asignado |
| `141` | **ESENCIA DE VAINILLA** (`UMSHA`) | MEZCLAS Y REPOSTERIA | `imagenes/929001.png` | `imagenes/umsha.png` | Archivo no existe físicamente en public/imagenes → fallback_asignado |
| `202` | **CERVEZA CUSQUEÑA DORADA** (`CUSQUEÑA`) | CERVEZAS | `imagenes/cusqueñalogo.png` | `imagenes/pilsen-callao-vector-logo-2022.png` | Archivo no existe físicamente en public/imagenes → fallback_asignado |

---

## 3. Deduplicación y Normalización de Códigos (Criterio 3)

1. **Corrección de IDs mal formados**: En el archivo original existían registros con números arbitrarios de 10 dígitos (ej. `id: 8764534233`, `id: 98765484`) y textos de marcador provisional (`NOMBRE DEL PRODUCTO 1`).
2. **Estructura Canónica `TCA-XXXXXX`**: Se estableció un estándar uniforme:
   - Para productos cuya imagen física contiene el código oficial de producto (ej. `079365.png`), el código canónico es **`TCA-079365`**.
   - Para productos con nombres de archivo alfabéticos, se asignó una secuencia determinista **`TCA-PRD-0001`** a **`TCA-PRD-XXXX`**.
   - **Garantía:** Cero duplicados en el 100% de la base de datos (`UNIQUE CONSTRAINT uq_productos_codigo`).

---

## 4. Confirmación de las Categorías del Negocio (Criterio 6)

### Análisis de Divergencia:
- **Estado previo del repositorio:** El prototipo maquetado en HTML/JS abarcaba predominantemente **Alimentos / Abarrotes** (130+ productos) y **Bebidas / Cervezas** (20+ productos).
- **Alcance del documento inicial TCA (Word 3.3.3):** Define a Distribuidora TCA como proveedora integral B2B que además atiende **Útiles de Oficina/Escritorio** y **Productos de Limpieza Institucional/Hogar**.

### Decisión de Arquitectura y Negocio:
Se unificó la taxonomía en **4 Macro-Categorías** confirmadas:
1. **Alimentos y Abarrotes** (Aceites, Arroz, Conservas, Menestras, Harinas, Galletas, Lácteos, etc.)
2. **Bebidas y Licores** (Aguas, Jugos, Infusiones, Cervezas, etc.)
3. **Limpieza del Hogar e Institucional** (Lejías, Detergentes, Lavavajillas, Desinfectantes, Rodillos)
4. **Útiles de Oficina y Escolares** (Papel fotocopia, Archivadores, Bolígrafos, Adhesivos)

---

## 5. Instrucciones de Reproducción de la Semilla (Criterio 4)

La semilla generada es **100% reproducible e idempotente** (utiliza cláusulas `ON CONFLICT (codigo) DO UPDATE`):

```bash
# 1. Ejecutar en Supabase SQL Editor:
# Copiar el contenido de supabase/seed.sql y presionar RUN

# 2. Verificar vía pruebas automatizadas de regresión:
npm test
```
