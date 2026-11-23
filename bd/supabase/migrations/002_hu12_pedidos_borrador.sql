-- ============================================================
-- HU12: Crear y consultar un pedido en borrador persistente
-- Ticket: KAN-27
-- Migración 002: Cabecera e ítems de pedidos con estado BORRADOR
-- ============================================================

-- 1. Tabla de pedidos (Cabecera)
CREATE TABLE IF NOT EXISTS public.pedidos (
    id                  TEXT PRIMARY KEY,
    cliente_nombre      TEXT NOT NULL,
    cliente_documento   TEXT,
    cliente_telefono    TEXT,
    cliente_direccion   TEXT,
    estado              TEXT NOT NULL DEFAULT 'BORRADOR' CHECK (estado IN ('BORRADOR', 'CONFIRMADO', 'CANCELADO', 'DESPACHADO')),
    total               NUMERIC(10,2) NOT NULL DEFAULT 0,
    notas               TEXT,
    actor               TEXT DEFAULT 'ventas@tcadistrib.com',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_pedidos_cliente_valido CHECK (TRIM(cliente_nombre) <> ''),
    CONSTRAINT chk_pedidos_total_no_negativo CHECK (total >= 0)
);

-- Si la tabla ya existía de alguna migración previa, asegurar columnas:
ALTER TABLE public.pedidos 
    ADD COLUMN IF NOT EXISTS cliente_nombre TEXT,
    ADD COLUMN IF NOT EXISTS cliente_documento TEXT,
    ADD COLUMN IF NOT EXISTS cliente_telefono TEXT,
    ADD COLUMN IF NOT EXISTS cliente_direccion TEXT,
    ADD COLUMN IF NOT EXISTS total NUMERIC(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS notas TEXT,
    ADD COLUMN IF NOT EXISTS actor TEXT DEFAULT 'ventas@tcadistrib.com',
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Tabla de líneas de pedido (Ítems de detalle)
CREATE TABLE IF NOT EXISTS public.pedido_lineas (
    id                  BIGSERIAL PRIMARY KEY,
    pedido_id           TEXT NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    producto_id         TEXT NOT NULL,
    producto_nombre     TEXT NOT NULL,
    precio_unitario     NUMERIC(10,2) NOT NULL,
    cantidad            INTEGER NOT NULL CHECK (cantidad > 0),
    subtotal            NUMERIC(10,2) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_pedido_lineas_precio_positivo CHECK (precio_unitario > 0),
    CONSTRAINT chk_pedido_lineas_cantidad_positiva CHECK (cantidad > 0)
);

-- Si la tabla ya existía, asegurar columnas:
ALTER TABLE public.pedido_lineas 
    ADD COLUMN IF NOT EXISTS producto_nombre TEXT,
    ADD COLUMN IF NOT EXISTS precio_unitario NUMERIC(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10,2) DEFAULT 0;

-- 3. Índices para acelerar consultas de pedidos por estado y cliente
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON public.pedidos (estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON public.pedidos (cliente_nombre);
CREATE INDEX IF NOT EXISTS idx_pedidos_creado ON public.pedidos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedido_lineas_pedido ON public.pedido_lineas (pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_lineas_producto ON public.pedido_lineas (producto_id);

-- 4. Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.set_pedidos_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pedidos_updated_at ON public.pedidos;
CREATE TRIGGER trg_pedidos_updated_at
    BEFORE UPDATE ON public.pedidos
    FOR EACH ROW EXECUTE FUNCTION public.set_pedidos_updated_at();

-- 5. Configuración de Row-Level Security (RLS)
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_lineas ENABLE ROW LEVEL SECURITY;

-- Políticas para public.pedidos
DROP POLICY IF EXISTS "pedidos_select_policy" ON public.pedidos;
CREATE POLICY "pedidos_select_policy"
    ON public.pedidos FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "pedidos_insert_policy" ON public.pedidos;
CREATE POLICY "pedidos_insert_policy"
    ON public.pedidos FOR INSERT
    TO anon, authenticated
    WITH CHECK (TRIM(cliente_nombre) <> '');

DROP POLICY IF EXISTS "pedidos_update_policy" ON public.pedidos;
CREATE POLICY "pedidos_update_policy"
    ON public.pedidos FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (TRIM(cliente_nombre) <> '');

DROP POLICY IF EXISTS "pedidos_delete_policy" ON public.pedidos;
CREATE POLICY "pedidos_delete_policy"
    ON public.pedidos FOR DELETE
    TO anon, authenticated
    USING (true);

-- Políticas para public.pedido_lineas
DROP POLICY IF EXISTS "pedido_lineas_select_policy" ON public.pedido_lineas;
CREATE POLICY "pedido_lineas_select_policy"
    ON public.pedido_lineas FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "pedido_lineas_insert_policy" ON public.pedido_lineas;
CREATE POLICY "pedido_lineas_insert_policy"
    ON public.pedido_lineas FOR INSERT
    TO anon, authenticated
    WITH CHECK (cantidad > 0);

DROP POLICY IF EXISTS "pedido_lineas_update_policy" ON public.pedido_lineas;
CREATE POLICY "pedido_lineas_update_policy"
    ON public.pedido_lineas FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (cantidad > 0);

DROP POLICY IF EXISTS "pedido_lineas_delete_policy" ON public.pedido_lineas;
CREATE POLICY "pedido_lineas_delete_policy"
    ON public.pedido_lineas FOR DELETE
    TO anon, authenticated
    USING (true);

-- 6. Comentarios de trazabilidad
COMMENT ON TABLE public.pedidos IS
    'HU12 (KAN-27) · Pedidos en borrador y confirmados para el flujo de ventas TCA.';
COMMENT ON TABLE public.pedido_lineas IS
    'HU12 (KAN-27) · Detalle de ítems por pedido con producto, cantidad y precio.';
