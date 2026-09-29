'use client';

import React from 'react';
import { ShoppingBag, ShieldCheck, Flame } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  logoUrl?: string | null;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, logoUrl, onOpenCart, onOpenAdmin }) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 text-white">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 py-1.5 px-4 text-center text-xs font-semibold tracking-wider text-white flex items-center justify-center gap-2 shadow-inner">
        <Flame className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
        <span>PROMOÇÃO TRICOLOR: LEVE 3 POR R$ 20 NO PIX • FRETE ECONÔMICO BRASIL</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo Oficial da Marca (Grande sem inflar a barra preta) */}
        <div className="relative flex items-center z-50">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Grêmio Stickers" 
              className="h-[90px] sm:h-[110px] w-auto max-w-[320px] object-contain select-none drop-shadow-2xl -mb-7 sm:-mb-10 transition-transform hover:scale-105" 
            />
          ) : (
            <div className="h-10 sm:h-12 px-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-2 shadow-lg">
              <span className="font-black text-sky-400 text-lg tracking-tighter">GS</span>
              <span className="font-black text-white text-xs sm:text-sm uppercase tracking-tight">Grêmio Stickers</span>
            </div>
          )}
        </div>

        {/* Right Actions: Admin shortcut + Live Cart */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAdmin}
            className="text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition"
            title="Acesso Lojista"
          >
            Painel Admin
          </button>

          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold px-3.5 py-2 rounded-xl transition shadow-lg shadow-sky-500/25 active:scale-95"
          >
            <ShoppingBag className="w-5 h-5 text-zinc-950" />
            <span className="text-sm hidden sm:inline">Carrinho</span>
            {cartCount > 0 && (
              <span className="bg-zinc-950 text-sky-400 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center border border-sky-400 animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
