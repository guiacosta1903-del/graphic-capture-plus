'use client';

import React from 'react';
import { CartItem } from '@/types';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { StickerArt } from './StickerArt';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotalNormal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  // Regra de Combo: Se comprar 3 ou mais adesivos, preço especial de R$ 6,66 cada (3 por R$ 20)
  const isComboActive = totalQuantity >= 3;
  const subtotalPix = isComboActive 
    ? (totalQuantity * (20 / 3)) 
    : items.reduce((acc, item) => acc + item.product.pixPrice * item.quantity, 0);

  const savings = Math.max(0, subtotalNormal - subtotalPix);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white text-zinc-900 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900">
                Seu Carrinho
              </h2>
              <p className="text-xs text-zinc-500">
                {totalQuantity} {totalQuantity === 1 ? 'adesivo selecionado' : 'adesivos selecionados'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* COMBO PROGRESS BAR */}
          <div className="p-3.5 bg-sky-50 border-b border-sky-100">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="w-4 h-4 text-sky-600 fill-sky-500" />
              <span className="text-xs font-bold text-sky-900">
                {isComboActive
                  ? '🎉 Combo 3 por R$ 20 ativado!'
                  : `Adicione mais ${3 - totalQuantity} ${3 - totalQuantity === 1 ? 'adesivo' : 'adesivos'} para pagar R$ 20 no trio!`}
              </span>
            </div>
            <div className="w-full bg-sky-200/60 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-sky-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(100, (totalQuantity / 3) * 100)}%` }}
              />
            </div>
          </div>

          {/* ITEM LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-3 text-zinc-300">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <p className="font-bold text-zinc-700 mb-1">Seu carrinho está vazio</p>
                <p className="text-xs text-zinc-400">
                  Escolha seus adesivos favoritos da vitrine para montar seu kit tricolor.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.product.id}
                  className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl"
                >
                  {/* Sticker Thumbnail */}
                  <div className="w-14 h-14 bg-white rounded-lg p-1.5 flex-shrink-0 border border-zinc-200/60 flex items-center justify-center">
                    {item.product.imageUrl ? (
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name} 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <StickerArt id={item.product.id} name={item.product.name} />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-zinc-900 truncate">
                      {item.product.name}
                    </h4>
                    <div className="text-xs text-amber-600 font-bold">
                      R$ {item.product.pixPrice.toFixed(2).replace('.', ',')} no Pix
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-lg p-1">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 hover:bg-zinc-100 rounded text-zinc-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 hover:bg-zinc-100 rounded text-zinc-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-2 text-zinc-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* FOOTER & CHECKOUT ACTION */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-zinc-200 bg-zinc-50 space-y-3">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-500 text-xs">
                  <span>Subtotal:</span>
                  <span className="line-through">R$ {subtotalNormal.toFixed(2).replace('.', ',')}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold text-xs">
                    <span>Economia no Pix/Combo:</span>
                    <span>- R$ {savings.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-900 font-black text-base pt-1 border-t border-zinc-200">
                  <span>Total no Pix:</span>
                  <span className="text-amber-600 text-lg">R$ {subtotalPix.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-black text-sm uppercase tracking-wider rounded-xl transition shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Fechar Pedido no Pix</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-zinc-400">
                🔒 Checkout simples sem cadastro • Frete calculado no próximo passo
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
