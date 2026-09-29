'use client';

import React, { useState } from 'react';
import { Product, OrderData } from '@/types';
import { X, Plus, ToggleLeft, ToggleRight, Upload, Image as ImageIcon, Settings, ShoppingBag, Check } from 'lucide-react';

interface StoreSettings {
  logoUrl: string | null;
  banner1Image: string;
  banner2Image: string;
  whatsappNumber: string;
}

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: OrderData[];
  storeSettings: StoreSettings;
  onUpdateStoreSettings: (newSettings: StoreSettings) => void;
  onToggleSoldOut: (productId: string) => void;
  onAddProduct: (newProduct: Product) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  storeSettings,
  onUpdateStoreSettings,
  onToggleSoldOut,
  onAddProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'add' | 'settings'>('products');

  // New product form state
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('8.00');
  const [newPromo, setNewPromo] = useState('LEVE 3 POR R$ 20 NO PIX');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Settings form state
  const [settingsData, setSettingsData] = useState<StoreSettings>(storeSettings);
  const [savedSettingsFeedback, setSavedSettingsFeedback] = useState(false);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);

  // File upload para foto do novo produto (salva arquivo físico no disco)
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setPreviewImage(data.url);
        setNewImageUrl(data.url);
      }
    } catch (err) {
      console.error('Erro ao fazer upload da foto:', err);
      alert('Erro ao enviar imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  // File upload para configurações (Logo, Banners) direto para public/uploads
  const handleSettingsImageUpload = async (
    key: 'logoUrl' | 'banner1Image' | 'banner2Image',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        const updated = { ...settingsData, [key]: data.url };
        setSettingsData(updated);
        onUpdateStoreSettings(updated); // Atualiza imediatamente no estado e no disco
      }
    } catch (err) {
      console.error('Erro no upload:', err);
      alert('Erro ao enviar imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreSettings(settingsData);
    setSavedSettingsFeedback(true);
    setTimeout(() => setSavedSettingsFeedback(false), 3000);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const priceNum = parseFloat(newPrice) || 8.00;
    const prod: Product = {
      id: String(Date.now()),
      name: newTitle,
      price: priceNum,
      pixPrice: priceNum * 0.9,
      promoTag: newPromo,
      imageUrl: newImageUrl || '',
      isSoldOut: false,
    };
    onAddProduct(prod);

    // Reset form
    setNewTitle('');
    setNewImageUrl('');
    setPreviewImage(null);
    setActiveTab('products');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden text-zinc-900 border border-zinc-200 max-h-[88vh] flex flex-col">
        
        {/* Top Header */}
        <div className="bg-zinc-950 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="font-black uppercase tracking-tight text-sm sm:text-base">
              Painel do Lojista • Grêmio Stickers
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation - Segmented Control sem barras de rolagem bugadas */}
        <div className="bg-zinc-100/90 border-b border-zinc-200 p-2 sm:p-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`py-2 px-2 text-xs sm:text-sm font-bold rounded-xl transition text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'products'
                  ? 'bg-white text-sky-600 shadow-sm border border-zinc-200'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
              }`}
            >
              <span>Estoque ({products.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('add')}
              className={`py-2 px-2 text-xs sm:text-sm font-bold rounded-xl transition text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'add'
                  ? 'bg-white text-sky-600 shadow-sm border border-zinc-200'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
              }`}
            >
              <span>+ Novo Adesivo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-2 text-xs sm:text-sm font-bold rounded-xl transition text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-white text-sky-600 shadow-sm border border-zinc-200'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Logo & Banners</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-2 text-xs sm:text-sm font-bold rounded-xl transition text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-white text-sky-600 shadow-sm border border-zinc-200'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Pedidos ({orders.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: GERENCIAR ESTOQUE (TOGGLE ESGOTADO) */}
        {activeTab === 'products' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            <p className="text-xs text-zinc-500 mb-2">
              Clique no botão para alternar instantaneamente entre <strong>Em Estoque</strong> e <strong>Esgotado</strong> (com a foto cinza e faixa transversal).
            </p>

            <div className="divide-y divide-zinc-100">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-50 px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-10 h-10 object-contain rounded-lg border border-zinc-200 bg-white p-0.5 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-black text-xs flex-shrink-0">
                        GS
                      </div>
                    )}
                    <div className="min-w-0">
                      <h5 className="font-bold text-sm text-zinc-900 truncate">
                        {product.name}
                      </h5>
                      <div className="text-xs text-zinc-400">
                        R$ {product.price.toFixed(2).replace('.', ',')} • R$ {product.pixPrice.toFixed(2).replace('.', ',')} no Pix
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleSoldOut(product.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition flex-shrink-0 ${
                      product.isSoldOut
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {product.isSoldOut ? (
                      <>
                        <ToggleLeft className="w-4 h-4 text-red-500" />
                        <span>Esgotado</span>
                      </>
                    ) : (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-600" />
                        <span>Em Estoque</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ADICIONAR NOVO ADESIVO COM FOTO */}
        {activeTab === 'add' && (
          <form onSubmit={handleCreateProduct} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            
            {/* Foto do Adesivo (Upload com Preview) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-700">Foto do Adesivo (Fundo transparente ou claro)</label>
              
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-zinc-300 flex items-center justify-center bg-zinc-50 overflow-hidden flex-shrink-0">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-contain p-1" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-zinc-300" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Escolher foto do computador</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleProductImageUpload} 
                    />
                  </label>
                  <p className="text-[11px] text-zinc-400">
                    Dica: use fotos do adesivo com recorte (*die-cut*) em PNG ou JPEG.
                  </p>
                </div>
              </div>

              {/* Opção de colar URL direta */}
              <div className="pt-1">
                <input
                  type="text"
                  placeholder="Ou cole a URL direta / caminho da foto (ex: /products/meu-adesivo.png)"
                  value={newImageUrl}
                  onChange={(e) => {
                    setNewImageUrl(e.target.value);
                    setPreviewImage(e.target.value);
                  }}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                />
              </div>
            </div>

            {/* Nome do Modelo */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Nome do Modelo *</label>
              <input
                type="text"
                required
                placeholder="Ex: Danrlei 1995 - Paredão Imortal"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Preço Normal (R$)</label>
                <input
                  type="text"
                  placeholder="8.00"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Tag de Promoção</label>
                <input
                  type="text"
                  placeholder="LEVE 3 POR R$ 20 NO PIX"
                  value={newPromo}
                  onChange={(e) => setNewPromo(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-black text-sm uppercase tracking-wider rounded-xl transition shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 mt-4"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Adesivo na Loja</span>
            </button>
          </form>
        )}

        {/* TAB 3: CONFIGURAÇÕES DA LOJA (LOGO, BANNERS, WHATSAPP) */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            
            {/* Troca do Logo */}
            <div className="space-y-2 pb-4 border-b border-zinc-100">
              <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider">
                1. Logo da Loja (Topo do Site)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-16 rounded-xl border border-dashed border-zinc-300 flex items-center justify-center overflow-hidden flex-shrink-0 bg-zinc-50">
                  {settingsData.logoUrl ? (
                    <img src={settingsData.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="font-black text-sky-500 text-base">GS</span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold py-2 px-3.5 rounded-xl transition border border-zinc-300">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload do Logo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleSettingsImageUpload('logoUrl', e)} 
                    />
                  </label>
                  {settingsData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setSettingsData((prev) => ({ ...prev, logoUrl: null }))}
                      className="ml-3 text-xs text-red-500 hover:underline"
                    >
                      Remover foto (usar brasão GS)
                    </button>
                  )}
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Aceita PNG transparente, JPEG ou SVG. Tamanho ideal: 200x200px.
                  </p>
                </div>
              </div>
            </div>

            {/* Troca das Imagens dos Banners */}
            <div className="space-y-4 pb-4 border-b border-zinc-100">
              <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider">
                2. Imagens de Fundo dos Banners
              </label>

              {/* Banner 1 */}
              <div>
                <span className="block text-xs font-bold text-zinc-700 mb-1">Banner 1: "Todos os Modelos"</span>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={settingsData.banner1Image}
                    onChange={(e) => setSettingsData({ ...settingsData, banner1Image: e.target.value })}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-zinc-200"
                    placeholder="URL ou caminho da imagem do Banner 1"
                  />
                  <label className="cursor-pointer bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold py-2 px-3 rounded-xl border border-zinc-300 flex items-center gap-1.5 flex-shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleSettingsImageUpload('banner1Image', e)} 
                    />
                  </label>
                </div>
              </div>

              {/* Banner 2 */}
              <div>
                <span className="block text-xs font-bold text-zinc-700 mb-1">Banner 2: "Adesivos Personalizados"</span>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={settingsData.banner2Image}
                    onChange={(e) => setSettingsData({ ...settingsData, banner2Image: e.target.value })}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-zinc-200"
                    placeholder="URL ou caminho da imagem do Banner 2"
                  />
                  <label className="cursor-pointer bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold py-2 px-3 rounded-xl border border-zinc-300 flex items-center gap-1.5 flex-shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleSettingsImageUpload('banner2Image', e)} 
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* WhatsApp de Contato */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider">
                3. WhatsApp de Atendimento
              </label>
              <input
                type="text"
                value={settingsData.whatsappNumber}
                onChange={(e) => setSettingsData({ ...settingsData, whatsappNumber: e.target.value })}
                placeholder="5551999999999 (com DDD)"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
              <p className="text-[11px] text-zinc-400">
                Formato internacional com DDI e DDD (Ex: 5551988887777).
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2"
            >
              {savedSettingsFeedback ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Configurações Salvas com Sucesso!</span>
                </>
              ) : (
                <span>Salvar Configurações Visuais</span>
              )}
            </button>
          </form>
        )}

        {/* TAB 4: PEDIDOS RECEBIDOS */}
        {activeTab === 'orders' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-10 text-zinc-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-zinc-300" />
                <p className="text-sm font-bold text-zinc-600">Nenhum pedido realizado ainda</p>
                <p className="text-xs">Faça uma compra teste no checkout para ver o pedido cair aqui.</p>
              </div>
            ) : (
              orders.map((order, idx) => (
                <div key={idx} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-sky-600 uppercase">
                      Pedido #{order.id || `GS-${idx + 1}`}
                    </span>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Pago via Pix
                    </span>
                  </div>
                  <div className="text-sm font-bold text-zinc-900">
                    {order.customerName} • {order.customerPhone}
                  </div>
                  <div className="text-xs text-zinc-600">
                    <strong>Endereço de Envio:</strong> {order.street}, {order.number} - {order.neighborhood}, {order.city}/{order.state} - CEP: {order.cep}
                  </div>
                  <div className="text-xs text-zinc-500 pt-1 border-t border-zinc-200 flex justify-between items-center">
                    <span>
                      {order.items.reduce((acc, i) => acc + i.quantity, 0)} itens • {order.shippingOption.name}
                    </span>
                    <span className="font-black text-zinc-900">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};
