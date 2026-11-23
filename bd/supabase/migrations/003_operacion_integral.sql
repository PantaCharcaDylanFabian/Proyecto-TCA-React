-- HU01-HU13 / KAN-5..31. Apply AFTER 001 and 002, once, as database owner.
-- No existing business data is deleted. Inconsistent legacy data aborts the migration.
BEGIN;
CREATE SCHEMA IF NOT EXISTS tca_private;
REVOKE ALL ON SCHEMA tca_private FROM PUBLIC, anon, authenticated;

ALTER TABLE public.productos
  ADD COLUMN IF NOT EXISTS datos_ejemplo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS codigo_barras text,
  ADD COLUMN IF NOT EXISTS proveedor text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS macro_categoria text NOT NULL DEFAULT 'Otros',
  ADD COLUMN IF NOT EXISTS subcategoria_slug text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS stock_objetivo integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS stock_reservado integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;
UPDATE public.productos SET stock_actual = COALESCE(stock_actual, stock, 0),
  stock_objetivo = greatest(stock_objetivo, stock_minimo);
ALTER TABLE public.productos ALTER COLUMN stock_actual SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS tca_codigo_unique ON public.productos(codigo);
CREATE UNIQUE INDEX IF NOT EXISTS tca_codigo_case_unique ON public.productos(lower(codigo));
CREATE UNIQUE INDEX IF NOT EXISTS tca_barcode_unique ON public.productos(codigo_barras) WHERE codigo_barras IS NOT NULL;
ALTER TABLE public.productos ADD CONSTRAINT tca_product_values CHECK (
  codigo ~ '^[A-Za-z0-9_-]{1,80}$' AND length(trim(nombre)) BETWEEN 3 AND 200
  AND length(trim(categoria)) > 0 AND precio > 0 AND precio < 100000000
  AND precio::text NOT IN ('NaN','Infinity','-Infinity')
  AND stock_actual >= 0 AND stock_minimo >= 0 AND stock_objetivo >= stock_minimo
  AND stock_reservado BETWEEN 0 AND stock_actual);

CREATE TABLE public.perfiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre text NOT NULL CHECK (length(trim(nombre)) BETWEEN 3 AND 200),
  rol text NOT NULL CHECK (rol IN ('GERENCIA','VENTAS','ALMACEN')),
  activo boolean NOT NULL DEFAULT true
);
CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  documento text NOT NULL UNIQUE CHECK (length(documento) BETWEEN 1 AND 30),
  nombre text NOT NULL,
  telefono text NOT NULL DEFAULT '',
  direccion text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS canal text NOT NULL DEFAULT 'INTERNO' CHECK (canal IN ('INTERNO','WEB')),
  ADD COLUMN IF NOT EXISTS cliente_id uuid REFERENCES public.clientes(id),
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_solicitado numeric(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS entrega text NOT NULL DEFAULT 'RECOJO' CHECK (entrega IN ('RECOJO','DELIVERY')),
  ADD COLUMN IF NOT EXISTS constancia text,
  ADD COLUMN IF NOT EXISTS token_seguimiento uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS operacion_id uuid UNIQUE;
ALTER TABLE public.pedido_lineas
  ADD COLUMN IF NOT EXISTS cantidad_confirmada integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cantidad_preparada integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS imagen text NOT NULL DEFAULT '';
ALTER TABLE public.pedido_lineas ADD CONSTRAINT tca_line_quantities CHECK (
  cantidad BETWEEN 1 AND 1000000 AND cantidad_confirmada BETWEEN 0 AND cantidad
  AND cantidad_preparada BETWEEN 0 AND cantidad_confirmada
  AND precio_unitario > 0 AND precio_unitario::text NOT IN ('NaN','Infinity','-Infinity'));
CREATE UNIQUE INDEX tca_order_product_unique ON public.pedido_lineas(pedido_id,producto_id);
-- Keep legacy lines readable for review. New and updated lines are validated by RPC.
-- NOT VALID avoids deleting or remapping historical product identifiers implicitly.
ALTER TABLE public.pedido_lineas ADD CONSTRAINT tca_line_product_fk
  FOREIGN KEY (producto_id) REFERENCES public.productos(codigo) ON UPDATE CASCADE NOT VALID;
CREATE TABLE public.reservas (
  pedido_id text NOT NULL REFERENCES public.pedidos(id),
  producto_codigo text NOT NULL REFERENCES public.productos(codigo) ON UPDATE CASCADE,
  cantidad integer NOT NULL CHECK (cantidad > 0),
  PRIMARY KEY(pedido_id,producto_codigo)
);
CREATE TABLE public.movimientos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  producto_codigo text NOT NULL REFERENCES public.productos(codigo) ON UPDATE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('APERTURA','ENTRADA','SALIDA')),
  cantidad integer NOT NULL CHECK (cantidad > 0),
  saldo integer NOT NULL CHECK (saldo >= 0),
  actor uuid REFERENCES auth.users(id),
  referencia text NOT NULL DEFAULT '',
  proveedor text NOT NULL DEFAULT '',
  operacion_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(operacion_id,producto_codigo)
);
CREATE TABLE public.compras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estado text NOT NULL DEFAULT 'PROPUESTA' CHECK (estado IN ('PROPUESTA','APROBADA','RECIBIDA','CANCELADA')),
  proveedor text NOT NULL DEFAULT '',
  actor uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.compra_lineas (
  compra_id uuid NOT NULL REFERENCES public.compras(id),
  producto_codigo text NOT NULL REFERENCES public.productos(codigo) ON UPDATE CASCADE,
  cantidad integer NOT NULL CHECK (cantidad BETWEEN 1 AND 1000000),
  PRIMARY KEY(compra_id,producto_codigo)
);
CREATE TABLE public.contactos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN ('CONTACTO','SUSCRIPCION')),
  nombre text NOT NULL,
  email text NOT NULL,
  telefono text NOT NULL DEFAULT '',
  operacion_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.importaciones (
  id uuid PRIMARY KEY,
  actor uuid NOT NULL REFERENCES auth.users(id),
  aceptadas integer NOT NULL,
  rechazos jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE tca_private.operaciones (
  id uuid PRIMARY KEY,
  actor uuid,
  accion text NOT NULL,
  huella text NOT NULL,
  resultado jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE FUNCTION tca_private.role() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT rol FROM public.perfiles WHERE id = auth.uid() AND activo;
$$;
CREATE FUNCTION tca_private.require_role(allowed text[]) RETURNS void LANGUAGE plpgsql STABLE SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS NULL OR COALESCE(tca_private.role() = ANY(allowed),false) = false THEN
    RAISE EXCEPTION 'No tienes permiso para realizar esta operación.' USING ERRCODE = '42501';
  END IF;
END;
$$;
CREATE FUNCTION tca_private.start_operation(k uuid, action text, payload jsonb) RETURNS jsonb
LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE o tca_private.operaciones;
BEGIN
  IF k IS NULL THEN RAISE EXCEPTION 'Falta la clave de operación.'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(k::text,0));
  SELECT * INTO o FROM tca_private.operaciones WHERE id = k;
  IF FOUND THEN
    IF o.actor IS DISTINCT FROM auth.uid() OR o.accion <> action OR o.huella <> md5(payload::text) THEN
      RAISE EXCEPTION 'La clave ya pertenece a otra operación. Recarga antes de continuar.';
    END IF;
    RETURN o.resultado;
  END IF;
  RETURN NULL;
END;
$$;
CREATE FUNCTION tca_private.finish_operation(k uuid, action text, payload jsonb, result jsonb) RETURNS jsonb
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  INSERT INTO tca_private.operaciones(id,actor,accion,huella,resultado) VALUES(k,auth.uid(),action,md5(payload::text),result);
  RETURN result;
END;
$$;

CREATE FUNCTION public.tca_mi_perfil() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT to_jsonb(p) FROM public.perfiles p WHERE id = auth.uid() AND activo;
$$;
CREATE FUNCTION public.tca_perfiles() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM tca_private.require_role(ARRAY['GERENCIA']);
  RETURN COALESCE((SELECT jsonb_agg(to_jsonb(p) || jsonb_build_object('email',u.email) ORDER BY p.nombre)
    FROM public.perfiles p JOIN auth.users u ON u.id = p.id),'[]');
END;
$$;
CREATE FUNCTION public.tca_asignar_perfil(p_email text,p_nombre text,p_rol text,p_activo boolean) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE uid uuid;
BEGIN
  PERFORM tca_private.require_role(ARRAY['GERENCIA']);
  PERFORM pg_advisory_xact_lock(714218);
  SELECT id INTO uid FROM auth.users WHERE lower(email) = lower(trim(p_email));
  IF uid IS NULL THEN RAISE EXCEPTION 'Primero crea o invita a esta cuenta en Supabase Auth.'; END IF;
  IF uid = auth.uid() AND (p_rol <> 'GERENCIA' OR NOT p_activo) THEN RAISE EXCEPTION 'No puedes retirar tu propio acceso de Gerencia.'; END IF;
  INSERT INTO public.perfiles(id,nombre,rol,activo) VALUES(uid,trim(p_nombre),p_rol,p_activo)
  ON CONFLICT(id) DO UPDATE SET nombre=excluded.nombre,rol=excluded.rol,activo=excluded.activo;
  RETURN jsonb_build_object('id',uid);
END;
$$;

CREATE FUNCTION public.tca_catalogo() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object('codigo',codigo,'codigo_barras',codigo_barras,'nombre',nombre,
    'descripcion',COALESCE(descripcion,''),'categoria',categoria,'macro_categoria',macro_categoria,
    'subcategoria_slug',subcategoria_slug,'marca',COALESCE(marca,''),'imagen',COALESCE(imagen,''),
    'precio',precio,'datos_ejemplo',datos_ejemplo,'disponible',stock_actual-stock_reservado) ORDER BY nombre),'[]')
  FROM public.productos WHERE activo;
$$;
CREATE FUNCTION public.tca_productos() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM tca_private.require_role(ARRAY['GERENCIA','VENTAS','ALMACEN']);
  RETURN COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY codigo) FROM public.productos p),'[]');
END;
$$;
CREATE FUNCTION tca_private.write_product(p jsonb, original text, expected integer, op uuid) RETURNS jsonb
LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE old public.productos; saved public.productos; code text := upper(trim(p->>'codigo')); initial integer;
BEGIN
  IF jsonb_typeof(p) <> 'object' OR code IS NULL OR (p->>'precio')::numeric IS NULL
    OR (p->>'stock_minimo')::integer IS NULL OR (p->>'stock_actual')::integer IS NULL THEN
    RAISE EXCEPTION 'Producto incompleto.';
  END IF;
  IF original IS NOT NULL THEN
    SELECT * INTO old FROM public.productos WHERE codigo = original FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'El producto ya no existe.'; END IF;
    IF expected IS DISTINCT FROM old.version THEN RAISE EXCEPTION 'El producto cambió. Recarga antes de editar.'; END IF;
    IF (p->>'stock_actual')::integer <> old.stock_actual THEN RAISE EXCEPTION 'Registra una entrada o despacho para modificar existencias.'; END IF;
    IF old.stock_reservado > 0 AND NOT COALESCE((p->>'activo')::boolean,true) THEN RAISE EXCEPTION 'No desactives un producto con reservas.'; END IF;
    UPDATE public.productos SET codigo=code,nombre=trim(p->>'nombre'),categoria=trim(p->>'categoria'),
      marca=COALESCE(p->>'marca',''),descripcion=COALESCE(p->>'descripcion',p->>'nombre'),precio=(p->>'precio')::numeric,
      stock_minimo=(p->>'stock_minimo')::integer,stock_objetivo=COALESCE((p->>'stock_objetivo')::integer,greatest((p->>'stock_minimo')::integer,30)),
      imagen=COALESCE(p->>'imagen',''),imagen_url=COALESCE(p->>'imagen',''),activo=COALESCE((p->>'activo')::boolean,true),
      codigo_barras=nullif(trim(p->>'codigo_barras'),''),proveedor=COALESCE(p->>'proveedor',''),
      macro_categoria=COALESCE(p->>'macro_categoria',old.macro_categoria),subcategoria_slug=COALESCE(p->>'subcategoria_slug',old.subcategoria_slug),
      datos_ejemplo=COALESCE((p->>'datos_ejemplo')::boolean,old.datos_ejemplo),version=version+1 WHERE codigo=original RETURNING * INTO saved;
  ELSE
    initial := (p->>'stock_actual')::integer;
    INSERT INTO public.productos(codigo,nombre,categoria,marca,descripcion,precio,stock,stock_actual,stock_minimo,
      stock_objetivo,imagen,imagen_url,activo,codigo_barras,proveedor,macro_categoria,subcategoria_slug,datos_ejemplo)
    VALUES(code,trim(p->>'nombre'),trim(p->>'categoria'),COALESCE(p->>'marca',''),COALESCE(p->>'descripcion',p->>'nombre'),
      (p->>'precio')::numeric,initial,initial,(p->>'stock_minimo')::integer,
      COALESCE((p->>'stock_objetivo')::integer,greatest((p->>'stock_minimo')::integer,30)),COALESCE(p->>'imagen',''),
      COALESCE(p->>'imagen',''),COALESCE((p->>'activo')::boolean,true),nullif(trim(p->>'codigo_barras'),''),
      COALESCE(p->>'proveedor',''),COALESCE(p->>'macro_categoria','Otros'),COALESCE(p->>'subcategoria_slug',''),COALESCE((p->>'datos_ejemplo')::boolean,false)) RETURNING * INTO saved;
    IF initial > 0 THEN
      INSERT INTO public.movimientos(producto_codigo,tipo,cantidad,saldo,actor,referencia,operacion_id)
      VALUES(code,'APERTURA',initial,initial,auth.uid(),'Saldo inicial',op);
    END IF;
  END IF;
  RETURN to_jsonb(saved);
END;
$$;
CREATE FUNCTION public.tca_guardar_producto(p_producto jsonb,p_original text,p_version integer,p_operacion uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE payload jsonb := jsonb_build_object('producto',p_producto,'original',p_original,'version',p_version); result jsonb;
BEGIN
  PERFORM tca_private.require_role(ARRAY['GERENCIA']);
  result := tca_private.start_operation(p_operacion,'producto',payload); IF result IS NOT NULL THEN RETURN result; END IF;
  PERFORM pg_advisory_xact_lock(714219);
  result := tca_private.write_product(p_producto,p_original,p_version,p_operacion);
  RETURN tca_private.finish_operation(p_operacion,'producto',payload,result);
END;
$$;
CREATE FUNCTION public.tca_desactivar_producto(p_codigo text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM tca_private.require_role(ARRAY['GERENCIA']);
  PERFORM pg_advisory_xact_lock(714219);
  IF NOT EXISTS(SELECT 1 FROM public.productos WHERE codigo=p_codigo) THEN RAISE EXCEPTION 'Producto inexistente.'; END IF;
  IF EXISTS(SELECT 1 FROM public.reservas WHERE producto_codigo=p_codigo) THEN RAISE EXCEPTION 'El producto tiene reservas activas.'; END IF;
  UPDATE public.productos SET activo=false,version=version+1 WHERE codigo=p_codigo;
  RETURN jsonb_build_object('success',true);
END;
$$;
CREATE FUNCTION public.tca_importar_productos(p_productos jsonb,p_rechazos jsonb,p_operacion uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE p jsonb; result jsonb; payload jsonb := jsonb_build_object('productos',p_productos,'rechazos',p_rechazos);
BEGIN
  PERFORM tca_private.require_role(ARRAY['GERENCIA']);
  result := tca_private.start_operation(p_operacion,'importar',payload); IF result IS NOT NULL THEN RETURN result; END IF;
  IF jsonb_typeof(p_productos) <> 'array' OR jsonb_array_length(p_productos) > 1000 OR jsonb_typeof(p_rechazos) <> 'array' THEN RAISE EXCEPTION 'Lote inválido (máximo 1000).'; END IF;
  PERFORM pg_advisory_xact_lock(714219);
  FOR p IN SELECT value FROM jsonb_array_elements(p_productos) LOOP
    PERFORM tca_private.write_product(p,NULL,NULL,p_operacion);
  END LOOP;
  INSERT INTO public.importaciones(id,actor,aceptadas,rechazos) VALUES(p_operacion,auth.uid(),jsonb_array_length(p_productos),p_rechazos);
  RETURN tca_private.finish_operation(p_operacion,'importar',payload,jsonb_build_object('successCount',jsonb_array_length(p_productos),'failedCount',0));
END;
$$;

CREATE FUNCTION public.tca_entrada(p_codigo text,p_cantidad integer,p_referencia text,p_proveedor text,p_operacion uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE p public.productos; result jsonb; payload jsonb := jsonb_build_array(p_codigo,p_cantidad,p_referencia,p_proveedor);
BEGIN
  PERFORM tca_private.require_role(ARRAY['GERENCIA','ALMACEN']);
  result := tca_private.start_operation(p_operacion,'entrada',payload); IF result IS NOT NULL THEN RETURN result; END IF;
  IF p_cantidad IS NULL OR p_cantidad NOT BETWEEN 1 AND 1000000 OR length(COALESCE(p_referencia,'')) > 200 THEN RAISE EXCEPTION 'Cantidad o referencia inválida.'; END IF;
  -- One short inventory lock keeps the small distributor demo serializable across
  -- every mutation. Transactions also acquire row locks; a later scaling can shard it.
  PERFORM pg_advisory_xact_lock(714219);
  UPDATE public.productos SET stock_actual=stock_actual+p_cantidad,stock=stock_actual+p_cantidad,version=version+1
    WHERE codigo=p_codigo AND activo RETURNING * INTO p;
  IF NOT FOUND THEN RAISE EXCEPTION 'Código no reconocido o producto inactivo.'; END IF;
  INSERT INTO public.movimientos(producto_codigo,tipo,cantidad,saldo,actor,referencia,proveedor,operacion_id)
    VALUES(p_codigo,'ENTRADA',p_cantidad,p.stock_actual,auth.uid(),COALESCE(p_referencia,''),COALESCE(p_proveedor,''),p_operacion);
  RETURN tca_private.finish_operation(p_operacion,'entrada',payload,to_jsonb(p));
END;
$$;
CREATE FUNCTION public.tca_movimientos() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM tca_private.require_role(ARRAY['GERENCIA','ALMACEN']);
  RETURN COALESCE((SELECT jsonb_agg(to_jsonb(m) ORDER BY m.id DESC) FROM (SELECT * FROM public.movimientos ORDER BY id DESC LIMIT 500) m),'[]');
END;
$$;

CREATE FUNCTION tca_private.order_json(oid text) RETURNS jsonb LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT (to_jsonb(p)-'token_seguimiento'-'operacion_id') || jsonb_build_object('lineas',
    COALESCE((SELECT jsonb_agg(to_jsonb(l) ORDER BY l.id) FROM public.pedido_lineas l WHERE l.pedido_id=p.id),'[]'))
  FROM public.pedidos p WHERE p.id=oid;
$$;
CREATE FUNCTION public.tca_pedidos() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM tca_private.require_role(ARRAY['GERENCIA','VENTAS','ALMACEN']);
  RETURN COALESCE((SELECT jsonb_agg(tca_private.order_json(id) ORDER BY created_at DESC) FROM public.pedidos),'[]');
END;
$$;
CREATE FUNCTION tca_private.save_order(o jsonb, oid text, expected integer, web boolean, op uuid) RETURNS text
LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE old public.pedidos; item jsonb; p public.productos; qty integer; v_total numeric := 0; cid uuid;
  doc text := trim(COALESCE(o->>'cliente_documento','')); name text := trim(o->>'cliente_nombre');
BEGIN
  IF name IS NULL OR length(name) NOT BETWEEN 3 AND 200 OR length(doc)>30
    OR length(COALESCE(o->>'cliente_telefono',''))>30 OR length(COALESCE(o->>'cliente_direccion',''))>300
    OR length(COALESCE(o->>'notas',''))>1000 THEN RAISE EXCEPTION 'Datos del cliente inválidos.'; END IF;
  IF jsonb_typeof(o->'lineas') IS DISTINCT FROM 'array' OR jsonb_array_length(o->'lineas') NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Agrega entre 1 y 100 productos.'; END IF;
  IF (SELECT count(*) FROM jsonb_array_elements(o->'lineas')) <>
    (SELECT count(DISTINCT value->>'producto_id') FROM jsonb_array_elements(o->'lineas')) THEN RAISE EXCEPTION 'No repitas productos.'; END IF;
  IF oid IS NOT NULL THEN
    SELECT * INTO old FROM public.pedidos WHERE id=oid FOR UPDATE;
    IF NOT FOUND OR old.estado <> 'BORRADOR' THEN RAISE EXCEPTION 'Solo puedes editar un borrador existente.'; END IF;
    IF expected IS DISTINCT FROM old.version THEN RAISE EXCEPTION 'El pedido cambió. Recarga antes de editar.'; END IF;
  ELSE
    oid := 'PED-' || to_char(now(),'YYYY') || '-' || upper(replace(gen_random_uuid()::text,'-',''));
  END IF;
  IF doc <> '' THEN
    INSERT INTO public.clientes(documento,nombre,telefono,direccion) VALUES(doc,name,COALESCE(o->>'cliente_telefono',''),COALESCE(o->>'cliente_direccion',''))
      ON CONFLICT(documento) DO NOTHING RETURNING id INTO cid;
    IF cid IS NULL THEN SELECT id INTO cid FROM public.clientes WHERE documento=doc; END IF;
  END IF;
  IF old.id IS NULL THEN
    INSERT INTO public.pedidos(id,cliente_nombre,cliente_documento,cliente_telefono,cliente_direccion,cliente_id,estado,total,notas,actor,canal,entrega,operacion_id)
    VALUES(oid,name,doc,COALESCE(o->>'cliente_telefono',''),COALESCE(o->>'cliente_direccion',''),cid,'BORRADOR',0,COALESCE(o->>'notas',''),
      COALESCE(auth.uid()::text,'CLIENTE WEB'),CASE WHEN web THEN 'WEB' ELSE 'INTERNO' END,COALESCE(o->>'entrega','RECOJO'),op);
  ELSE
    UPDATE public.pedidos SET cliente_nombre=name,cliente_documento=doc,cliente_telefono=COALESCE(o->>'cliente_telefono',''),
      cliente_direccion=COALESCE(o->>'cliente_direccion',''),cliente_id=cid,notas=COALESCE(o->>'notas',''),
      entrega=COALESCE(o->>'entrega',entrega),version=version+1 WHERE id=oid;
    DELETE FROM public.pedido_lineas WHERE pedido_id=oid;
  END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(o->'lineas') LOOP
    IF jsonb_typeof(item->'cantidad') <> 'number' OR (item->>'cantidad')::numeric <> trunc((item->>'cantidad')::numeric) THEN RAISE EXCEPTION 'La cantidad debe ser entera.'; END IF;
    qty := (item->>'cantidad')::integer;
    IF qty IS NULL OR qty NOT BETWEEN 1 AND 1000000 THEN RAISE EXCEPTION 'La cantidad debe ser positiva (máximo 1000000).'; END IF;
    SELECT * INTO p FROM public.productos WHERE codigo=item->>'producto_id' AND activo;
    IF NOT FOUND THEN RAISE EXCEPTION 'Producto no disponible: %',item->>'producto_id'; END IF;
    IF web AND p.stock_actual-p.stock_reservado < qty THEN RAISE EXCEPTION 'Stock insuficiente para %. Disponible: %.',p.nombre,p.stock_actual-p.stock_reservado; END IF;
    INSERT INTO public.pedido_lineas(pedido_id,producto_id,producto_nombre,precio_unitario,cantidad,subtotal,imagen)
      VALUES(oid,p.codigo,p.nombre,p.precio,qty,round(qty*p.precio,2),COALESCE(p.imagen,''));
    v_total := v_total + round(qty*p.precio,2);
  END LOOP;
  UPDATE public.pedidos SET total=v_total, total_solicitado=v_total WHERE id=oid;
  RETURN oid;
END;
$$;
CREATE FUNCTION public.tca_guardar_borrador(p_pedido jsonb,p_id text,p_version integer,p_operacion uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE payload jsonb := jsonb_build_array(p_pedido,p_id,p_version); result jsonb; oid text;
BEGIN
  PERFORM tca_private.require_role(ARRAY['GERENCIA','VENTAS']);
  result := tca_private.start_operation(p_operacion,'borrador',payload); IF result IS NOT NULL THEN RETURN result; END IF;
  PERFORM pg_advisory_xact_lock(714219);
  oid := tca_private.save_order(p_pedido,nullif(p_id,''),p_version,false,p_operacion);
  RETURN tca_private.finish_operation(p_operacion,'borrador',payload,tca_private.order_json(oid));
END;
$$;
CREATE FUNCTION public.tca_enviar_pedido(p_pedido jsonb,p_operacion uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE result jsonb; oid text;
BEGIN
  result := tca_private.start_operation(p_operacion,'web',p_pedido); IF result IS NOT NULL THEN RETURN result; END IF;
  PERFORM pg_advisory_xact_lock(714219);
  IF length(trim(COALESCE(p_pedido->>'cliente_telefono',''))) < 7 THEN RAISE EXCEPTION 'Ingresa un teléfono de contacto.'; END IF;
  IF (SELECT count(*) FROM public.pedidos WHERE canal='WEB' AND cliente_telefono=p_pedido->>'cliente_telefono' AND created_at>now()-interval '1 hour') >= 5 THEN RAISE EXCEPTION 'Ya recibimos varias solicitudes. Contacta a Ventas antes de enviar otra.'; END IF;
  oid := tca_private.save_order(p_pedido,NULL,NULL,true,p_operacion);
  SELECT jsonb_build_object('id',id,'token',token_seguimiento,'estado',estado) INTO result FROM public.pedidos WHERE id=oid;
  RETURN tca_private.finish_operation(p_operacion,'web',p_pedido,result);
END;
$$;
CREATE FUNCTION public.tca_seguimiento(p_id text,p_token uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT jsonb_build_object('id',p.id,'estado',p.estado,'total',p.total,'entrega',p.entrega,'updated_at',p.updated_at,
    'lineas',COALESCE((SELECT jsonb_agg(jsonb_build_object('nombre',l.producto_nombre,'solicitado',l.cantidad,'confirmado',l.cantidad_confirmada))
      FROM public.pedido_lineas l WHERE l.pedido_id=p.id),'[]'))
  FROM public.pedidos p WHERE p.id=p_id AND p.token_seguimiento=p_token;
$$;
CREATE FUNCTION public.tca_link_seguimiento(p_id text) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM tca_private.require_role(ARRAY['GERENCIA','VENTAS']);
  RETURN (SELECT jsonb_build_object('token',token_seguimiento) FROM public.pedidos WHERE id=p_id);
END;
$$;

CREATE FUNCTION public.tca_confirmar(p_id text,p_parcial boolean,p_version integer,p_operacion uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE o public.pedidos; l public.pedido_lineas; p public.productos; qty integer; units integer := 0; amount numeric := 0;
  payload jsonb := jsonb_build_array(p_id,p_parcial,p_version); result jsonb;
BEGIN
  PERFORM tca_private.require_role(ARRAY['GERENCIA','VENTAS']);
  result := tca_private.start_operation(p_operacion,'confirmar',payload); IF result IS NOT NULL THEN RETURN result; END IF;
  PERFORM pg_advisory_xact_lock(714219);
  SELECT * INTO o FROM public.pedidos WHERE id=p_id FOR UPDATE;
  IF NOT FOUND OR o.estado <> 'BORRADOR' THEN RAISE EXCEPTION 'Solo se confirma un pedido en borrador.'; END IF;
  IF p_version IS DISTINCT FROM o.version THEN RAISE EXCEPTION 'El pedido cambió. Recarga antes de confirmar.'; END IF;
  FOR l IN SELECT * FROM public.pedido_lineas WHERE pedido_id=p_id ORDER BY producto_id LOOP
    SELECT * INTO p FROM public.productos WHERE codigo=l.producto_id AND activo FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Revisa el producto %: está inactivo o no existe.',l.producto_nombre; END IF;
    qty := least(l.cantidad,p.stock_actual-p.stock_reservado);
    IF qty < l.cantidad AND NOT p_parcial THEN RAISE EXCEPTION 'Sin stock suficiente: %. Solicitado %, disponible %, pendiente %. Acepta explícitamente la entrega parcial.',p.nombre,l.cantidad,qty,l.cantidad-qty; END IF;
    IF qty > 0 THEN
      INSERT INTO public.reservas(pedido_id,producto_codigo,cantidad) VALUES(p_id,p.codigo,qty);
      UPDATE public.productos SET stock_reservado=stock_reservado+qty,version=version+1 WHERE codigo=p.codigo;
    END IF;
    UPDATE public.pedido_lineas SET cantidad_confirmada=qty,subtotal=round(qty*precio_unitario,2) WHERE id=l.id;
    units := units+qty; amount := amount+round(qty*l.precio_unitario,2);
  END LOOP;
  IF units=0 THEN RAISE EXCEPTION 'No hay unidades disponibles. El pedido permanece en borrador.'; END IF;
  UPDATE public.pedidos SET estado='CONFIRMADO',total=amount,version=version+1 WHERE id=p_id;
  RETURN tca_private.finish_operation(p_operacion,'confirmar',payload,tca_private.order_json(p_id));
END;
$$;
CREATE FUNCTION public.tca_cancelar(p_id text,p_operacion uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE o public.pedidos; r public.reservas; payload jsonb := to_jsonb(p_id); result jsonb;
BEGIN
  PERFORM tca_private.require_role(ARRAY['GERENCIA','VENTAS']);
  result := tca_private.start_operation(p_operacion,'cancelar',payload); IF result IS NOT NULL THEN RETURN result; END IF;
  PERFORM pg_advisory_xact_lock(714219);
  SELECT * INTO o FROM public.pedidos WHERE id=p_id FOR UPDATE;
  IF NOT FOUND OR o.estado='DESPACHADO' THEN RAISE EXCEPTION 'No se puede cancelar este pedido.'; END IF;
  IF o.estado <> 'CANCELADO' THEN
    FOR r IN SELECT * FROM public.reservas WHERE pedido_id=p_id ORDER BY producto_codigo LOOP
      UPDATE public.productos SET stock_reservado=stock_reservado-r.cantidad,version=version+1 WHERE codigo=r.producto_codigo;
    END LOOP;
    DELETE FROM public.reservas WHERE pedido_id=p_id;
    UPDATE public.pedidos SET estado='CANCELADO',version=version+1 WHERE id=p_id;
  END IF;
  RETURN tca_private.finish_operation(p_operacion,'cancelar',payload,tca_private.order_json(p_id));
END;
$$;
CREATE FUNCTION public.tca_preparar(p_id text,p_codigo text,p_cantidad integer,p_operacion uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE payload jsonb := jsonb_build_array(p_id,p_codigo,p_cantidad); result jsonb;
BEGIN
  PERFORM tca_private.require_role(ARRAY['GERENCIA','ALMACEN']);
  result := tca_private.start_operation(p_operacion,'preparar',payload); IF result IS NOT NULL THEN RETURN result; END IF;
  PERFORM pg_advisory_xact_lock(714219);
  PERFORM 1 FROM public.pedidos WHERE id=p_id AND estado='CONFIRMADO' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'El pedido no está confirmado.'; END IF;
  UPDATE public.pedido_lineas SET cantidad_preparada=p_cantidad WHERE pedido_id=p_id AND producto_id=p_codigo
    AND p_cantidad BETWEEN 0 AND cantidad_confirmada AND p_cantidad IS NOT NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Producto o cantidad preparada inválidos.'; END IF;
  UPDATE public.pedidos SET version=version+1 WHERE id=p_id;
  RETURN tca_private.finish_operation(p_operacion,'preparar',payload,tca_private.order_json(p_id));
END;
$$;
CREATE FUNCTION public.tca_despachar(p_id text,p_operacion uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE o public.pedidos; r public.reservas; saldo integer; payload jsonb := to_jsonb(p_id); result jsonb;
BEGIN
  PERFORM tca_private.require_role(ARRAY['GERENCIA','ALMACEN']);
  result := tca_private.start_operation(p_operacion,'despachar',payload); IF result IS NOT NULL THEN RETURN result; END IF;
  PERFORM pg_advisory_xact_lock(714219);
  SELECT * INTO o FROM public.pedidos WHERE id=p_id FOR UPDATE;
  IF NOT FOUND OR o.estado NOT IN ('CONFIRMADO','DESPACHADO') THEN RAISE EXCEPTION 'El pedido debe estar confirmado.'; END IF;
  IF o.estado='CONFIRMADO' THEN
    IF EXISTS(SELECT 1 FROM public.pedido_lineas WHERE pedido_id=p_id AND cantidad_preparada <> cantidad_confirmada) THEN RAISE EXCEPTION 'Completa la preparación de todos los productos reservados.'; END IF;
    IF NOT EXISTS(SELECT 1 FROM public.reservas WHERE pedido_id=p_id) THEN RAISE EXCEPTION 'El pedido no tiene reservas.'; END IF;
    FOR r IN SELECT * FROM public.reservas WHERE pedido_id=p_id ORDER BY producto_codigo LOOP
      UPDATE public.productos SET stock_actual=stock_actual-r.cantidad,stock=stock_actual-r.cantidad,
        stock_reservado=stock_reservado-r.cantidad,version=version+1 WHERE codigo=r.producto_codigo RETURNING stock_actual INTO saldo;
      INSERT INTO public.movimientos(producto_codigo,tipo,cantidad,saldo,actor,referencia,operacion_id)
        VALUES(r.producto_codigo,'SALIDA',r.cantidad,saldo,auth.uid(),p_id,p_operacion);
    END LOOP;
    DELETE FROM public.reservas WHERE pedido_id=p_id;
    UPDATE public.pedidos SET estado='DESPACHADO',constancia='GUIA-'||p_id,version=version+1 WHERE id=p_id;
  END IF;
  RETURN tca_private.finish_operation(p_operacion,'despachar',payload,tca_private.order_json(p_id));
END;
$$;

CREATE FUNCTION public.tca_compras() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM tca_private.require_role(ARRAY['GERENCIA','ALMACEN']);
  RETURN COALESCE((SELECT jsonb_agg(to_jsonb(c) || jsonb_build_object('lineas',
    (SELECT jsonb_agg(to_jsonb(l)||jsonb_build_object('nombre',p.nombre)) FROM public.compra_lineas l JOIN public.productos p ON p.codigo=l.producto_codigo WHERE compra_id=c.id))
    ORDER BY c.created_at DESC) FROM public.compras c),'[]');
END;
$$;
CREATE FUNCTION public.tca_crear_compra(p_lineas jsonb,p_proveedor text,p_operacion uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE cid uuid; l jsonb; payload jsonb := jsonb_build_array(p_lineas,p_proveedor); result jsonb;
BEGIN
  PERFORM tca_private.require_role(ARRAY['GERENCIA']);
  result := tca_private.start_operation(p_operacion,'compra',payload); IF result IS NOT NULL THEN RETURN result; END IF;
  IF jsonb_typeof(p_lineas) <> 'array' OR jsonb_array_length(p_lineas) NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Selecciona entre 1 y 100 productos.'; END IF;
  INSERT INTO public.compras(proveedor,actor) VALUES(COALESCE(p_proveedor,''),auth.uid()) RETURNING id INTO cid;
  FOR l IN SELECT value FROM jsonb_array_elements(p_lineas) LOOP
    IF (l->>'cantidad')::numeric <> trunc((l->>'cantidad')::numeric) THEN RAISE EXCEPTION 'La cantidad debe ser entera.'; END IF;
    INSERT INTO public.compra_lineas(compra_id,producto_codigo,cantidad) VALUES(cid,l->>'producto_codigo',(l->>'cantidad')::integer);
  END LOOP;
  RETURN tca_private.finish_operation(p_operacion,'compra',payload,jsonb_build_object('id',cid));
END;
$$;
CREATE FUNCTION public.tca_accion_compra(p_id uuid,p_accion text,p_operacion uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE c public.compras; l public.compra_lineas; saldo integer; payload jsonb := jsonb_build_array(p_id,p_accion); result jsonb;
BEGIN
  PERFORM tca_private.require_role(CASE WHEN p_accion='RECIBIR' THEN ARRAY['GERENCIA','ALMACEN'] ELSE ARRAY['GERENCIA'] END);
  result := tca_private.start_operation(p_operacion,'accion_compra',payload); IF result IS NOT NULL THEN RETURN result; END IF;
  PERFORM pg_advisory_xact_lock(714219);
  SELECT * INTO c FROM public.compras WHERE id=p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Compra inexistente.'; END IF;
  IF p_accion='APROBAR' AND c.estado='PROPUESTA' THEN UPDATE public.compras SET estado='APROBADA' WHERE id=p_id;
  ELSIF p_accion='CANCELAR' AND c.estado IN ('PROPUESTA','APROBADA') THEN UPDATE public.compras SET estado='CANCELADA' WHERE id=p_id;
  ELSIF p_accion='RECIBIR' AND c.estado='APROBADA' THEN
    FOR l IN SELECT * FROM public.compra_lineas WHERE compra_id=p_id ORDER BY producto_codigo LOOP
      UPDATE public.productos SET stock_actual=stock_actual+l.cantidad,stock=stock_actual+l.cantidad,version=version+1
        WHERE codigo=l.producto_codigo RETURNING stock_actual INTO saldo;
      INSERT INTO public.movimientos(producto_codigo,tipo,cantidad,saldo,actor,referencia,proveedor,operacion_id)
        VALUES(l.producto_codigo,'ENTRADA',l.cantidad,saldo,auth.uid(),'COMPRA-'||p_id,c.proveedor,p_operacion);
    END LOOP;
    UPDATE public.compras SET estado='RECIBIDA' WHERE id=p_id;
  ELSIF NOT (p_accion='RECIBIR' AND c.estado='RECIBIDA') THEN RAISE EXCEPTION 'Transición de compra inválida.';
  END IF;
  SELECT to_jsonb(x) INTO result FROM public.compras x WHERE id=p_id;
  RETURN tca_private.finish_operation(p_operacion,'accion_compra',payload,result);
END;
$$;
CREATE FUNCTION public.tca_contacto(p_datos jsonb,p_operacion uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE result jsonb; mail text := lower(trim(p_datos->>'email')); cid uuid;
BEGIN
  result := tca_private.start_operation(p_operacion,'contacto',p_datos); IF result IS NOT NULL THEN RETURN result; END IF;
  IF mail IS NULL OR mail !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR length(mail)>200
    OR length(COALESCE(p_datos->>'nombre','')) NOT BETWEEN 3 AND 200 OR length(COALESCE(p_datos->>'telefono',''))>30 THEN RAISE EXCEPTION 'Revisa los datos de contacto.'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(mail,1));
  IF (SELECT count(*) FROM public.contactos WHERE email=mail AND created_at>now()-interval '1 hour')>=3 THEN RAISE EXCEPTION 'Tu solicitud ya fue recibida. Espera antes de enviar otra.'; END IF;
  INSERT INTO public.contactos(tipo,nombre,email,telefono,operacion_id) VALUES(p_datos->>'tipo',p_datos->>'nombre',mail,COALESCE(p_datos->>'telefono',''),p_operacion) RETURNING id INTO cid;
  RETURN tca_private.finish_operation(p_operacion,'contacto',p_datos,jsonb_build_object('id',cid));
END;
$$;
CREATE FUNCTION public.tca_contactos() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM tca_private.require_role(ARRAY['GERENCIA','VENTAS']);
  RETURN COALESCE((SELECT jsonb_agg(to_jsonb(c) ORDER BY created_at DESC) FROM public.contactos c),'[]');
END;
$$;

-- Remove ALL legacy permissive policies, including policies on pre-existing tables.
DO $$ DECLARE p record; t text; f record; BEGIN
  FOR p IN SELECT * FROM pg_policies WHERE schemaname='public' AND tablename=ANY(ARRAY[
    'productos','pedidos','pedido_lineas','perfiles','clientes','movimientos','reservas','compras','compra_lineas','contactos','importaciones']) LOOP
    EXECUTE format('DROP POLICY %I ON public.%I',p.policyname,p.tablename);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['productos','pedidos','pedido_lineas','perfiles','clientes','movimientos','reservas','compras','compra_lineas','contactos','importaciones'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon, authenticated',t);
    -- Mutations must use the checked, atomic functions. No browser role gets DML grants.
    EXECUTE format('GRANT SELECT ON public.%I TO authenticated',t);
  END LOOP;
  FOR f IN SELECT proc.oid::regprocedure AS signature FROM pg_proc proc JOIN pg_namespace n ON n.oid=proc.pronamespace
    WHERE n.nspname='public' AND proc.proname LIKE 'tca\_%' ESCAPE '\' LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated',f.signature);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated',f.signature);
  END LOOP;
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA tca_private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA tca_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA tca_private TO authenticated;
GRANT EXECUTE ON FUNCTION tca_private.role() TO authenticated;
CREATE POLICY tca_product_read ON public.productos FOR SELECT TO authenticated USING(tca_private.role() IN ('GERENCIA','VENTAS','ALMACEN'));
CREATE POLICY tca_order_read ON public.pedidos FOR SELECT TO authenticated USING(tca_private.role() IN ('GERENCIA','VENTAS','ALMACEN'));
CREATE POLICY tca_line_read ON public.pedido_lineas FOR SELECT TO authenticated USING(tca_private.role() IN ('GERENCIA','VENTAS','ALMACEN'));
CREATE POLICY tca_profile_read ON public.perfiles FOR SELECT TO authenticated USING(id=auth.uid() OR tca_private.role()='GERENCIA');
CREATE POLICY tca_client_read ON public.clientes FOR SELECT TO authenticated USING(tca_private.role() IN ('GERENCIA','VENTAS'));
CREATE POLICY tca_movement_read ON public.movimientos FOR SELECT TO authenticated USING(tca_private.role() IN ('GERENCIA','ALMACEN'));
CREATE POLICY tca_reserve_read ON public.reservas FOR SELECT TO authenticated USING(tca_private.role() IN ('GERENCIA','VENTAS','ALMACEN'));
CREATE POLICY tca_purchase_read ON public.compras FOR SELECT TO authenticated USING(tca_private.role() IN ('GERENCIA','ALMACEN'));
CREATE POLICY tca_purchase_line_read ON public.compra_lineas FOR SELECT TO authenticated USING(tca_private.role() IN ('GERENCIA','ALMACEN'));
CREATE POLICY tca_contact_read ON public.contactos FOR SELECT TO authenticated USING(tca_private.role() IN ('GERENCIA','VENTAS'));
CREATE POLICY tca_import_read ON public.importaciones FOR SELECT TO authenticated USING(tca_private.role()='GERENCIA');
GRANT EXECUTE ON FUNCTION public.tca_catalogo(),public.tca_enviar_pedido(jsonb,uuid),public.tca_seguimiento(text,uuid),public.tca_contacto(jsonb,uuid) TO anon;
NOTIFY pgrst, 'reload schema';
COMMIT;
