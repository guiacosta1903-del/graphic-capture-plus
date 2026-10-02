-- Garante a criação do bucket público store-assets no Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-assets', 'store-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de acesso público para o bucket store-assets
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read store-assets'
  ) THEN
    CREATE POLICY "Public read store-assets" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'store-assets');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public upload store-assets'
  ) THEN
    CREATE POLICY "Public upload store-assets" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'store-assets');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public update store-assets'
  ) THEN
    CREATE POLICY "Public update store-assets" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'store-assets');
  END IF;
END $$;
