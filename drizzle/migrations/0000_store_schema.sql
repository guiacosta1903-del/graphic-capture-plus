CREATE TABLE public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL,
  pix_price numeric NOT NULL,
  promo_tag text DEFAULT '',
  image_url text DEFAULT '',
  is_sold_out boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin insert products" ON public.products FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin update products" ON public.products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.store_settings (
  id int PRIMARY KEY DEFAULT 1,
  logo_url text,
  banner1_image text,
  banner2_image text,
  whatsapp_number text DEFAULT '5551999999999',
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.store_settings TO anon, authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON public.store_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin insert settings" ON public.store_settings FOR INSERT TO anon, authenticated WITH CHECK (id = 1);
CREATE POLICY "Admin update settings" ON public.store_settings FOR UPDATE TO anon, authenticated USING (id = 1) WITH CHECK (id = 1);

CREATE TABLE public.orders (
  id text PRIMARY KEY,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_cpf text,
  customer_email text,
  cep text,
  street text,
  number text,
  neighborhood text,
  city text,
  state text,
  shipping_option jsonb,
  items jsonb NOT NULL,
  total numeric NOT NULL,
  status text DEFAULT 'paid',
  created_at timestamptz DEFAULT now()
);
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Checkout insert orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public read store-assets" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'store-assets');
CREATE POLICY "Public upload store-assets" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'store-assets');

INSERT INTO public.store_settings (id, banner1_image, banner2_image) VALUES
(1, 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1000&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id,name,price,pix_price,promo_tag,image_url,is_sold_out,is_featured) VALUES
('1','Renato 1983 - Herói do Mundial',8,7.2,'LEVE 3 POR R$ 20 NO PIX','https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',false,true),
('2','Taça Libertadores 2017 - Tri da América',8,7.2,'ATÉ 35% OFF NO COMBO','https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',false,true),
('3','Arena do Grêmio - Noite de Copa',8.5,7.65,'MAIS VENDIDO DA ARQUIBANCADA','https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',false,true),
('4','Diego Souza - O Cravador',8,7.2,'LEVE 3 POR R$ 20 NO PIX','https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',false,false),
('5','Luis Suárez - El Pistolero 2023',9,8.1,'EDIÇÃO LIMITADA COLECIONADOR','https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80',true,false),
('6','Copa do Brasil 2016 - Rei de Copas',8,7.2,'LEVE 3 POR R$ 20 NO PIX','https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&auto=format&fit=crop&q=80',false,false),
('7','Trapo Geral do Grêmio - Barra Brava',8,7.2,'ATÉ 35% OFF NO COMBO','https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',false,false),
('8','Adesivo Holográfico - Imortal Tricolor',10,9,'VINIL HOLOGRÁFICO ESPECIAL','https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',true,false),
('9','Brasão Histórico 1903 Retrô',8,7.2,'LEVE 3 POR R$ 20 NO PIX','https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80',false,false),
('10','Frase: "Com o Grêmio Onde o Grêmio Estiver"',8,7.2,'CLÁSSICO DA TORCIDA','https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=600&auto=format&fit=crop&q=80',false,false),
('11','Mosqueteiro Raiz - Mascote Imortal',8,7.2,'LEVE 3 POR R$ 20 NO PIX','https://images.unsplash.com/photo-1579783902263-0004f144e555?w=600&auto=format&fit=crop&q=80',false,false),
('12','Patch Bordado / Adesivo Texturizado Grêmio',12,10.8,'EDIÇÃO LIMITADA','https://images.unsplash.com/photo-1569388330292-79cc1ec67270?w=600&auto=format&fit=crop&q=80',true,false)
ON CONFLICT (id) DO NOTHING;