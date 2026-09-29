'use client';

import React from 'react';
import { Product } from '@/types';
import { StickerArt } from './StickerArt';
import { ShoppingBag, Ban } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { isSoldOut, name, promoTag, price, pixPrice, id } = product;

  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-2xl p-4 transition-all duration-200 border border-zinc-200/80 shadow-sm hover:shadow-md">
      
      {/* 1. STICKER IMAGE CONTAINER */}
      <div className="relative w-full aspect-square flex items-center justify-center p-3 mb-3 bg-zinc-50/50 rounded-xl overflow-hidden">
        
        {/* Die-cut sticker graphic (Grayscale when sold out) */}
        <div 
          className={`w-full h-full flex items-center justify-center transition-all duration-300 ${
            isSoldOut 
              ? 'filter grayscale contrast-50 opacity-40 scale-95' 
              : 'group-hover:scale-105'
          }`}
        >
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={name} 
              className="w-full h-full object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.18)] select-none"
            />
          ) : (
            <StickerArt id={id} name={name} />
          )}
        </div>

        {/* TARJA LONGITUDINAL ATRAVESSADA "ESGOTADO" (Requisito explícito) */}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-hidden">
            <div className="w-[140%] -rotate-[28deg] bg-zinc-900/90 text-white border-y-2 border-red-500/80 py-1.5 shadow-2xl flex items-center justify-center">
              <span className="font-black text-xs sm:text-sm tracking-[0.25em] uppercase text-white drop-shadow-md">
                ESGOTADO
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. PRODUCT INFO (Exatamente no padrão da Imagem 2) */}
      <div className="flex flex-col flex-grow text-left">
        {/* Tag de Promoção superior em tom suave */}
        <div className="h-4 mb-1">
          {promoTag && (
            <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 uppercase tracking-tight block truncate">
              {promoTag}
            </span>
          )}
        </div>

        {/* Nome do Modelo */}
        <h3 className="font-bold text-sm sm:text-base text-zinc-900 leading-snug line-clamp-2 min-h-[2.5rem] mb-2">
          {name}
        </h3>

        {/* Preço Normal e Preço com Transferência/Pix em Destaque */}
        <div className="mt-auto mb-3">
          <div className="text-base sm:text-lg font-black text-zinc-900 leading-tight">
            R$ {price.toFixed(2).replace('.', ',')}
          </div>
          <div className="text-xs sm:text-sm font-bold text-amber-600 flex items-center gap-1">
            <span>R$ {pixPrice.toFixed(2).replace('.', ',')}</span>
            <span className="text-[11px] font-semibold text-amber-700/80">no Pix</span>
          </div>
        </div>
      </div>

      {/* 3. CTA BUTTON */}
      <div>
        {isSoldOut ? (
          <button
            disabled
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <Ban className="w-4 h-4" />
            <span>Esgotado</span>
          </button>
        ) : (
          <button
            onClick={() => onAddToCart(product)}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-zinc-100 hover:bg-sky-500 text-zinc-800 hover:text-white transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 shadow-sm hover:shadow"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Comprar</span>
          </button>
        )}
      </div>

    </div>
  );
};
