'use client';

import React, { useState, useRef } from 'react';
import { INITIAL_PRODUCTS } from '@/data/products';
import { Product, CartItem, OrderData } from '@/types';
import { Header } from '@/components/Header';
import { PromoBanners } from '@/components/PromoBanners';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { AdminModal } from '@/components/AdminModal';
import { MessageCircle, Truck, Zap, ShieldCheck, Sparkles } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);

  // Store visual settings (Logo, Banners, WhatsApp)
  const [storeSettings, setStoreSettings] = useState({
    logoUrl: null as string | null,
    banner1Image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&auto=format&fit=crop&q=80',
    banner2Image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1000&auto=format&fit=crop&q=80',
    whatsappNumber: '5551999999999',
  });

  // Carregar do localStorage ao iniciar
  React.useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('gs_products');
      if (savedProducts) setProducts(JSON.parse(savedProducts));

      const savedSettings = localStorage.getItem('gs_settings');
      if (savedSettings) setStoreSettings(JSON.parse(savedSettings));

      const savedOrders = localStorage.getItem('gs_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch (e) {
      console.error('Erro ao ler localStorage', e);
    }
  }, []);

  // Salvar no localStorage sempre que houver alterações
  const handleUpdateStoreSettings = (newSettings: typeof storeSettings) => {
    setStoreSettings(newSettings);
    try {
      localStorage.setItem('gs_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.error('Erro ao salvar settings no localStorage', e);
    }
  };

  const handleUpdateProducts = (updater: (prev: Product[]) => Product[]) => {
    setProducts((prev) => {
      const updated = updater(prev);
      try {
        localStorage.setItem('gs_products', JSON.stringify(updated));
      } catch (e) {
        console.error('Erro ao salvar produtos no localStorage', e);
      }
      return updated;
    });
  };

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const catalogRef = useRef<HTMLDivElement>(null);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    if (product.isSoldOut) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Proceed to Checkout
  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = (newOrder: OrderData) => {
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem('gs_orders', JSON.stringify(updated));
      } catch (e) {
        console.error('Erro ao salvar pedidos no localStorage', e);
      }
      return updated;
    });
    setCart([]); // Clear cart
  };

  // Admin operations com persistência
  const handleToggleSoldOut = (productId: string) => {
    handleUpdateProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, isSoldOut: !p.isSoldOut } : p
      )
    );
  };

  const handleAddProduct = (newProd: Product) => {
    handleUpdateProducts((prev) => [newProd, ...prev]);
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Header Fixo com suporte a Logo customizável */}
      <Header
        cartCount={totalCartCount}
        logoUrl={storeSettings.logoUrl}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20">
        {/* 1. SEÇÃO DE BANNERS (Referência Imagem 1) */}
        <PromoBanners 
          onScrollToCatalog={scrollToCatalog}
          banner1Image={storeSettings.banner1Image}
          banner2Image={storeSettings.banner2Image}
        />

        {/* 2. CATÁLOGO / GRADE DE PRODUTOS (Referência Imagem 2) */}
        <section ref={catalogRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          
          {/* Seção Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-zinc-200 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <h2 className="text-xl sm:text-2xl font-black text-zinc-950 uppercase tracking-tight">
                  Adesivos Disponíveis
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                Corte no contorno especial • Vinil fosco ou brilhante de alta gramatura
              </p>
            </div>

            {/* Micro Badge informativa */}
            <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-600 shadow-sm self-start sm:self-auto">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Desconto de 10% já incluso no Pix</span>
            </div>
          </div>

          {/* Grid de Cards (2 colunas mobile, 3 tablet, 4 ou 5 desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {/* Banner de Garantia e Confiança pós-grade */}
          <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 mb-1">Envio com Proteção Anti-Dobra</h4>
              <p className="text-xs text-zinc-500 max-w-xs">
                Seus adesivos chegam perfeitamente retos em embalagem reforçada para todo o Brasil.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 mb-1">Baixa Automática no Pix</h4>
              <p className="text-xs text-zinc-500 max-w-xs">
                Pagou pelo QR Code, seu pedido já entra na fila de envio na mesma hora.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-800 flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-zinc-900 mb-1">Vinil Imortal Tricolor</h4>
              <p className="text-xs text-zinc-500 max-w-xs">
                Tinta resistente a raios UV e umidade. Não desbota no sol nem descola na garrafa térmica.
              </p>
            </div>
          </div>

        </section>
      </main>

      {/* Floating WhatsApp Action Button */}
      <a
        href={`https://wa.me/${storeSettings.whatsappNumber}?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20Gr%C3%AAmio%20Stickers%20e%20gostaria%20de%20tirar%20uma%20d%C3%BAvida.`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-5 right-5 z-40 bg-emerald-500 hover:bg-emerald-400 text-white p-3.5 sm:p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition flex items-center justify-center border-2 border-white"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
      </a>

      {/* Footer simples */}
      <footer className="bg-zinc-950 text-zinc-400 py-8 border-t border-zinc-800 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-white tracking-wider uppercase">
            Grêmio Stickers • Feito por torcedores para a Geral
          </p>
          <p className="text-zinc-500">
            Adesivos colecionáveis e personalizados • Porto Alegre / RS
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-zinc-600 hover:text-zinc-400 text-[11px] underline"
            >
              Acesso Administrativo (Lojista)
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onOrderCompleted={handleOrderCompleted}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        orders={orders}
        storeSettings={storeSettings}
        onUpdateStoreSettings={handleUpdateStoreSettings}
        onToggleSoldOut={handleToggleSoldOut}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
}
