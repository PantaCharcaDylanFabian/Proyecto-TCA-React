import React, { useState, useEffect } from 'react';
import type { OrderDraft, ManagedProduct } from '../types';
import {
  getDraftOrders,
  saveDraftOrder,
  deleteDraftOrder,
} from '../services/orderService';
import { getManagedProducts } from '../services/productService';
import { OrderDraftFormModal } from '../components/orders/OrderDraftFormModal';
import { useUI } from '../context/UIContext';

export const OrdersPage: React.FC = () => {
  const { navigate } = useUI();
  const [orders, setOrders] = useState<OrderDraft[]>([]);
  const [availableProducts, setAvailableProducts] = useState<ManagedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>('local');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<OrderDraft | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDraft | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [ordersRes, prodsRes] = await Promise.all([
      getDraftOrders(),
      getManagedProducts(),
    ]);

    setOrders(ordersRes.data);
    setDataSource(ordersRes.source);
    setAvailableProducts(prodsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    Promise.all([getDraftOrders(), getManagedProducts()]).then(([ordersRes, prodsRes]) => {
      if (active) {
        setOrders(ordersRes.data);
        setDataSource(ordersRes.source);
        setAvailableProducts(prodsRes.data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenCreate = () => {
    setOrderToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (order: OrderDraft) => {
    setOrderToEdit(order);
    setIsFormOpen(true);
  };

  const handleSaveOrder = async (orderData: OrderDraft) => {
    const res = await saveDraftOrder(orderData, orders);
    if (res.success && res.data) {
      showToast(`✓ Pedido "${res.data.id}" guardado en Borrador exitosamente.`);
      loadData();
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el pedido en borrador "${orderId}"?`)) {
      await deleteDraftOrder(orderId, orders);
      showToast(`Pedido "${orderId}" eliminado.`);
      loadData();
    }
  };

  // Filtrado de pedidos
  const filteredOrders = orders.filter((o) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.id.toLowerCase().includes(term) ||
      o.cliente_nombre.toLowerCase().includes(term) ||
      (o.cliente_documento && o.cliente_documento.toLowerCase().includes(term))
    );
  });

  const totalCarteraBorrador = orders.reduce((acc, o) => acc + o.total, 0);
  const totalItemsEnBorrador = orders.reduce(
    (acc, o) => acc + (o.lineas ? o.lineas.reduce((lAcc, l) => lAcc + l.cantidad, 0) : 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20 pt-6">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-emerald-800 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs sm:text-sm animate-in fade-in slide-in-from-top-4 duration-300">
            {toastMessage}
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <a
            href="index.html"
            onClick={(e) => {
              e.preventDefault();
              navigate('index.html');
            }}
            className="hover:text-[#C32228] transition-colors"
          >
            Inicio
          </a>
          <span>/</span>
          <span className="text-gray-900 font-bold">Ventas · Pedidos en Borrador (HU12)</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black tracking-widest text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full uppercase">
                HU12 · KAN-27
              </span>
              <span className="text-[10px] font-bold text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full uppercase">
                Módulo Ventas
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  dataSource === 'supabase'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                ● {dataSource === 'supabase' ? 'Supabase Nube' : 'Local Persistente'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 m-0 tracking-tight">
              Gestión de Pedidos en Borrador
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 m-0 mt-1">
              Crea y consulta pedidos preliminares con clientes de prueba y cantidades verificadas sin perder el registro tras recargar.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm rounded-xl cursor-pointer border-none shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>+ Nuevo Pedido en Borrador</span>
            </button>
          </div>
        </div>

        {/* Aviso de Alcance de Negocio (Criterio 4 HU12) */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 shadow-sm">
          <span className="text-2xl flex-shrink-0">📝</span>
          <div className="text-xs text-amber-950 leading-relaxed">
            <strong className="block text-amber-900 font-bold mb-0.5">
              Criterio de Aceptación HU12 (Sprint 1):
            </strong>
            Guardar un pedido en estado <strong>Borrador</strong> permite mantener el registro de cabecera e ítems de
            forma persistente tras recarga. <strong>No reserva ni descuenta stock físico en almacén</strong> y no promete
            confirmación al cliente. Esa transición a reserva oficial de stock se implementará en el Sprint 2 según HU05.
          </div>
        </div>

        {/* Dashboard de Métricas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] font-bold text-gray-500 uppercase block tracking-wider">
              Total Pedidos Borrador
            </span>
            <span className="text-2xl sm:text-3xl font-black text-gray-900 block mt-1">
              {orders.length}
            </span>
            <span className="text-[10px] text-amber-700 font-semibold">En atención preliminar</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] font-bold text-gray-500 uppercase block tracking-wider">
              Monto en Cartera
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#C32228] block mt-1 truncate">
              S/. {totalCarteraBorrador.toFixed(2)}
            </span>
            <span className="text-[10px] text-gray-400">Total valorizado preliminar</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] font-bold text-gray-500 uppercase block tracking-wider">
              Unidades Solicitadas
            </span>
            <span className="text-2xl sm:text-3xl font-black text-gray-900 block mt-1">
              {totalItemsEnBorrador}
            </span>
            <span className="text-[10px] text-gray-400">Sin descontar de inventario</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] font-bold text-gray-500 uppercase block tracking-wider">
              Productos Disponibles
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 block mt-1">
              {availableProducts.length}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Catálogo depurado TK11</span>
          </div>
        </div>

        {/* Controles de Búsqueda y Filtro */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-[450px]">
            <input
              type="text"
              placeholder="Buscar por código de pedido, cliente o RUC/DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-amber-500 transition-colors"
            />
            <svg
              className="absolute left-3 top-2.5 text-gray-400"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="px-3.5 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 cursor-pointer flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>Recargar</span>
          </button>
        </div>

        {/* Tabla de Pedidos en Borrador */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              Cargando pedidos en borrador desde el almacén persistente...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 text-sm m-0">No se encontraron pedidos en borrador que coincidan con la búsqueda.</p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer border-none transition-colors"
              >
                + Crear el primer pedido en borrador
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="p-4 pl-6">Pedido</th>
                    <th className="p-4">Cliente / Razón Social</th>
                    <th className="p-4">Fecha Registro</th>
                    <th className="p-4 text-center">Ítems</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 pr-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="p-4 pl-6">
                        <span className="font-mono font-black text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md text-xs">
                          {order.id}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-black text-gray-900">{order.cliente_nombre}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                          {order.cliente_documento && <span>Doc: {order.cliente_documento}</span>}
                          {order.cliente_telefono && <span>· Tel: {order.cliente_telefono}</span>}
                        </div>
                      </td>

                      <td className="p-4 text-gray-500 text-xs">
                        {order.created_at ? new Date(order.created_at).toLocaleString('es-PE') : 'Reciente'}
                      </td>

                      <td className="p-4 text-center">
                        <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                          {order.lineas ? order.lineas.length : 0} prod.
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <span className="font-black text-[#C32228] text-sm sm:text-base">
                          S/. {order.total.toFixed(2)}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          Borrador
                        </span>
                      </td>

                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderDetail(order)}
                            className="px-2.5 py-1 text-xs font-bold text-gray-700 hover:text-amber-700 bg-gray-100 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer border-none"
                            title="Ver detalle del borrador"
                          >
                            Detalle
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(order)}
                            className="p-1.5 text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                            title="Editar pedido"
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                            title="Eliminar borrador"
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear / Editar Pedido en Borrador */}
      {isFormOpen && (
        <OrderDraftFormModal
          key={orderToEdit?.id || 'new'}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveOrder}
          orderToEdit={orderToEdit}
          existingOrders={orders}
          availableProducts={availableProducts}
        />
      )}

      {/* Modal Detalle de Pedido */}
      {selectedOrderDetail && (
        <div
          className="fixed inset-0 bg-black/65 z-[9999] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedOrderDetail(null)}
        >
          <div
            className="bg-white w-full max-w-[650px] rounded-3xl p-6 sm:p-8 relative shadow-2xl border-t-[6px] border-amber-500 my-auto max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedOrderDetail(null)}
              className="absolute top-4 right-5 bg-transparent border-none text-2xl text-gray-400 hover:text-gray-800 cursor-pointer p-1"
            >
              &times;
            </button>

            <div className="mb-4">
              <span className="text-[11px] font-black uppercase text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                Estado: Borrador (Sin Reserva de Stock)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 m-0 mt-2">
                Pedido {selectedOrderDetail.id}
              </h3>
              <p className="text-xs text-gray-500 m-0 mt-0.5">
                Registrado el {selectedOrderDetail.created_at ? new Date(selectedOrderDetail.created_at).toLocaleString('es-PE') : 'Reciente'}
              </p>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-2xl mb-4 text-xs space-y-1">
              <div>
                <strong>Cliente:</strong> {selectedOrderDetail.cliente_nombre}
              </div>
              {selectedOrderDetail.cliente_documento && (
                <div>
                  <strong>Documento / RUC:</strong> {selectedOrderDetail.cliente_documento}
                </div>
              )}
              {selectedOrderDetail.cliente_direccion && (
                <div>
                  <strong>Dirección:</strong> {selectedOrderDetail.cliente_direccion}
                </div>
              )}
              {selectedOrderDetail.notas && (
                <div className="text-gray-600 pt-1">
                  <strong>Observación:</strong> {selectedOrderDetail.notas}
                </div>
              )}
            </div>

            <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 m-0 mb-2">
              Líneas del Pedido ({selectedOrderDetail.lineas ? selectedOrderDetail.lineas.length : 0})
            </h4>

            <div className="border border-gray-200 rounded-2xl overflow-y-auto max-h-[220px] mb-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 text-gray-600 font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5 pl-3">Producto</th>
                    <th className="p-2.5 text-center">Cant.</th>
                    <th className="p-2.5 text-right">Precio Unit.</th>
                    <th className="p-2.5 pr-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(selectedOrderDetail.lineas || []).map((l) => (
                    <tr key={l.producto_id}>
                      <td className="p-2.5 pl-3">
                        <div className="font-bold text-gray-900">{l.producto_nombre}</div>
                        <div className="text-[10px] text-gray-400">Cód: {l.producto_id}</div>
                      </td>
                      <td className="p-2.5 text-center font-bold text-gray-700">{l.cantidad}</td>
                      <td className="p-2.5 text-right">S/. {l.precio_unitario.toFixed(2)}</td>
                      <td className="p-2.5 pr-3 text-right font-black text-amber-900">
                        S/. {l.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-xs font-bold text-gray-500">Total del Borrador:</span>
              <span className="text-xl font-black text-[#C32228]">
                S/. {selectedOrderDetail.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
