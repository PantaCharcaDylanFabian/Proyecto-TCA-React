/**
 * Servicio de Base de Datos Supabase & Persistencia Local
 * Conecta con PostgreSQL de Supabase o utiliza el catálogo depurado en memoria con total resiliencia.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

class SupabaseService {
  constructor() {
    this.client = null;
    this.localCatalog = [];
    this.localOrders = [];
    this.localMovements = [];
    this.init();
  }

  init() {
    // 1. Cargar catálogo de respaldo
    const catalogPaths = [
      path.join(process.cwd(), 'ai_analytics', 'catalogo-depurado.json'),
      path.join(process.cwd(), 'back', 'ai_analytics', 'catalogo-depurado.json'),
      path.join(process.cwd(), 'bd', 'data', 'catalogo-depurado.json'),
      path.join(process.cwd(), '..', 'bd', 'data', 'catalogo-depurado.json')
    ];
    for (const p of catalogPaths) {
      if (fs.existsSync(p)) {
        try {
          this.localCatalog = JSON.parse(fs.readFileSync(p, 'utf8'));
          break;
        } catch { /* continuar */ }
      }
    }

    // 2. Conectar a Supabase si existen variables de entorno
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (supabaseUrl && supabaseKey && !supabaseKey.includes('dummy')) {
      try {
        this.client = createClient(supabaseUrl, supabaseKey);
        console.log('[SupabaseService] Cliente Supabase inicializado correctamente.');
      } catch (err) {
        console.warn('[SupabaseService] No se pudo inicializar Supabase; operando en modo local resiliente.', err.message);
      }
    } else {
      console.log('[SupabaseService] Modo local activo con catálogo depurado maestro.');
    }
  }

  async getProductos({ search = '', categoria = '', limit = 50, offset = 0 } = {}) {
    if (this.client) {
      try {
        let query = this.client.from('productos').select('*');
        if (categoria) query = query.eq('categoria', categoria);
        if (search) query = query.ilike('nombre', `%${search}%`);
        query = query.range(offset, offset + limit - 1);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return { total: data.length, data, source: 'supabase' };
        }
      } catch { /* fallback a local */ }
    }

    // Modo local / Fallback
    let items = [...this.localCatalog];
    if (categoria) {
      items = items.filter(p => (p.categoria || '').toUpperCase().includes(categoria.toUpperCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(p => (p.nombre || '').toLowerCase().includes(q) || (p.codigo || '').toLowerCase().includes(q));
    }

    const total = items.length;
    const paginated = items.slice(offset, offset + limit);
    return { total, data: paginated, source: 'local_master_catalog' };
  }

  async getProductoByCodigo(codigo) {
    if (!codigo) return null;
    const clean = codigo.trim().toUpperCase();

    if (this.client) {
      try {
        const { data, error } = await this.client.from('productos').select('*').eq('codigo', clean).maybeSingle();
        if (!error && data) return { data, source: 'supabase' };
      } catch { /* continuar a local */ }
    }

    const found = this.localCatalog.find(p => (p.codigo || '').toUpperCase() === clean);
    return found ? { data: found, source: 'local_master_catalog' } : null;
  }

  async guardarProducto(productData) {
    if (!productData || !productData.codigo || !productData.nombre) {
      throw new Error('Código y nombre de producto son obligatorios.');
    }

    const cleanCode = productData.codigo.trim().toUpperCase();
    const existingIndex = this.localCatalog.findIndex(p => (p.codigo || '').toUpperCase() === cleanCode);

    const record = {
      ...productData,
      codigo: cleanCode,
      precio: Number(productData.precio || 10.0),
      stock_actual: Number(productData.stock_actual || 0),
      stock_minimo: Number(productData.stock_minimo || 5),
      stock_objetivo: Number(productData.stock_objetivo || (Number(productData.stock_minimo || 5) * 3)),
      activo: productData.activo !== false,
      actualizado_en: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      this.localCatalog[existingIndex] = { ...this.localCatalog[existingIndex], ...record };
    } else {
      this.localCatalog.unshift(record);
    }

    if (this.client) {
      try {
        await this.client.from('productos').upsert(record);
      } catch { /* registro persistido localmente */ }
    }

    return record;
  }

  async getInventario() {
    const { data: productos } = await this.getProductos({ limit: 500 });
    
    let totalStock = 0;
    let valorTotal = 0;
    let quiebreCount = 0;
    let alertaCount = 0;
    let optimoCount = 0;

    const items = productos.map(p => {
      const stock = Number(p.stock_actual || 0);
      const min = Number(p.stock_minimo || 10);
      const precio = Number(p.precio || 0);
      const valor = stock * precio;
      
      totalStock += stock;
      valorTotal += valor;

      let estado = 'ÓPTIMO';
      if (stock === 0) {
        estado = 'QUIEBRE';
        quiebreCount++;
      } else if (stock <= min) {
        estado = 'ALERTA (Bajo)';
        alertaCount++;
      } else {
        optimoCount++;
      }

      return {
        codigo: p.codigo,
        nombre: p.nombre,
        categoria: p.categoria,
        precio,
        stockActual: stock,
        stockMinimo: min,
        stockObjetivo: p.stock_objetivo || (min * 3),
        valorTotalInventario: Math.round(valor * 100) / 100,
        estado
      };
    });

    return {
      resumen: {
        totalProductos: productos.length,
        totalUnidadesFisicas: totalStock,
        valoracionTotalSoles: Math.round(valorTotal * 100) / 100,
        enQuiebre: quiebreCount,
        enAlerta: alertaCount,
        optimo: optimoCount
      },
      items
    };
  }

  async registrarMovimiento({ codigo, tipo, cantidad, motivo = 'Ajuste operativo' }) {
    if (!codigo || !cantidad || cantidad <= 0) {
      throw new Error('Código y cantidad positiva son requeridos.');
    }
    const cleanCode = codigo.trim().toUpperCase();
    const prod = this.localCatalog.find(p => (p.codigo || '').toUpperCase() === cleanCode);
    if (!prod) throw new Error(`Producto ${codigo} no encontrado.`);

    const qty = Number(cantidad);
    const stockPrevio = prod.stock_actual || 0;
    let stockNuevo = stockPrevio;

    if (tipo === 'ENTRADA') {
      stockNuevo = stockPrevio + qty;
    } else if (tipo === 'SALIDA') {
      if (stockPrevio < qty) throw new Error(`Stock insuficiente (${stockPrevio} disponibles para salida de ${qty}).`);
      stockNuevo = stockPrevio - qty;
    } else {
      stockNuevo = qty;
    }

    prod.stock_actual = stockNuevo;

    const mov = {
      id: `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      codigo: cleanCode,
      tipo,
      cantidad: qty,
      stockPrevio,
      stockNuevo,
      motivo,
      fecha: new Date().toISOString()
    };
    this.localMovements.push(mov);

    return { movimiento: mov, stockActualizado: stockNuevo };
  }

  async guardarPedidoBorrador(pedido) {
    if (!pedido || !pedido.cliente_nombre) {
      throw new Error('El nombre del cliente es obligatorio.');
    }
    if (!Array.isArray(pedido.lineas) || pedido.lineas.length === 0) {
      throw new Error('El pedido debe tener al menos una línea de producto.');
    }

    let total = 0;
    const lineasProcesadas = pedido.lineas.map(linea => {
      const prod = this.localCatalog.find(p => (p.codigo || '').toUpperCase() === (linea.producto_id || '').toUpperCase());
      const precioUnitario = prod ? Number(prod.precio || 1) : Number(linea.precio_unitario || 1);
      const subtotal = precioUnitario * Number(linea.cantidad || 1);
      total += subtotal;
      return {
        producto_id: linea.producto_id,
        nombre: prod ? prod.nombre : 'Producto',
        cantidad: Number(linea.cantidad || 1),
        precio_unitario: precioUnitario,
        subtotal: Math.round(subtotal * 100) / 100
      };
    });

    const draft = {
      id: pedido.id || `PED-${Date.now()}`,
      cliente_nombre: pedido.cliente_nombre,
      cliente_documento: pedido.cliente_documento || '00000000',
      cliente_telefono: pedido.cliente_telefono || '',
      estado: 'BORRADOR',
      lineas: lineasProcesadas,
      total: Math.round(total * 100) / 100,
      creado_en: new Date().toISOString()
    };

    this.localOrders.push(draft);
    return draft;
  }

  async getPedidos() {
    return { total: this.localOrders.length, data: this.localOrders };
  }

  async confirmarPedido(id) {
    const ord = this.localOrders.find(o => o.id === id);
    if (!ord) throw new Error(`Pedido ${id} no encontrado.`);
    if (ord.estado !== 'BORRADOR') throw new Error(`Solo pedidos en BORRADOR pueden ser confirmados.`);
    ord.estado = 'CONFIRMADO';
    ord.confirmado_en = new Date().toISOString();
    return ord;
  }
}

export const supabaseService = new SupabaseService();
