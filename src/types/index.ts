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
  id?: number | string;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock_minimo: number;
  stock_actual: number;
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
  subtotal: number;
  imagen?: string;
}

export interface OrderDraft {
  id: string;
  cliente_nombre: string;
  cliente_documento: string;
  cliente_telefono?: string;
  cliente_direccion?: string;
  estado: 'BORRADOR';
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
