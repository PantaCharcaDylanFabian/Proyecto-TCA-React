-- Read-only inspection BEFORE migration 003 on an existing project.
-- Review every returned row. Never delete/remap existing data just to pass a check.
SELECT lower(codigo) AS codigo_repetido,count(*) FROM public.productos
  GROUP BY lower(codigo) HAVING count(*)>1;
SELECT codigo,nombre,precio,stock,stock_actual,stock_minimo FROM public.productos
  WHERE codigo !~ '^[A-Za-z0-9_-]{1,80}$' OR length(trim(nombre))<3
    OR precio<=0 OR stock_actual<0 OR stock_minimo<0 OR stock IS DISTINCT FROM stock_actual;
SELECT pedido_id,producto_id,count(*) FROM public.pedido_lineas
  GROUP BY pedido_id,producto_id HAVING count(*)>1;
SELECT l.pedido_id,l.producto_id FROM public.pedido_lineas l
  LEFT JOIN public.productos p ON p.codigo=l.producto_id WHERE p.codigo IS NULL;
SELECT id,estado FROM public.pedidos WHERE estado<>'BORRADOR';
SELECT table_name,column_name,data_type FROM information_schema.columns
  WHERE table_schema='public' AND table_name IN ('productos','pedidos','pedido_lineas')
    AND column_name IN ('id','pedido_id','producto_id');
