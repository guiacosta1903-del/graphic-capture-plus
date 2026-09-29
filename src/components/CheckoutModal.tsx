'use client';

import React, { useState, useEffect } from 'react';
import { CartItem, ShippingOption, OrderData } from '@/types';
import { X, Check, Copy, Truck, ShieldCheck, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderCompleted: (order: OrderData) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderCompleted,
}) => {
  const [step, setStep] = useState<'form' | 'pix' | 'success'>('form');

  // Customer form state
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>({
    id: 'carta_registrada',
    name: 'Frete Fixo Econômico (Carta Registrada / Mini Envios)',
    description: 'Adesivos embalados com reforço anti-dobra',
    price: 9.90,
    estimatedDays: '5 a 8 dias úteis',
  });

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([
    {
      id: 'carta_registrada',
      name: 'Frete Econômico (Carta Registrada / Mini Envios)',
      description: 'Envelope protegido com reforço anti-dobra',
      price: 9.90,
      estimatedDays: '5 a 8 dias úteis',
    },
    {
      id: 'sedex',
      name: 'Sedex Expresso dos Correios',
      description: 'Envio prioritário com rastreio em tempo real',
      price: 24.90,
      estimatedDays: '1 a 3 dias úteis',
    },
  ]);

  // Pix state
  const [copiedPix, setCopiedPix] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(19);
  const [timerSeconds, setTimerSeconds] = useState(59);

  // Totals
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const isComboActive = totalQuantity >= 3;
  const subtotalPix = isComboActive 
    ? (totalQuantity * (20 / 3)) 
    : items.reduce((acc, item) => acc + item.product.pixPrice * item.quantity, 0);
  
  const finalTotal = subtotalPix + selectedShipping.price;

  // Mask helpers
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{2})$/, '-$1');
    setFormData((prev) => ({ ...prev, cpf: v }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
    v = v.replace(/(\d)(\d{4})$/, '$1-$2');
    setFormData((prev) => ({ ...prev, phone: v }));
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    let formatted = raw;
    if (formatted.length > 8) formatted = formatted.slice(0, 8);
    if (formatted.length > 5) {
      formatted = formatted.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    setFormData((prev) => ({ ...prev, cep: formatted }));

    // When 8 digits filled, auto-fetch ViaCEP
    if (raw.length === 8) {
      setIsLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
          }));
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  // Timer simulation
  useEffect(() => {
    if (step !== 'pix') return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev === 0) {
          if (timerMinutes === 0) {
            clearInterval(interval);
            return 0;
          }
          setTimerMinutes((m) => m - 1);
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timerMinutes]);

  const pixMockCode = `00020126580014br.gov.bcb.pix0136gremiostickers-oficial@pix.com520400005303986540${finalTotal.toFixed(2)}5802BR5920GREMIO STICKERS LTDA6009PORTO ALEGRE62070503***6304`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixMockCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleConfirmPixPayment = () => {
    const order: OrderData = {
      id: `GS-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: formData.name,
      customerCpf: formData.cpf,
      customerPhone: formData.phone,
      customerEmail: formData.email,
      cep: formData.cep,
      street: formData.street,
      number: formData.number,
      complement: formData.complement,
      neighborhood: formData.neighborhood,
      city: formData.city,
      state: formData.state,
      shippingOption: selectedShipping,
      items,
      subtotal: subtotalPix,
      shippingTotal: selectedShipping.price,
      total: finalTotal,
      pixDiscountTotal: 0,
      status: 'paid',
      createdAt: new Date().toISOString(),
    };
    onOrderCompleted(order);
    setStep('success');
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.cpf || !formData.cep || !formData.street || !formData.number) {
      alert('Por favor, preencha os campos obrigatórios de identificação e endereço.');
      return;
    }
    setStep('pix');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden text-zinc-900 border border-zinc-200">
        
        {/* Top Header */}
        <div className="bg-zinc-950 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
            <h3 className="font-black uppercase tracking-tight text-sm sm:text-base">
              {step === 'form' && 'Finalizar Pedido • Dados de Entrega'}
              {step === 'pix' && 'Pagamento Imediato no Pix'}
              {step === 'success' && '🎉 Pedido Confirmado!'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: FORMULÁRIO ENXUTO (Nome, CPF, Endereço, Frete) */}
        {step === 'form' && (
          <form onSubmit={handleSubmitForm} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* Aviso anti-fricção */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Sem senhas ou cadastros longos:</strong> Precisamos apenas dos dados para etiquetar seu pacote e emitir a declaração de envio dos Correios.
              </span>
            </div>

            {/* Identificação */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500">1. Identificação</h4>
              
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Matheus Silveira"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">CPF * (Para nota/etiqueta)</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={handleCpfChange}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="(51) 99999-9999"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Endereço e CEP */}
            <div className="space-y-3 pt-2 border-t border-zinc-100">
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500">2. Endereço de Entrega</h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-xs font-bold text-zinc-700 mb-1">CEP *</label>
                  <input
                    type="text"
                    required
                    placeholder="90000-000"
                    value={formData.cep}
                    onChange={handleCepChange}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                  {isLoadingCep && (
                    <Loader2 className="w-4 h-4 animate-spin text-sky-500 absolute right-3 top-8" />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Número *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1903"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Rua / Logradouro *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Av. Padre Cacique"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Bairro *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Humaitá"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Cidade / UF *</label>
                  <input
                    type="text"
                    required
                    placeholder="Porto Alegre / RS"
                    value={formData.city ? `${formData.city} - ${formData.state}` : ''}
                    readOnly
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 font-medium cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Seleção do Frete */}
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500">3. Opções de Envio</h4>
              
              <div className="space-y-2">
                {shippingOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      selectedShipping.id === opt.id
                        ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={selectedShipping.id === opt.id}
                        onChange={() => setSelectedShipping(opt)}
                        className="text-sky-600 focus:ring-sky-500"
                      />
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-zinc-900">{opt.name}</div>
                        <div className="text-[11px] text-zinc-500">{opt.estimatedDays} • {opt.description}</div>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm font-black text-zinc-900">
                      R$ {opt.price.toFixed(2).replace('.', ',')}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Resumo e Botão de Avançar */}
            <div className="pt-4 border-t border-zinc-200 space-y-3">
              <div className="flex items-center justify-between font-black text-base text-zinc-900">
                <span>Total no Pix com Frete:</span>
                <span className="text-xl text-amber-600">R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-black text-sm uppercase tracking-wider rounded-2xl transition shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2"
              >
                <span>Gerar QR Code Pix</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

        {/* STEP 2: TELA DO PIX (QR Code + Copia e Cola + Timer) */}
        {step === 'pix' && (
          <div className="p-6 sm:p-8 text-center space-y-5">
            {/* Countdown Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-800">
              <span>Seu pedido expira em:</span>
              <span className="font-mono text-sm font-black text-amber-900">
                {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
              </span>
            </div>

            <div>
              <h4 className="text-xl font-black text-zinc-900 tracking-tight">Pague com Pix</h4>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1">
                Abra o app do seu banco, escolha Pix e escaneie o código ou copie a chave abaixo.
              </p>
            </div>

            {/* Simulated QR Code SVG */}
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-2 border-dashed border-zinc-300 shadow-inner flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect width="100" height="100" fill="#ffffff" />
                {/* QR Code corner markers */}
                <rect x="10" y="10" width="25" height="25" fill="#000000" />
                <rect x="14" y="14" width="17" height="17" fill="#ffffff" />
                <rect x="18" y="18" width="9" height="9" fill="#000000" />

                <rect x="65" y="10" width="25" height="25" fill="#000000" />
                <rect x="69" y="14" width="17" height="17" fill="#ffffff" />
                <rect x="73" y="18" width="9" height="9" fill="#000000" />

                <rect x="10" y="65" width="25" height="25" fill="#000000" />
                <rect x="14" y="69" width="17" height="17" fill="#ffffff" />
                <rect x="18" y="73" width="9" height="9" fill="#000000" />

                {/* Random QR pixels */}
                <rect x="40" y="15" width="6" height="6" fill="#000000" />
                <rect x="50" y="22" width="6" height="6" fill="#000000" />
                <rect x="42" y="32" width="8" height="6" fill="#000000" />
                <rect x="52" y="42" width="6" height="12" fill="#000000" />
                <rect x="65" y="45" width="12" height="6" fill="#000000" />
                <rect x="25" y="45" width="10" height="6" fill="#000000" />
                <rect x="70" y="65" width="6" height="15" fill="#000000" />
                <rect x="80" y="75" width="8" height="8" fill="#000000" />
                <rect x="45" y="65" width="10" height="10" fill="#0d80f2" />
              </svg>
            </div>

            {/* Total value */}
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-3">
              <span className="text-xs text-zinc-500 font-semibold block">Valor a pagar:</span>
              <span className="text-2xl font-black text-zinc-900">
                R$ {finalTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {/* Copia e Cola button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCopyPix}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                  copiedPix
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                }`}
              >
                {copiedPix ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>Código Pix Copiado com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-zinc-400" />
                    <span>Copiar Código Pix (Copia e Cola)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleConfirmPixPayment}
                className="w-full py-2.5 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simular confirmação automática do banco</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCESSO / CONFIRMAÇÃO */}
        {step === 'success' && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <h4 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">
                Pagamento Aprovado!
              </h4>
              <p className="text-xs text-zinc-500 mt-1">
                Seu pedido foi registrado e já está na fila de separação e embalagem.
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Destinatário:</span>
                <span className="font-bold text-zinc-900">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Envio para:</span>
                <span className="font-bold text-zinc-900">{formData.city} - {formData.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Modalidade:</span>
                <span className="font-bold text-zinc-900">{selectedShipping.name}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-200">
                <span className="text-zinc-500">Total Pago:</span>
                <span className="font-black text-emerald-600 text-sm">
                  R$ {finalTotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <a
              href={`https://wa.me/5551999999999?text=Ol%C3%A1!%20Acabei%20de%20fazer%20o%20pedido%20de%20adesivos%20em%20nome%20de%20${encodeURIComponent(
                formData.name
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider rounded-xl transition items-center justify-center gap-2"
            >
              <span>Acompanhar pelo WhatsApp</span>
            </a>
          </div>
        )}

      </div>
    </div>
  );
};
