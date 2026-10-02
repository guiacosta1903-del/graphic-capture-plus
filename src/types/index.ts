export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  pixPrice: number;
  promoTag?: string;
  imageUrl: string;
  secondaryImageUrl?: string;
  images?: string[];
  isSoldOut: boolean;
  isFeatured?: boolean;
  category?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

export interface OrderData {
  id?: string;
  customerName: string;
  customerCpf: string;
  customerPhone: string;
  customerEmail: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  shippingOption: ShippingOption;
  items: CartItem[];
  subtotal: number;
  shippingTotal: number;
  total: number;
  pixDiscountTotal: number;
  pixCode?: string;
  pixQrCodeUrl?: string;
  status: 'pending_payment' | 'paid' | 'shipped' | 'cancelled';
  createdAt?: string;
  trackingCode?: string;
}

export interface StoreSettings {
  logoUrl: string | null;
  banner1Image: string;
  banner2Image: string;
  whatsappNumber: string;
  // Textos personalizáveis do Banner 1
  banner1Tag?: string;
  banner1Title?: string;
  banner1Highlight?: string;
  banner1Description?: string;
  banner1ButtonText?: string;
  // Textos personalizáveis do Banner 2
  banner2Tag?: string;
  banner2Title?: string;
  banner2Highlight?: string;
  banner2Description?: string;
  banner2ButtonText?: string;
}
