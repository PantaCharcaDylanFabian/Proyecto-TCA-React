export interface Product {
  id: number | string;
  nombre: string;
  marca: string;
  imagen: string;
  descripcion: string;
}

export interface Brand {
  nombre: string;
  logo: string;
}

export interface SubcategoryData {
  ruta?: string;
  nombre?: string;
  marcas: Brand[];
  productos: Product[];
}

export interface CategoryColumnLink {
  href: string;
  label: string;
  subcatKey?: string;
}

export interface CategoryColumn {
  title: string;
  href?: string;
  links: CategoryColumnLink[];
}

export interface SubmenuGroup {
  id: string;
  label: string;
  title: string;
  columns: CategoryColumn[];
}

export interface TopCategory {
  id: string;
  name: string;
  href: string;
  groups: SubmenuGroup[];
}

export interface ZoomedProduct {
  image: string;
  title: string;
  detail: string;
}

export interface ManagedProduct {
  datos_ejemplo?: boolean;
  id?: number | string;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock_minimo: number;
  stock_actual: number;
  stock_reservado?: number;
  stock_objetivo?: number;
  codigo_barras?: string;
  proveedor?: string;
  macro_categoria?: string;
  subcategoria_slug?: string;
  descripcion?: string;
  version?: number;
  imagen?: string;
  marca?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductValidationError {
  field: string;
  message: string;
}

export interface ImportValidationResult {
  totalRows: number;
  acceptedRows: ManagedProduct[];
  rejectedRows: { row: number; item: Partial<ManagedProduct>; errors: string[] }[];
}

export interface OrderDraftLine {
  id?: number | string;
  pedido_id?: string;
  producto_id: string;
  producto_nombre: string;
  precio_unitario: number;
  cantidad: number;
  cantidad_confirmada?: number;
  cantidad_preparada?: number;
  subtotal: number;
  imagen?: string;
}

export interface OrderDraft {
  id: string;
  cliente_nombre: string;
  cliente_documento: string;
  cliente_telefono?: string;
  cliente_direccion?: string;
  estado: 'BORRADOR' | 'CONFIRMADO' | 'CANCELADO' | 'DESPACHADO';
  canal?: 'INTERNO' | 'WEB';
  version?: number;
  total_solicitado?: number;
  constancia?: string;
  entrega?: 'RECOJO' | 'DELIVERY';
  total: number;
  notas?: string;
  lineas: OrderDraftLine[];
  actor?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerPreset {
  nombre: string;
  documento: string;
  telefono: string;
  direccion: string;
}

export type Role = 'GERENCIA' | 'VENTAS' | 'ALMACEN';
export interface Profile {
  id: string;
  nombre: string;
  email?: string;
  rol: Role;
  activo: boolean;
}
export interface CommercialProduct {
  datos_ejemplo?: boolean;
  codigo: string;
  codigo_barras: string | null;
  nombre: string;
  descripcion: string;
  categoria: string;
  macro_categoria: string;
  subcategoria_slug: string;
  marca: string;
  imagen: string;
  precio: number;
  disponible: number;
}
export interface Movement {
  id: number;
  producto_codigo: string;
  tipo: 'APERTURA' | 'ENTRADA' | 'SALIDA';
  cantidad: number;
  saldo: number;
  actor: string;
  referencia: string;
  proveedor: string;
  created_at: string;
}
export interface PurchaseLine { producto_codigo: string; nombre: string; cantidad: number; }
export interface Purchase {
  id: string;
  estado: 'PROPUESTA' | 'APROBADA' | 'RECIBIDA' | 'CANCELADA';
  proveedor: string;
  created_at: string;
  lineas: PurchaseLine[];
}
