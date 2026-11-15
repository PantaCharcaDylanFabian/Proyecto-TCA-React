-- ============================================================
-- HU11: Gestionar productos y migrar un catálogo de prueba válido
-- Ticket: KAN-26
-- Migración 001: Esquema de productos, restricciones y políticas RLS
-- ============================================================

-- 1. Tabla de productos con restricciones de unicidad y rangos válidos
CREATE TABLE IF NOT EXISTS public.productos (
    id              BIGSERIAL PRIMARY KEY,
    codigo          TEXT NOT NULL,
    nombre          TEXT NOT NULL,
    categoria       TEXT NOT NULL,
    precio          NUMERIC(10,2) NOT NULL,
    stock_minimo    INTEGER NOT NULL DEFAULT 0,
    stock_actual    INTEGER NOT NULL DEFAULT 0,
    imagen          TEXT,
    marca           TEXT,
    activo          BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Restricciones de aceptación (Criterios HU11):
    CONSTRAINT uq_productos_codigo UNIQUE (codigo),
    CONSTRAINT chk_productos_codigo_valido CHECK (TRIM(codigo) <> ''),
    CONSTRAINT chk_productos_nombre_valido CHECK (TRIM(nombre) <> ''),
    CONSTRAINT chk_productos_categoria_valida CHECK (TRIM(categoria) <> ''),
    CONSTRAINT chk_productos_precio_positivo CHECK (precio > 0),
    CONSTRAINT chk_productos_stock_minimo_positivo CHECK (stock_minimo >= 0),
    CONSTRAINT chk_productos_stock_actual_positivo CHECK (stock_actual >= 0)
);

-- 2. Trigger para mantener updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_productos_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_productos_updated_at ON public.productos;
CREATE TRIGGER trg_productos_updated_at
    BEFORE UPDATE ON public.productos
    FOR EACH ROW EXECUTE FUNCTION public.set_productos_updated_at();

-- 3. Índices para acelerar búsquedas por código y categoría
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON public.productos (codigo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos (categoria);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON public.productos (nombre);

-- 4. Configuración de Row-Level Security (RLS) para Supabase
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- Política 1: Lectura permitida para clientes anónimos y autenticados (catálogo público y panel)
DROP POLICY IF EXISTS "productos_select_public" ON public.productos;
CREATE POLICY "productos_select_public"
    ON public.productos FOR SELECT
    TO anon, authenticated
    USING (true);

-- Política 2: Inserción de productos válidos (Criterio HU11: rechazar códigos y datos inválidos)
DROP POLICY IF EXISTS "productos_insert_policy" ON public.productos;
CREATE POLICY "productos_insert_policy"
    ON public.productos FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        TRIM(codigo) <> '' AND
        TRIM(nombre) <> '' AND
        TRIM(categoria) <> '' AND
        precio > 0 AND
        stock_minimo >= 0 AND
        stock_actual >= 0
    );

-- Política 3: Actualización de productos
DROP POLICY IF EXISTS "productos_update_policy" ON public.productos;
CREATE POLICY "productos_update_policy"
    ON public.productos FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (
        TRIM(codigo) <> '' AND
        TRIM(nombre) <> '' AND
        TRIM(categoria) <> '' AND
        precio > 0 AND
        stock_minimo >= 0 AND
        stock_actual >= 0
    );

-- Política 4: Eliminación de productos
DROP POLICY IF EXISTS "productos_delete_policy" ON public.productos;
CREATE POLICY "productos_delete_policy"
    ON public.productos FOR DELETE
    TO anon, authenticated
    USING (true);

-- 5. Comentarios de trazabilidad
COMMENT ON TABLE public.productos IS
    'HU11 (KAN-26) · Catálogo maestro de productos con código único, precio, categoría y stock.';
COMMENT ON COLUMN public.productos.codigo IS
    'Código único identificador del producto en el catálogo (ej. 029085, ACE-001).';
COMMENT ON COLUMN public.productos.precio IS
    'Precio en Soles (S/.) con validación estricta precio > 0.';
COMMENT ON COLUMN public.productos.stock_minimo IS
    'Nivel mínimo de stock para alertas de reposición.';
