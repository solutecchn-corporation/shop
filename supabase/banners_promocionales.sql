-- ══════════════════════════════════════════════════════════════════
--  TABLA: banners_promocionales
--  Úsala en: Supabase > SQL Editor > New Query
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.banners_promocionales (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titulo       TEXT,                          -- Título que aparece sobre la imagen
  subtitulo    TEXT,                          -- Texto secundario opcional
  imagen_url   TEXT       NOT NULL,           -- URL pública desde el bucket 'banners-promocionales'
  enlace       TEXT,                          -- URL de destino al hacer clic (opcional)
  orden        INTEGER    NOT NULL DEFAULT 0, -- Orden de aparición (menor = primero)
  activo       BOOLEAN    NOT NULL DEFAULT TRUE,
  fecha_inicio DATE,                          -- NULL = sin restricción de inicio
  fecha_fin    DATE,                          -- NULL = sin restricción de fin
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Actualización automática de updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS banners_updated_at ON public.banners_promocionales;
CREATE TRIGGER banners_updated_at
  BEFORE UPDATE ON public.banners_promocionales
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Índice para consultas rápidas de banners activos ordenados ──
CREATE INDEX IF NOT EXISTS idx_banners_activos
  ON public.banners_promocionales (activo, orden)
  WHERE activo = TRUE;

-- ══════════════════════════════════════════════════════════════════
--  POLÍTICAS RLS
-- ══════════════════════════════════════════════════════════════════

ALTER TABLE public.banners_promocionales ENABLE ROW LEVEL SECURITY;

-- Lectura pública (visitantes sin autenticar)
CREATE POLICY "banners_select_public"
  ON public.banners_promocionales
  FOR SELECT
  USING (true);

-- Solo usuarios autenticados/admin pueden insertar, actualizar y borrar
-- (Ajusta el role o la condición según tu sistema de autenticación)
CREATE POLICY "banners_insert_admin"
  ON public.banners_promocionales
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "banners_update_admin"
  ON public.banners_promocionales
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "banners_delete_admin"
  ON public.banners_promocionales
  FOR DELETE
  USING (auth.role() = 'authenticated');


-- ══════════════════════════════════════════════════════════════════
--  STORAGE BUCKET: banners-promocionales
--  Ejecuta esto en Supabase > SQL Editor
-- ══════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banners-promocionales',
  'banners-promocionales',
  TRUE,                          -- Acceso público (URLs sin token)
  5242880,                       -- 5 MB máx por imagen
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Política de lectura pública para el bucket
CREATE POLICY "banners_storage_public_read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'banners-promocionales');

-- Política de subida solo para autenticados
CREATE POLICY "banners_storage_auth_insert"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'banners-promocionales'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "banners_storage_auth_update"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'banners-promocionales'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "banners_storage_auth_delete"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'banners-promocionales'
    AND auth.role() = 'authenticated'
  );


-- ══════════════════════════════════════════════════════════════════
--  DATOS DE EJEMPLO (opcional)
-- ══════════════════════════════════════════════════════════════════
-- INSERT INTO public.banners_promocionales
--   (titulo, subtitulo, imagen_url, enlace, orden, activo)
-- VALUES
--   ('Promo Marzo', '20% en Electrónica',
--    'https://ooiklfrvtokofzomzksu.supabase.co/storage/v1/object/public/banners-promocionales/promo-marzo.jpg',
--    NULL, 1, TRUE),
--   ('Repuestos en stock', 'Envío a toda la isla',
--    'https://ooiklfrvtokofzomzksu.supabase.co/storage/v1/object/public/banners-promocionales/repuestos.jpg',
--    NULL, 2, TRUE);
