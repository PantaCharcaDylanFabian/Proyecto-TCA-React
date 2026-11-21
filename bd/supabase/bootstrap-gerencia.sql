-- Execute as database owner in Supabase SQL Editor AFTER migration 003.
-- First create/invite the account in Authentication > Users.
-- Initial manager email supplied by the user. No password or privileged key.
DO $$
DECLARE
  correo text := 'volklated@gmail.com';
  usuario uuid;
BEGIN
  IF correo = 'REEMPLAZAR_POR_CORREO_DE_GERENCIA' THEN
    RAISE EXCEPTION 'Edita el correo de Gerencia antes de ejecutar este archivo.';
  END IF;
  SELECT id INTO STRICT usuario FROM auth.users WHERE lower(email)=lower(trim(correo));
  INSERT INTO public.perfiles(id,nombre,rol,activo)
    VALUES(usuario,'Gerencia TCA','GERENCIA',true)
    ON CONFLICT(id) DO UPDATE SET rol='GERENCIA',activo=true;
END $$;
