import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useResource } from '../hooks/useResource';
import { getPublicCatalog } from '../services/catalogService';
import type { CommercialProduct } from '../types';

interface CartLine { codigo: string; cantidad: number; }
interface Commerce {
  products: CommercialProduct[]; example: boolean; loading: boolean; error: string;
  refresh: () => Promise<void>; cart: CartLine[];
  add: (code: string, quantity?: number) => void;
  setQuantity: (code: string, quantity: number) => void;
  clear: () => void;
}
const CommerceContext = createContext<Commerce | null>(null);
const key = 'tca_carrito_v2';
export function CommerceProvider({ children }: { children: ReactNode }) {
  const resource = useResource(getPublicCatalog);
  const refreshCatalog = resource.refresh;
  const [cart, setCart] = useState<CartLine[]>(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(stored) ? stored.filter((l): l is CartLine => l && typeof l.codigo === 'string' && Number.isSafeInteger(l.cantidad) && l.cantidad > 0 && l.cantidad <= 1000000).slice(0,100) : [];
    } catch { return []; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(cart)); }, [cart]);
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') void refreshCatalog(); };
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('tca:changed', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('tca:changed', refresh); };
  }, [refreshCatalog]);
  const setQuantity = (code: string, quantity: number) => {
    if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > 1000000) return;
    setCart(old => quantity === 0 ? old.filter(l => l.codigo !== code) : old.some(l => l.codigo === code)
      ? old.map(l => l.codigo === code ? { ...l, cantidad: quantity } : l) : [...old, { codigo: code, cantidad: quantity }]);
  };
  const add = (code: string, quantity = 1) => {
    if (!Number.isSafeInteger(quantity) || quantity <= 0) return;
    setCart(old => {
      const existing = old.find(l => l.codigo === code); const qty = (existing?.cantidad || 0) + quantity;
      const product = resource.data?.products.find(p => p.codigo === code);
      if (!product || qty > product.disponible || old.length >= 100 && !existing) return old;
      return existing ? old.map(l => l.codigo === code ? { ...l, cantidad: qty } : l) : [...old, { codigo: code, cantidad: qty }];
    });
  };
  return <CommerceContext.Provider value={{ products: resource.data?.products || [], example: resource.data?.example ?? false, loading: resource.loading, error: resource.error, refresh: resource.refresh, cart, add, setQuantity, clear: () => setCart([]) }}>{children}</CommerceContext.Provider>;
}
// eslint-disable-next-line react-refresh/only-export-components
export function useCommerce() {
  const context = useContext(CommerceContext); if (!context) throw new Error('CommerceProvider requerido.'); return context;
}
