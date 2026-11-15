-- ============================================================
-- HU11: Gestionar productos y migrar un catálogo de prueba válido
-- Ticket: KAN-26
-- Migración 001: Esquema de productos, restricciones y políticas RLS
-- ============================================================

-- 1. Si la tabla no existiera, crearla con id UUID (compatible con Supabase)
CREATE TABLE IF NOT EXISTS public.productos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo          TEXT NOT NULL,
    nombre          TEXT NOT NULL,
    descripcion     TEXT,
    categoria       TEXT NOT NULL,
    precio          NUMERIC(10,2) NOT NULL,
    stock           INTEGER NOT NULL DEFAULT 0,
    stock_actual    INTEGER NOT NULL DEFAULT 0,
    stock_minimo    INTEGER NOT NULL DEFAULT 5,
    imagen          TEXT,
    imagen_url      TEXT,
    marca           TEXT,
    activo          BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Asegurar que las columnas requeridas por HU11 existan en la tabla previa:
-- (Resuelve error 42703: column "stock_minimo" does not exist)
ALTER TABLE public.productos 
    ADD COLUMN IF NOT EXISTS stock_minimo INTEGER NOT NULL DEFAULT 5;

ALTER TABLE public.productos 
    ADD COLUMN IF NOT EXISTS stock_actual INTEGER DEFAULT 0;

ALTER TABLE public.productos 
    ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

ALTER TABLE public.productos 
    ADD COLUMN IF NOT EXISTS imagen TEXT;

ALTER TABLE public.productos 
    ADD COLUMN IF NOT EXISTS imagen_url TEXT;

ALTER TABLE public.productos 
    ADD COLUMN IF NOT EXISTS marca TEXT;

ALTER TABLE public.productos 
    ADD COLUMN IF NOT EXISTS descripcion TEXT;

ALTER TABLE public.productos 
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Sincronizar valores entre nombres de columnas legacy y HU11
UPDATE public.productos 
SET stock_actual = COALESCE(stock, 0) 
WHERE stock_actual IS NULL;

UPDATE public.productos 
SET stock = COALESCE(stock_actual, 0) 
WHERE stock IS NULL;

UPDATE public.productos 
SET imagen = COALESCE(imagen_url, '') 
WHERE imagen IS NULL;

UPDATE public.productos 
SET imagen_url = COALESCE(imagen, '') 
WHERE imagen_url IS NULL;

-- 4. Restricciones de integridad (Criterios de Aceptación HU11)
DO $$ 
BEGIN
    -- Unicidad de código
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_productos_codigo'
    ) THEN
        BEGIN
            ALTER TABLE public.productos ADD CONSTRAINT uq_productos_codigo UNIQUE (codigo);
        EXCEPTION
            WHEN others THEN NULL;
        END;
    END IF;

    -- Validación precio > 0
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_productos_precio_positivo'
    ) THEN
        ALTER TABLE public.productos ADD CONSTRAINT chk_productos_precio_positivo CHECK (precio > 0);
    END IF;

    -- Validación stock_minimo >= 0
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_productos_stock_minimo_positivo'
    ) THEN
        ALTER TABLE public.productos ADD CONSTRAINT chk_productos_stock_minimo_positivo CHECK (stock_minimo >= 0);
    END IF;
END $$;

-- 5. Trigger para actualizar updated_at automáticamente
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

-- 6. Índices para acelerar búsquedas
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON public.productos (codigo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos (categoria);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON public.productos (nombre);

-- 7. Configuración de Row-Level Security (RLS)
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- Política 1: Lectura permitida para clientes anónimos y autenticados
DROP POLICY IF EXISTS "productos_select_public" ON public.productos;
CREATE POLICY "productos_select_public"
    ON public.productos FOR SELECT
    TO anon, authenticated
    USING (true);

-- Política 2: Inserción de productos válidos (Criterio HU11)
DROP POLICY IF EXISTS "productos_insert_policy" ON public.productos;
CREATE POLICY "productos_insert_policy"
    ON public.productos FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        TRIM(codigo) <> '' AND
        TRIM(nombre) <> '' AND
        precio > 0 AND
        stock_minimo >= 0
    );

-- Política 3: Actualización de productos válidos
DROP POLICY IF EXISTS "productos_update_policy" ON public.productos;
CREATE POLICY "productos_update_policy"
    ON public.productos FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (
        TRIM(codigo) <> '' AND
        TRIM(nombre) <> '' AND
        precio > 0 AND
        stock_minimo >= 0
    );

-- Política 4: Eliminación de productos
DROP POLICY IF EXISTS "productos_delete_policy" ON public.productos;
CREATE POLICY "productos_delete_policy"
    ON public.productos FOR DELETE
    TO anon, authenticated
    USING (true);
