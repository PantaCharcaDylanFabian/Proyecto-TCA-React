import { supabase } from '../lib/supabase';
import type { OrderDraft, CustomerPreset } from '../types';

const STORAGE_KEY = 'tca_pedidos_borrador_hu12';

// Clientes de prueba verificados para agilizar la atención comercial (Criterio 1 HU12)
export const CLIENTES_PRUEBA: CustomerPreset[] = [
  {
    nombre: 'BODEGA SAN JOSÉ DE PIURA E.I.R.L.',
    documento: '20601234567',
    telefono: '969123456',
    direccion: 'Av. Los Álamos 450, Urb. Santa Isabel, Piura',
  },
  {
    nombre: 'MINIMARKET EL SOL S.A.C.',
    documento: '20509876543',
    telefono: '978654321',
    direccion: 'Calle Comercio 128, Centro, Sullana',
  },
  {
    nombre: 'DISTRIBUIDORA NORTE COMERCIAL S.R.L.',
    documento: '20401122334',
    telefono: '956781234',
    direccion: 'Jr. Tacna 890, Castilla, Piura',
  },
  {
    nombre: 'COMERCIAL DOÑA ROSA (Rosa Elvira Flores)',
    documento: '10456789123',
    telefono: '943216789',
    direccion: 'Av. Grau 312, Bellavista, Sullana',
  },
];

// Pedidos semilla de prueba iniciales en borrador (Criterio 2 HU12)
const INITIAL_DRAFTS: OrderDraft[] = [
  {
    id: 'PED-2026-0001',
    cliente_nombre: 'BODEGA SAN JOSÉ DE PIURA E.I.R.L.',
    cliente_documento: '20601234567',
    cliente_telefono: '969123456',
    cliente_direccion: 'Av. Los Álamos 450, Urb. Santa Isabel, Piura',
    estado: 'BORRADOR',
    total: 312.50,
    notas: 'Atención preliminar de reposición semanal. Pendiente validar horario de recepción.',
    lineas: [
      {
        producto_id: 'TCA-029085',
        producto_nombre: 'FILETE DE ATÚN ARTESANAL CAMPOMAR',
        precio_unitario: 7.50,
        cantidad: 25,
        subtotal: 187.50,
        imagen: 'imagenes/029085.png',
      },
      {
        producto_id: 'TCA-042822',
        producto_nombre: 'ARROZ PREMIUM EXTRA AÑEJO INKARROZ',
        precio_unitario: 4.90,
        cantidad: 20,
        subtotal: 98.00,
        imagen: 'imagenes/042822.png',
      },
      {
        producto_id: 'TCA-079365',
        producto_nombre: 'HARINA PREPARADA BLANCA FLOR',
        precio_unitario: 5.40,
        cantidad: 5,
        subtotal: 27.00,
        imagen: 'imagenes/079365.png',
      },
    ],
    actor: 'ventas@tcadistrib.com',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'PED-2026-0002',
    cliente_nombre: 'MINIMARKET EL SOL S.A.C.',
    cliente_documento: '20509876543',
    cliente_telefono: '978654321',
    cliente_direccion: 'Calle Comercio 128, Centro, Sullana',
    estado: 'BORRADOR',
    total: 172.50,
    notas: 'Cotización borrador para fin de mes.',
    lineas: [
      {
        producto_id: 'TCA-PRD-0007',
        producto_nombre: 'ACEITE DE OLIVA EXTRA VIRGEN EL OLIVAR',
        precio_unitario: 11.50,
        cantidad: 15,
        subtotal: 172.50,
        imagen: 'imagenes/pamspry.png',
      },
    ],
    actor: 'ventas@tcadistrib.com',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

/**
 * Validador estricto según Criterios de Aceptación HU12:
 * 1. Cliente de prueba con nombre obligatorio
 * 2. Al menos una línea de producto seleccionada
 * 3. Cantidad entera estrictamente positiva (cantidad > 0)
 * 4. Precio unitario > 0
 * 5. Estado estrictamente 'BORRADOR'
 */
export function validateOrderDraft(order: Partial<OrderDraft>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 1. Cliente
  if (!order.cliente_nombre || order.cliente_nombre.trim() === '') {
    errors.push('El nombre o razón social del cliente es obligatorio.');
  } else if (order.cliente_nombre.trim().length < 3) {
    errors.push('El nombre del cliente debe tener al menos 3 caracteres.');
  }

  // 2. Líneas de productos
  if (!order.lineas || !Array.isArray(order.lineas) || order.lineas.length === 0) {
    errors.push('El pedido en borrador debe tener al menos un producto seleccionado.');
  } else {
    const seenProducts = new Set<string>();

    order.lineas.forEach((line, index) => {
      const pos = index + 1;
      if (!line.producto_id || String(line.producto_id).trim() === '') {
        errors.push(`Ítem #${pos}: Debe seleccionar un producto válido.`);
      }

      if (line.cantidad === undefined || line.cantidad === null || isNaN(line.cantidad)) {
        errors.push(`Ítem #${pos}: La cantidad es requerida.`);
      } else if (!Number.isInteger(Number(line.cantidad)) || Number(line.cantidad) <= 0) {
        errors.push(`Ítem #${pos}: La cantidad debe ser un número entero positivo mayor a 0 (recibido: ${line.cantidad}).`);
      }

      if (line.precio_unitario === undefined || line.precio_unitario === null || Number(line.precio_unitario) <= 0) {
        errors.push(`Ítem #${pos}: El precio unitario debe ser mayor a 0.`);
      }

      const pKey = String(line.producto_id).toLowerCase();
      if (seenProducts.has(pKey)) {
        errors.push(`El producto "${line.producto_nombre || line.producto_id}" aparece repetido en el pedido. Agrupa las cantidades.`);
      }
      seenProducts.add(pKey);
    });
  }

  // 3. Estado
  if (order.estado !== 'BORRADOR') {
    errors.push('El estado inicial del pedido debe ser estrictamente "BORRADOR".');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generar nuevo correlativo de pedido
 */
export function generateOrderNumber(existingOrders: OrderDraft[]): string {
  const year = new Date().getFullYear();
  const pattern = new RegExp(`^PED-${year}-(\\d{4})$`);
  let maxSeq = 0;

  for (const o of existingOrders) {
    const match = o.id.match(pattern);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (seq > maxSeq) maxSeq = seq;
    }
  }

  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `PED-${year}-${nextSeq}`;
}

/**
 * Obtener todos los pedidos en borrador persistentes tras recarga
 */
export async function getDraftOrders(): Promise<{
  data: OrderDraft[];
  source: 'supabase' | 'local';
  error?: string;
}> {
  // 1. Intentar cargar desde Supabase
  try {
    const { data: pedidosData, error: pedidosErr } = await supabase
      .from('pedidos')
      .select('*, pedido_lineas(*)')
      .order('created_at', { ascending: false });

    if (!pedidosErr && pedidosData && pedidosData.length > 0) {
      const mapped: OrderDraft[] = pedidosData.map((p: Record<string, unknown>) => ({
        id: String(p.id || ''),
        cliente_nombre: String(p.cliente_nombre || ''),
        cliente_documento: String(p.cliente_documento || ''),
        cliente_telefono: String(p.cliente_telefono || ''),
        cliente_direccion: String(p.cliente_direccion || ''),
        estado: 'BORRADOR',
        total: Number(p.total) || 0,
        notas: String(p.notas || ''),
        actor: String(p.actor || 'ventas@tcadistrib.com'),
        created_at: p.created_at as string | undefined,
        updated_at: p.updated_at as string | undefined,
        lineas: (Array.isArray(p.pedido_lineas) ? p.pedido_lineas : []).map((l: Record<string, unknown>) => ({
          id: l.id as string | number | undefined,
          pedido_id: l.pedido_id as string | undefined,
          producto_id: String(l.producto_id || ''),
          producto_nombre: String(l.producto_nombre || ''),
          precio_unitario: Number(l.precio_unitario) || 0,
          cantidad: Number(l.cantidad) || 0,
          subtotal: Number(l.subtotal) || 0,
          imagen: String(l.imagen || ''),
        })),
      }));

      // Cachear en localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      return { data: mapped, source: 'supabase' };
    }
  } catch (err: unknown) {
    console.warn('Conexión a Supabase para pedidos en borrador no disponible, usando caché local:', err);
  }

  // 2. Fallback persistente a localStorage
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { data: parsed, source: 'local' };
      }
    } catch {
      // JSON corrupto, regenerar
    }
  }

  // 3. Inicializar con pedidos semilla para primera visualización
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DRAFTS));
  return { data: INITIAL_DRAFTS, source: 'local' };
}

/**
 * Guardar pedido en borrador (NO reserva ni descuenta stock - Criterio 4 HU12)
 */
export async function saveDraftOrder(
  orderData: Omit<OrderDraft, 'id'> & { id?: string },
  existingOrders: OrderDraft[]
): Promise<{ success: boolean; data?: OrderDraft; error?: string }> {
  // Asegurar estado BORRADOR y totales coherentes
  const totalCalculado = (orderData.lineas || []).reduce(
    (acc, l) => acc + Number(l.cantidad) * Number(l.precio_unitario),
    0
  );

  const orderId = orderData.id || generateOrderNumber(existingOrders);

  const finalOrder: OrderDraft = {
    ...orderData,
    id: orderId,
    estado: 'BORRADOR',
    total: Number(totalCalculado.toFixed(2)),
    cliente_nombre: (orderData.cliente_nombre || '').trim(),
    cliente_documento: (orderData.cliente_documento || '').trim(),
    cliente_telefono: (orderData.cliente_telefono || '').trim(),
    cliente_direccion: (orderData.cliente_direccion || '').trim(),
    notas: (orderData.notas || '').trim(),
    actor: orderData.actor || 'ventas@tcadistrib.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lineas: (orderData.lineas || []).map((l) => ({
      ...l,
      pedido_id: orderId,
      cantidad: Number(l.cantidad),
      precio_unitario: Number(l.precio_unitario),
      subtotal: Number((Number(l.cantidad) * Number(l.precio_unitario)).toFixed(2)),
    })),
  };

  // Validar
  const validation = validateOrderDraft(finalOrder);
  if (!validation.valid) {
    return { success: false, error: validation.errors.join(' ') };
  }

  // 1. Intentar persistir en Supabase
  try {
    const { error: pErr } = await supabase.from('pedidos').upsert({
      id: finalOrder.id,
      cliente_nombre: finalOrder.cliente_nombre,
      cliente_documento: finalOrder.cliente_documento,
      cliente_telefono: finalOrder.cliente_telefono,
      cliente_direccion: finalOrder.cliente_direccion,
      estado: 'BORRADOR',
      total: finalOrder.total,
      notas: finalOrder.notas,
      actor: finalOrder.actor,
      created_at: finalOrder.created_at,
      updated_at: finalOrder.updated_at,
    });

    if (!pErr) {
      // Eliminar líneas previas para evitar duplicados si era edición
      await supabase.from('pedido_lineas').delete().eq('pedido_id', finalOrder.id);

      const dbLines = finalOrder.lineas.map((l) => ({
        pedido_id: finalOrder.id,
        producto_id: l.producto_id,
        producto_nombre: l.producto_nombre,
        precio_unitario: l.precio_unitario,
        cantidad: l.cantidad,
        subtotal: l.subtotal,
      }));

      await supabase.from('pedido_lineas').insert(dbLines);
    }
  } catch (err: unknown) {
    console.warn('Aviso Supabase guardar pedido (se persiste en local):', err);
  }

  // 2. Persistir siempre en localStorage para garantizar persistencia tras recarga
  const updatedList = [finalOrder, ...existingOrders.filter((o) => o.id !== finalOrder.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

  return { success: true, data: finalOrder };
}

/**
 * Eliminar pedido en borrador
 */
export async function deleteDraftOrder(
  orderId: string,
  existingOrders: OrderDraft[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await supabase.from('pedidos').delete().eq('id', orderId);
  } catch (err: unknown) {
    console.warn('Aviso Supabase eliminar pedido:', err);
  }

  const filtered = existingOrders.filter((o) => o.id !== orderId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return { success: true };
}
