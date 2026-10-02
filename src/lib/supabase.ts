import { supabase as clientSupabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { Product, OrderData } from '@/types';
import { INITIAL_PRODUCTS } from '@/data/products';

// Função para buscar variáveis de ambiente com suporte total tanto a Vite (Lovable) quanto a Next.js
const getEnvVar = (key: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) {
      return (import.meta as any).env[key];
    }
  } catch {}

  try {
    if (typeof process !== 'undefined' && process.env?.[key]) {
      return process.env[key] || '';
    }
  } catch {}

  return '';
};

const supabaseUrl = 
  getEnvVar('VITE_SUPABASE_URL') || 
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL');

const supabaseAnonKey = 
  getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY') || 
  getEnvVar('VITE_SUPABASE_ANON_KEY') || 
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = clientSupabase || (isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null);

/**
 * Upload de imagem ultra-resiliente:
 * 1. Tenta enviar para o Storage do Supabase (bucket: 'store-assets').
 * 2. Se o bucket não existir ou der erro de permissão no Lovable Cloud,
 *    converte para Data URL base64 e salva diretamente no PostgreSQL (coluna text),
 *    garantindo que a imagem NUNCA falhe e fique salva permanentemente na nuvem!
 */
export async function uploadImage(file: File): Promise<string> {
  // 1. Tentar upload no Supabase Storage
  if (supabase) {
    try {
      const ext = file.name.split('.').pop() || 'png';
      const cleanName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `uploads/${cleanName}`;

      const { data, error } = await supabase.storage
        .from('store-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        // Tentar URL pública direta
        const { data: publicData } = supabase.storage
          .from('store-assets')
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          return publicData.publicUrl;
        }

        // Tentar URL assinada de longa duração (10 anos) caso o bucket seja privado
        const { data: signed } = await supabase.storage
          .from('store-assets')
          .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10);

        if (signed?.signedUrl) {
          return signed.signedUrl;
        }
      } else if (error) {
        console.warn('Aviso: Supabase Storage retornou erro, usando fallback direto no banco:', error.message);
      }
    } catch (err) {
      console.warn('Erro ao acessar Supabase Storage:', err);
    }
  }

  // 2. Fallback infalível: Converte para Data URL (Base64)
  // Como o PostgreSQL aceita strings longas na coluna image_url e logo_url,
  // a imagem fica salva permanentemente no banco sem depender do bucket de storage!
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Falha ao processar arquivo'));
      }
    };
    reader.onerror = () => reject(new Error('Erro na leitura do arquivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Carrega produtos, configurações e pedidos do Supabase
 */
export async function fetchStoreData() {
  if (supabase) {
    try {
      const [productsRes, settingsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('store_settings').select('*').limit(1).maybeSingle(),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
      ]);

      const products: Product[] = productsRes.data && productsRes.data.length > 0
        ? productsRes.data.map((p: any) => ({
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
        logoUrl: (settingsRes.data as any).logo_url || null,
        banner1Image: (settingsRes.data as any).banner1_image || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&auto=format&fit=crop&q=80',
        banner2Image: (settingsRes.data as any).banner2_image || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1000&auto=format&fit=crop&q=80',
        whatsappNumber: (settingsRes.data as any).whatsapp_number || '5551999999999',
      } : null;

      return {
        products,
        settings,
        orders: ((ordersRes.data as unknown) as OrderData[]) || [],
      };
    } catch (err) {
      console.warn('Erro ao consultar Supabase:', err);
    }
  }

  return { products: INITIAL_PRODUCTS, settings: null, orders: [] as OrderData[] };
}

/**
 * Salva produto no Supabase
 */
export async function syncProduct(product: Product) {
  if (supabase) {
    try {
      await (supabase as any).from('products').upsert({
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
 * Salva configurações da loja no Supabase
 */
export async function syncSettings(settings: {
  logoUrl: string | null;
  banner1Image: string;
  banner2Image: string;
  whatsappNumber: string;
}) {
  if (supabase) {
    try {
      await (supabase as any).from('store_settings').upsert({
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
  if (supabase) {
    try {
      await (supabase as any).from('orders').insert({
        id: order.id || String(Date.now()),
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
        shipping_option: order.shippingOption as any,
        items: order.items as any,
        total: order.total,
        status: order.status,
      });
    } catch (err) {
      console.error('Erro ao registrar pedido no Supabase:', err);
    }
  }
}
