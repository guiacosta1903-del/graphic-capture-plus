'use client';

import React, { useState } from 'react';
import { Product, OrderData } from '@/types';
import { X, Plus, ToggleLeft, ToggleRight, Upload, Image as ImageIcon, Settings, ShoppingBag, Check, Trash2, MoreHorizontal, ArrowLeft, Edit3 } from 'lucide-react';
import { uploadImage } from '@/lib/supabase';

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
  onDeleteProduct: (productId: string) => void;
  onUpdateProduct: (product: Product) => void;
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
  onDeleteProduct,
  onUpdateProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'add' | 'settings'>('products');

  // New product form state
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('8.00');
  const [newPromo, setNewPromo] = useState('LEVE 3 POR R$ 20 NO PIX');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newSecondaryImageUrl, setNewSecondaryImageUrl] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewSecondaryImage, setPreviewSecondaryImage] = useState<string | null>(null);

  // Edit product state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editPixPrice, setEditPixPrice] = useState('');
  const [editPromoTag, setEditPromoTag] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editSecondaryImageUrl, setEditSecondaryImageUrl] = useState('');
  const [editIsSoldOut, setEditIsSoldOut] = useState(false);

  // Settings form state
  const [settingsData, setSettingsData] = useState<StoreSettings>(storeSettings);
  const [savedSettingsFeedback, setSavedSettingsFeedback] = useState(false);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);

  // File upload para foto principal do novo produto (Supabase Storage com fallback local)
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadImage(file);
      setPreviewImage(url);
      setNewImageUrl(url);
    } catch (err) {
      console.error('Erro ao fazer upload da foto:', err);
      alert('Erro ao enviar imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  // File upload para foto secundária (hover) do novo produto
  const handleProductSecondaryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadImage(file);
      setPreviewSecondaryImage(url);
      setNewSecondaryImageUrl(url);
    } catch (err) {
      console.error('Erro ao fazer upload da foto secundária:', err);
      alert('Erro ao enviar imagem secundária.');
    } finally {
      setIsUploading(false);
    }
  };

  // File upload para configurações (Logo, Banners) direto para Supabase Storage
  const handleSettingsImageUpload = async (
    key: 'logoUrl' | 'banner1Image' | 'banner2Image',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadImage(file);
      const updated = { ...settingsData, [key]: url };
      setSettingsData(updated);
      onUpdateStoreSettings(updated);
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
    const imagesList = [newImageUrl, newSecondaryImageUrl].filter(Boolean);
    const prod: Product = {
      id: String(Date.now()),
      name: newTitle,
      price: priceNum,
      pixPrice: priceNum * 0.9,
      promoTag: newPromo,
      imageUrl: newImageUrl || '',
      secondaryImageUrl: newSecondaryImageUrl.trim() || undefined,
      images: imagesList.length > 0 ? imagesList : undefined,
      isSoldOut: false,
    };
    onAddProduct(prod);

    // Reset form
    setNewTitle('');
    setNewImageUrl('');
    setNewSecondaryImageUrl('');
    setPreviewImage(null);
    setPreviewSecondaryImage(null);
    setActiveTab('products');
  };

  // Iniciar edição de detalhes de um adesivo
  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(product.price.toString());
    setEditPixPrice(product.pixPrice.toString());
    setEditPromoTag(product.promoTag || '');
    setEditImageUrl(product.imageUrl || '');
    setEditSecondaryImageUrl(product.secondaryImageUrl || (product.images && product.images.length > 1 ? product.images[1] : '') || '');
    setEditIsSoldOut(product.isSoldOut || false);
  };

  // Upload de foto principal na edição de adesivo
  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadImage(file);
      setEditImageUrl(url);
    } catch (err) {
      console.error('Erro ao fazer upload da foto:', err);
      alert('Erro ao enviar imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  // Upload de foto secundária (hover) na edição de adesivo
  const handleEditSecondaryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadImage(file);
      setEditSecondaryImageUrl(url);
    } catch (err) {
      console.error('Erro ao fazer upload da foto secundária:', err);
      alert('Erro ao enviar imagem secundária.');
    } finally {
      setIsUploading(false);
    }
  };

  // Salvar alterações da edição detalhada
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const priceNum = parseFloat(editPrice) || editingProduct.price;
    const pixNum = parseFloat(editPixPrice) || (priceNum * 0.9);
    const imagesList = [editImageUrl, editSecondaryImageUrl].filter(Boolean);

    const updatedProduct: Product = {
      ...editingProduct,
      name: editName.trim() || editingProduct.name,
      price: priceNum,
      pixPrice: pixNum,
      promoTag: editPromoTag.trim(),
      imageUrl: editImageUrl || editingProduct.imageUrl,
      secondaryImageUrl: editSecondaryImageUrl.trim() || undefined,
      images: imagesList.length > 0 ? imagesList : undefined,
      isSoldOut: editIsSoldOut,
    };

    onUpdateProduct(updatedProduct);
    setEditingProduct(null);
  };

  // Excluir produto atualmente em edição
  const handleDeleteCurrentEditing = () => {
    if (!editingProduct) return;
    if (window.confirm(`Tem certeza que deseja remover o adesivo "${editingProduct.name}"?`)) {
      onDeleteProduct(editingProduct.id);
      setEditingProduct(null);
    }
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
              onClick={() => {
                setEditingProduct(null);
                setActiveTab('products');
              }}
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
              onClick={() => {
                setEditingProduct(null);
                setActiveTab('add');
              }}
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
              onClick={() => {
                setEditingProduct(null);
                setActiveTab('settings');
              }}
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
              onClick={() => {
                setEditingProduct(null);
                setActiveTab('orders');
              }}
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

        {/* TAB 1: GERENCIAR ESTOQUE (LISTA OU EDIÇÃO DETALHADA) */}
        {activeTab === 'products' && (
          editingProduct ? (
            /* DETALHES / EDITAR ADESIVO */
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-950 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar para o Estoque</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                    Editar Detalhes
                  </span>
                </div>
              </div>

              {/* Foto Principal */}
              <div className="space-y-2 p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-800">1. Foto Principal (Capa)</label>
                  <span className="text-[10px] text-zinc-400 font-semibold">Exibição padrão</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-zinc-200 flex items-center justify-center bg-white overflow-hidden flex-shrink-0">
                    {editImageUrl ? (
                      <img src={editImageUrl} alt="Preview Principal" className="w-full h-full object-contain p-1" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-zinc-300" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold py-2 px-3 rounded-xl transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Enviando foto...' : 'Trocar foto principal'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        disabled={isUploading}
                        onChange={handleEditImageUpload} 
                      />
                    </label>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Ou cole a URL direta (ex: https://... ou /products/foto.png)"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium bg-white"
                />
              </div>

              {/* Foto Secundária (Hover) */}
              <div className="space-y-2 p-3 bg-sky-50/60 rounded-2xl border border-sky-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-sky-950 flex items-center gap-1.5">
                    <span>2. Foto Secundária (Muda ao passar o mouse)</span>
                    <span className="text-[10px] text-sky-600 bg-sky-100 font-semibold px-1.5 py-0.5 rounded">Opcional</span>
                  </label>
                  {editSecondaryImageUrl && (
                    <button
                      type="button"
                      onClick={() => setEditSecondaryImageUrl('')}
                      className="text-[11px] font-bold text-red-500 hover:text-red-700 transition"
                    >
                      Remover foto 2
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-sky-200 flex items-center justify-center bg-white overflow-hidden flex-shrink-0">
                    {editSecondaryImageUrl ? (
                      <img src={editSecondaryImageUrl} alt="Preview Secundária" className="w-full h-full object-contain p-1" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-sky-300" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2 px-3 rounded-xl transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Enviando...' : editSecondaryImageUrl ? 'Trocar foto 2' : 'Adicionar foto 2'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        disabled={isUploading}
                        onChange={handleEditSecondaryImageUpload} 
                      />
                    </label>
                    <p className="text-[11px] text-sky-700/80">
                      Ao passar o cursor do mouse no catálogo, a imagem mudará suavemente para esta foto!
                    </p>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Ou cole a URL direta da foto 2 (ex: https://...)"
                  value={editSecondaryImageUrl}
                  onChange={(e) => setEditSecondaryImageUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-sky-200 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium bg-white"
                />
              </div>

              {/* Nome do Modelo */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Nome do Modelo / Adesivo *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              {/* Preços */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Preço Normal (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPrice}
                    onChange={(e) => {
                      setEditPrice(e.target.value);
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        setEditPixPrice((val * 0.9).toFixed(2));
                      }
                    }}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Preço no Pix (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPixPrice}
                    onChange={(e) => setEditPixPrice(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
              </div>

              {/* Tag Promocional */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Tag Promocional (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: LEVE 3 POR R$ 20 NO PIX"
                  value={editPromoTag}
                  onChange={(e) => setEditPromoTag(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              {/* Status de Estoque */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">Status do Estoque</label>
                <button
                  type="button"
                  onClick={() => setEditIsSoldOut(!editIsSoldOut)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition border ${
                    editIsSoldOut
                      ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {editIsSoldOut ? (
                    <>
                      <ToggleLeft className="w-5 h-5 text-red-500" />
                      <span>Esgotado (Adesivo fica cinza com faixa diagonal "ESGOTADO" e botão desativado)</span>
                    </>
                  ) : (
                    <>
                      <ToggleRight className="w-5 h-5 text-emerald-600" />
                      <span>Em Estoque (Adesivo disponível para compra no catálogo)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Ações de Salvar e Excluir */}
              <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <button
                  type="button"
                  onClick={handleDeleteCurrentEditing}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3.5 py-2.5 rounded-xl border border-red-200 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir este Adesivo</span>
                </button>

                <div className="w-full sm:w-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 sm:flex-none text-xs font-bold text-zinc-600 hover:text-zinc-900 px-4 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition text-center"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 px-5 py-2.5 rounded-xl shadow transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* LISTA DE PRODUTOS NO ESTOQUE */
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-500">
                  Alterne o estoque, clique em <strong>... Detalhes</strong> para editar ou no botão vermelho para remover.
                </p>
                <span className="text-[11px] font-bold text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-full">
                  {products.length} adesivos
                </span>
              </div>

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
                          className="w-11 h-11 object-contain rounded-lg border border-zinc-200 bg-white p-0.5 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-black text-xs flex-shrink-0">
                          GS
                        </div>
                      )}
                      <div className="min-w-0">
                        <h5 className="font-bold text-sm text-zinc-900 truncate">
                          {product.name}
                        </h5>
                        <div className="text-xs text-zinc-500 flex items-center gap-1.5 flex-wrap">
                          <span>R$ {product.price.toFixed(2).replace('.', ',')}</span>
                          <span className="text-emerald-600 font-semibold">• R$ {product.pixPrice.toFixed(2).replace('.', ',')} Pix</span>
                          {product.promoTag && (
                            <span className="bg-sky-50 text-sky-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                              {product.promoTag}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                      {/* Toggle de Estoque */}
                      <button
                        type="button"
                        onClick={() => onToggleSoldOut(product.id)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition ${
                          product.isSoldOut
                            ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                        title={product.isSoldOut ? 'Marcar como Em Estoque' : 'Marcar como Esgotado'}
                      >
                        {product.isSoldOut ? (
                          <>
                            <ToggleLeft className="w-4 h-4 text-red-500" />
                            <span className="hidden sm:inline">Esgotado</span>
                          </>
                        ) : (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-600" />
                            <span className="hidden sm:inline">Em Estoque</span>
                          </>
                        )}
                      </button>

                      {/* Botão ... Detalhes */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(product)}
                        className="px-2.5 py-1.5 rounded-xl text-zinc-700 hover:text-sky-600 hover:bg-sky-50 border border-zinc-200 transition flex items-center gap-1 font-bold text-xs"
                        title="Ver e inserir detalhes do adesivo"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                        <span className="hidden sm:inline">Detalhes</span>
                      </button>

                      {/* Botão Remover */}
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Tem certeza que deseja remover o adesivo "${product.name}" do catálogo?`)) {
                            onDeleteProduct(product.id);
                          }
                        }}
                        className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-zinc-200 transition"
                        title="Remover adesivo do catálogo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* TAB 2: ADICIONAR NOVO ADESIVO COM FOTO */}
        {activeTab === 'add' && (
          <form onSubmit={handleCreateProduct} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            
            {/* Foto Principal */}
            <div className="space-y-2 p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-zinc-800">1. Foto Principal (Capa do Adesivo) *</label>
                <span className="text-[10px] text-zinc-400 font-semibold">Exibição padrão</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-zinc-200 flex items-center justify-center bg-white overflow-hidden flex-shrink-0">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-contain p-1" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-zinc-300" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold py-2 px-3 rounded-xl transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Enviando...' : 'Escolher foto do computador'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      disabled={isUploading}
                      onChange={handleProductImageUpload} 
                    />
                  </label>
                  <p className="text-[11px] text-zinc-400">
                    PNG ou JPEG do adesivo.
                  </p>
                </div>
              </div>

              <input
                type="text"
                placeholder="Ou cole a URL direta / caminho (ex: /products/adesivo.png)"
                value={newImageUrl}
                onChange={(e) => {
                  setNewImageUrl(e.target.value);
                  setPreviewImage(e.target.value);
                }}
                className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium bg-white"
              />
            </div>

            {/* Foto Secundária (Hover / Ao passar o mouse) */}
            <div className="space-y-2 p-3 bg-sky-50/60 rounded-2xl border border-sky-100">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-sky-950 flex items-center gap-1.5">
                  <span>2. Foto Secundária (Muda ao passar o mouse)</span>
                  <span className="text-[10px] text-sky-600 bg-sky-100 font-semibold px-1.5 py-0.5 rounded">Opcional</span>
                </label>
                {newSecondaryImageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewSecondaryImageUrl('');
                      setPreviewSecondaryImage(null);
                    }}
                    className="text-[11px] font-bold text-red-500 hover:text-red-700 transition"
                  >
                    Remover foto 2
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-sky-200 flex items-center justify-center bg-white overflow-hidden flex-shrink-0">
                  {previewSecondaryImage ? (
                    <img src={previewSecondaryImage} alt="Preview Secundária" className="w-full h-full object-contain p-1" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-sky-300" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2 px-3 rounded-xl transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Enviando...' : previewSecondaryImage ? 'Trocar foto 2' : 'Adicionar foto 2'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      disabled={isUploading}
                      onChange={handleProductSecondaryImageUpload} 
                    />
                  </label>
                  <p className="text-[11px] text-sky-700/80">
                    Quando o cliente passar o mouse sobre este adesivo, a imagem mudará suavemente para esta foto!
                  </p>
                </div>
              </div>

              <input
                type="text"
                placeholder="Ou cole a URL direta da foto 2 (ex: https://...)"
                value={newSecondaryImageUrl}
                onChange={(e) => {
                  setNewSecondaryImageUrl(e.target.value);
                  setPreviewSecondaryImage(e.target.value);
                }}
                className="w-full text-xs px-3 py-2 rounded-xl border border-sky-200 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium bg-white"
              />
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
