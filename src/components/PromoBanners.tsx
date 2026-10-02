'use client';

import React from 'react';
import { Layers, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';

interface PromoBannersProps {
  onScrollToCatalog: () => void;
  banner1Image?: string;
  banner2Image?: string;
  banner1Tag?: string;
  banner1Title?: string;
  banner1Highlight?: string;
  banner1Description?: string;
  banner1ButtonText?: string;
  banner2Tag?: string;
  banner2Title?: string;
  banner2Highlight?: string;
  banner2Description?: string;
  banner2ButtonText?: string;
  whatsappNumber?: string;
}

export const PromoBanners: React.FC<PromoBannersProps> = ({ 
  onScrollToCatalog,
  banner1Image = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&auto=format&fit=crop&q=80',
  banner2Image = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1000&auto=format&fit=crop&q=80',
  banner1Tag = 'Coleção Arquibancada',
  banner1Title = 'TODOS OS',
  banner1Highlight = 'MODELOS',
  banner1Description = "Vinil premium laminado à prova d'água, sol e riscos. Ideal para garrafas térmicas, carros e notebooks.",
  banner1ButtonText = 'Ver modelos disponíveis',
  banner2Tag = 'Consulados & Torcidas',
  banner2Title = 'PEDIDO MÍNIMO 50 UNID.',
  banner2Highlight = 'PERSONALIZADOS',
  banner2Description = 'Produza o adesivo do seu consulado, núcleo de torcida ou evento com corte especial e acabamento fosco ou brilhante.',
  banner2ButtonText = 'Fazer orçamento no WhatsApp',
  whatsappNumber = '5551999999999',
}) => {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-6">
      {/* Banner Container: 2-column panoramic split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Banner 1: Catálogo Completo / Linha de Modelos */}
        <div 
          onClick={onScrollToCatalog}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl transition hover:border-sky-500/50 min-h-[170px] sm:min-h-[200px] flex items-center"
        >
          {/* Background image & gradient overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105 opacity-40"
            style={{
              backgroundImage: `url('${banner1Image}')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />

          {/* Banner Content */}
          <div className="relative z-10 p-6 sm:p-8 max-w-md">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-widest mb-1">
              <Layers className="w-3.5 h-3.5" /> {banner1Tag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-none mb-2">
              {banner1Title} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-200">
                {banner1Highlight}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 mb-4">
              {banner1Description}
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 group-hover:translate-x-1 transition">
              <span>{banner1ButtonText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Banner 2: Personalizados e Pedidos em Lote */}
        <a 
          href={`https://wa.me/${whatsappNumber}?text=Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento%20para%20adesivos%20personalizados%20da%20Gr%C3%AAmio%20Stickers`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl transition hover:border-emerald-500/50 min-h-[170px] sm:min-h-[200px] flex items-center"
        >
          {/* Background image & gradient overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105 opacity-35"
            style={{
              backgroundImage: `url('${banner2Image}')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-transparent" />

          {/* Banner Content */}
          <div className="relative z-10 p-6 sm:p-8 max-w-md">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" /> {banner2Tag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-none mb-1">
              {banner2Title} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                {banner2Highlight}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 mb-4">
              {banner2Description}
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{banner2ButtonText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </a>

      </div>
    </section>
  );
};
