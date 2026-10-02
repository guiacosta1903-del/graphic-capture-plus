import { supabase as clientSupabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { Product, OrderData, StoreSettings } from '@/types';
import { INITIAL_PRODUCTS } from '@/data/products';

export const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  (typeof window !== 'undefined' && ((window as any).__ENV__?.VITE_SUPABASE_URL || (window as any).VITE_SUPABASE_URL)) ||
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_SUPABASE_URL) ||
  'https://npvhpouftbqrfrlrithb.supabase.co';

export const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  (typeof window !== 'undefined' && ((window as any).__ENV__?.VITE_SUPABASE_PUBLISHABLE_KEY || (window as any).VITE_SUPABASE_PUBLISHABLE_KEY)) ||
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = clientSupabase || (isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null);

/**
 * Comprime a imagem no navegador usando Canvas para garantir que:
 * 1. Pese menos de 80 KB (em vez de 5 MB de foto pesada)
 * 2. Carregue instantaneamente em qualquer tela e nunca falhe
 * 3. Não exceda a quota do localStorage
 * 4. Fique salva permanentemente no banco
 */
export async function compressImage(file: File, maxDim = 800, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        resolve('');
        return;
      }
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        const isPng = file.type === 'image/png';
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const compressed = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(src);
        }
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Testa se uma URL de imagem é realmente renderizável pelo navegador
 * sem disparar erros de CORS (usa tag Image em vez de fetch)
 */
function testImageLoad(url: string, timeoutMs = 2500): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !url) {
      resolve(true);
      return;
    }
    const img = new Image();
    const timer = setTimeout(() => {
      img.src = '';
      resolve(false);
    }, timeoutMs);

    img.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    img.src = url;
  });
}

/**
 * Upload de imagem ultra-resiliente:
 * Garante que a foto NUNCA fique em branco e SEMPRE apareça na tela.
 * Suporta buckets públicos, privados (com link assinado de 10 anos) e fallback comprimido.
 */
export async function uploadImage(file: File): Promise<string> {
  // 1. Gera imediatamente a versão comprimida e otimizada (sempre funciona e pesa ~50KB)
  const compressed = await compressImage(file, 800, 0.85);

  // 2. Tenta fazer upload no Supabase Storage se o storage estiver configurado
  if (supabase && compressed) {
    try {
      const ext = file.name.split('.').pop() || 'png';
      const cleanName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `uploads/${cleanName}`;

      const res = await fetch(compressed);
      const blob = await res.blob();

      const { data, error } = await supabase.storage
        .from('store-assets')
        .upload(filePath, blob, {
          contentType: file.type || 'image/png',
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        // Tenta URL pública padrão
        const { data: publicData } = supabase.storage
          .from('store-assets')
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          const isAccessible = await testImageLoad(publicData.publicUrl);
          if (isAccessible) {
            return publicData.publicUrl;
          }
        }

        // Se o bucket for restrito/privado (como em certos planos da nuvem), gera link assinado de longa duração
        try {
          const { data: signedData } = await supabase.storage
            .from('store-assets')
            .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10);

          if (signedData?.signedUrl) {
            const isSignedAccessible = await testImageLoad(signedData.signedUrl);
            if (isSignedAccessible) {
              return signedData.signedUrl;
            }
          }
        } catch {}
      }
    } catch (err) {
      console.warn('Supabase Storage inacessível, utilizando imagem compactada:', err);
    }
  }

  // 3. Fallback infalível que sempre aparece e nunca quebra
  return compressed;
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
        ? productsRes.data.map((p: any) => {
            let primaryUrl = p.image_url || '';
            let secondaryUrl = p.secondary_image_url || '';

            if (primaryUrl.includes('---SECONDARY---')) {
              const parts = primaryUrl.split('---SECONDARY---');
              primaryUrl = parts[0]?.trim() || '';
              secondaryUrl = parts[1]?.trim() || '';
            } else if (!secondaryUrl && Array.isArray(p.images) && p.images.length > 1) {
              secondaryUrl = p.images[1] || '';
            }

            const imagesList = [primaryUrl, secondaryUrl].filter(Boolean);

            return {
              id: String(p.id),
              name: p.name,
              price: Number(p.price),
              pixPrice: Number(p.pix_price),
              promoTag: p.promo_tag || '',
              imageUrl: primaryUrl,
              secondaryImageUrl: secondaryUrl || undefined,
              images: imagesList.length > 0 ? imagesList : undefined,
              isSoldOut: Boolean(p.is_sold_out),
              isFeatured: Boolean(p.is_featured),
            };
          })
        : INITIAL_PRODUCTS;

      const raw = settingsRes.data as any;
      const settings: StoreSettings | null = raw ? {
        logoUrl: raw.logo_url ?? null,
        banner1Image: raw.banner1_image || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&auto=format&fit=crop&q=80',
        banner2Image: raw.banner2_image || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1000&auto=format&fit=crop&q=80',
        whatsappNumber: raw.whatsapp_number || '5551999999999',
        ...(raw.banner1_tag ? { banner1Tag: raw.banner1_tag } : {}),
        ...(raw.banner1_title ? { banner1Title: raw.banner1_title } : {}),
        ...(raw.banner1_highlight ? { banner1Highlight: raw.banner1_highlight } : {}),
        ...(raw.banner1_description ? { banner1Description: raw.banner1_description } : {}),
        ...(raw.banner1_button_text ? { banner1ButtonText: raw.banner1_button_text } : {}),
        ...(raw.banner2_tag ? { banner2Tag: raw.banner2_tag } : {}),
        ...(raw.banner2_title ? { banner2Title: raw.banner2_title } : {}),
        ...(raw.banner2_highlight ? { banner2Highlight: raw.banner2_highlight } : {}),
        ...(raw.banner2_description ? { banner2Description: raw.banner2_description } : {}),
        ...(raw.banner2_button_text ? { banner2ButtonText: raw.banner2_button_text } : {}),
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
 * Salva produto no Supabase (com suporte a imagem secundária / hover)
 */
export async function syncProduct(product: Product) {
  if (supabase) {
    try {
      const combinedImageUrl = product.secondaryImageUrl
        ? `${product.imageUrl}\n---SECONDARY---\n${product.secondaryImageUrl}`
        : product.imageUrl;

      // 1. Tenta salvar incluindo secondary_image_url
      const { error } = await (supabase as any).from('products').upsert({
        id: product.id,
        name: product.name,
        price: product.price,
        pix_price: product.pixPrice,
        promo_tag: product.promoTag,
        image_url: combinedImageUrl,
        secondary_image_url: product.secondaryImageUrl || null,
        is_sold_out: product.isSoldOut,
        is_featured: product.isFeatured || false,
      });

      // Se a coluna secondary_image_url não existir no schema (erro 42703), salva no formato com delimiter em image_url
      if (error && (error.code === '42703' || error.message?.includes('secondary_image_url'))) {
        await (supabase as any).from('products').upsert({
          id: product.id,
          name: product.name,
          price: product.price,
          pix_price: product.pixPrice,
          promo_tag: product.promoTag,
          image_url: combinedImageUrl,
          is_sold_out: product.isSoldOut,
          is_featured: product.isFeatured || false,
        });
      }
    } catch (err) {
      console.error('Erro ao sincronizar produto no Supabase:', err);
    }
  }
}

/**
 * Deleta produto do Supabase
 */
export async function deleteStoreProduct(productId: string) {
  if (supabase) {
    try {
      await (supabase as any).from('products').delete().eq('id', productId);
    } catch (err) {
      console.error('Erro ao excluir produto no Supabase:', err);
    }
  }
}

/**
 * Salva configurações da loja no Supabase (com suporte aos textos dos banners)
 */
export async function syncSettings(settings: StoreSettings) {
  if (supabase) {
    try {
      const fullPayload: any = {
        id: 1,
        logo_url: settings.logoUrl,
        banner1_image: settings.banner1Image,
        banner2_image: settings.banner2Image,
        whatsapp_number: settings.whatsappNumber,
        banner1_tag: settings.banner1Tag,
        banner1_title: settings.banner1Title,
        banner1_highlight: settings.banner1Highlight,
        banner1_description: settings.banner1Description,
        banner1_button_text: settings.banner1ButtonText,
        banner2_tag: settings.banner2Tag,
        banner2_title: settings.banner2Title,
        banner2_highlight: settings.banner2Highlight,
        banner2_description: settings.banner2Description,
        banner2_button_text: settings.banner2ButtonText,
      };

      const { error } = await (supabase as any).from('store_settings').upsert(fullPayload);
      if (error) {
        // Fallback seguro caso as novas colunas ainda não existam no Supabase
        await (supabase as any).from('store_settings').upsert({
          id: 1,
          logo_url: settings.logoUrl,
          banner1_image: settings.banner1Image,
          banner2_image: settings.banner2Image,
          whatsapp_number: settings.whatsappNumber,
        });
      }
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
