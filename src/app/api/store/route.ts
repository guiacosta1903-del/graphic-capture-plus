import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { INITIAL_PRODUCTS } from '@/data/products';

const dataDir = path.join(process.cwd(), 'src', 'data');
const storeFilePath = path.join(dataDir, 'store.json');

function readStoreFromDisk() {
  if (!fs.existsSync(storeFilePath)) {
    const initialData = {
      products: INITIAL_PRODUCTS,
      settings: {
        logoUrl: null,
        banner1Image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&auto=format&fit=crop&q=80',
        banner2Image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1000&auto=format&fit=crop&q=80',
        whatsappNumber: '5551999999999',
      },
      orders: [],
    };
    fs.writeFileSync(storeFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(storeFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro ao ler store.json:', err);
    return {
      products: INITIAL_PRODUCTS,
      settings: {
        logoUrl: null,
        banner1Image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&auto=format&fit=crop&q=80',
        banner2Image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1000&auto=format&fit=crop&q=80',
        whatsappNumber: '5551999999999',
      },
      orders: [],
    };
  }
}

export async function GET() {
  const store = readStoreFromDisk();
  return NextResponse.json(store);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = readStoreFromDisk();

    const updated = {
      products: body.products ?? current.products,
      settings: body.settings ?? current.settings,
      orders: body.orders ?? current.orders,
    };

    fs.writeFileSync(storeFilePath, JSON.stringify(updated, null, 2), 'utf-8');
    return NextResponse.json({ success: true, store: updated });
  } catch (err) {
    console.error('Erro ao salvar store.json:', err);
    return NextResponse.json({ error: 'Falha ao salvar dados no disco' }, { status: 500 });
  }
}
