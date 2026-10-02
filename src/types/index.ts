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
