import { createClient } from '@supabase/supabase-js';
import { Product, OrderData } from '@/types';
import { INITIAL_PRODUCTS } from '@/data/products';

// Suporta tanto o padrão Next.js (NEXT_PUBLIC_*) quanto o padrão Lovable/Vite (VITE_*)
const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL || 
  '';

const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY || 
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Upload de imagem direto para o Storage do Supabase (bucket: 'store-assets')
 * Se o Supabase não estiver conectado, faz fallback para a API local /api/upload
 */
export async function uploadImage(file: File): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    try {
      const ext = file.name.split('.').pop() || 'png';
      const cleanName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `uploads/${cleanName}`;

      const { data, error } = await supabase.storage
        .from('store-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.warn('Erro ao subir para Supabase Storage, usando API local:', error);
      } else if (data) {
        // Bucket privado: gera link assinado de longa duração (10 anos)
        const { data: signed, error: signErr } = await supabase.storage
          .from('store-assets')
          .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10);
        if (signErr || !signed) throw signErr || new Error('Falha ao gerar link');
        return signed.signedUrl;
      }
    } catch (err) {
      console.warn('Erro na chamada Supabase Storage:', err);
    }
  }

  throw new Error('Falha no upload do arquivo');
}

/**
 * Carrega produtos, configurações e pedidos do Supabase (com fallback local)
 */
export async function fetchStoreData() {
  if (isSupabaseConfigured && supabase) {
    try {
      const [productsRes, settingsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('store_settings').select('*').limit(1).maybeSingle(),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
      ]);

      const products: Product[] = productsRes.data && productsRes.data.length > 0
        ? productsRes.data.map((p) => ({
            id: String(p.id),
            name: p.name,
            price: Number(p.price),
            pixPrice: Number(p.pix_price),
            promoTag: p.promo_tag || '',
            imageUrl: p.image_url || '',
            isSoldOut: Boolean(p.is_sold_out),
            isFeatured: Boolean(p.is_featured),
          }))
        : INITIAL_PRODUCTS;

      const settings = settingsRes.data ? {
        logoUrl: settingsRes.data.logo_url || null,
        banner1Image: settingsRes.data.banner1_image || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&auto=format&fit=crop&q=80',
        banner2Image: settingsRes.data.banner2_image || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1000&auto=format&fit=crop&q=80',
        whatsappNumber: settingsRes.data.whatsapp_number || '5551999999999',
      } : null;

      return {
        products,
        settings,
        orders: (ordersRes.data as OrderData[]) || [],
      };
    } catch (err) {
      console.warn('Erro ao consultar Supabase, usando API local:', err);
    }
  }

  return { products: INITIAL_PRODUCTS, settings: null, orders: [] as OrderData[] };
}

/**
 * Salva produto no Supabase (ou localmente)
 */
export async function syncProduct(product: Product) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('products').upsert({
        id: product.id,
        name: product.name,
        price: product.price,
        pix_price: product.pixPrice,
        promo_tag: product.promoTag,
        image_url: product.imageUrl,
        is_sold_out: product.isSoldOut,
        is_featured: product.isFeatured || false,
      });
    } catch (err) {
      console.error('Erro ao sincronizar produto no Supabase:', err);
    }
  }
}

/**
 * Salva configurações da loja no Supabase (ou localmente)
 */
export async function syncSettings(settings: {
  logoUrl: string | null;
  banner1Image: string;
  banner2Image: string;
  whatsappNumber: string;
}) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('store_settings').upsert({
        id: 1,
        logo_url: settings.logoUrl,
        banner1_image: settings.banner1Image,
        banner2_image: settings.banner2Image,
        whatsapp_number: settings.whatsappNumber,
      });
    } catch (err) {
      console.error('Erro ao sincronizar settings no Supabase:', err);
    }
  }
}

/**
 * Salva novo pedido no Supabase
 */
export async function syncOrder(order: OrderData) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('orders').insert({
        id: order.id,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        customer_cpf: order.customerCpf,
        customer_email: order.customerEmail,
        cep: order.cep,
        street: order.street,
        number: order.number,
        neighborhood: order.neighborhood,
        city: order.city,
        state: order.state,
        shipping_option: order.shippingOption,
        items: order.items,
        total: order.total,
        status: order.status,
      });
    } catch (err) {
      console.error('Erro ao registrar pedido no Supabase:', err);
    }
  }
}
