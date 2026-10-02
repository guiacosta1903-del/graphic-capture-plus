-- =======================================================
-- SCHEMA SQL PARA O E-COMMERCE GRÊMIO STICKERS (SUPABASE)
-- =======================================================

-- 1. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  pix_price NUMERIC(10, 2) NOT NULL,
  promo_tag TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  is_sold_out BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para produtos
CREATE POLICY "Produtos são públicos para leitura" 
  ON public.products FOR SELECT 
  USING (true);

CREATE POLICY "Permitir inserção e atualização de produtos" 
  ON public.products FOR ALL 
  USING (true) 
  WITH CHECK (true);


-- 2. TABELA DE CONFIGURAÇÕES DA LOJA (LOGO, BANNERS, WHATSAPP)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id INT PRIMARY KEY DEFAULT 1,
  logo_url TEXT,
  banner1_image TEXT,
  banner2_image TEXT,
  whatsapp_number TEXT DEFAULT '5551999999999',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Configurações da loja são públicas para leitura" 
  ON public.store_settings FOR SELECT 
  USING (true);

CREATE POLICY "Permitir atualização de configurações" 
  ON public.store_settings FOR ALL 
  USING (true) 
  WITH CHECK (true);


-- 3. TABELA DE PEDIDOS
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_cpf TEXT,
  customer_email TEXT,
  cep TEXT,
  street TEXT,
  number TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  shipping_option JSONB,
  items JSONB NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'paid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de pedidos" 
  ON public.orders FOR SELECT 
  USING (true);

CREATE POLICY "Permitir inserção de novos pedidos" 
  ON public.orders FOR INSERT 
  WITH CHECK (true);


-- 4. BUCKET DE ARMAZENAMENTO PARA FOTOS (STORE-ASSETS)
-- Criação do bucket público para upload de logo, banners e adesivos
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-assets', 'store-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de leitura e gravação no bucket
CREATE POLICY "Imagens públicas para visualização"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'store-assets');

CREATE POLICY "Permitir upload de fotos no bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'store-assets');

CREATE POLICY "Permitir atualização de fotos no bucket"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'store-assets');
