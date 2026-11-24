import React, { useState } from 'react';
import type { OrderDraft, OrderDraftLine, ManagedProduct } from '../../types';
import { CLIENTES_PRUEBA } from '../../services/orderService';
import { getImageUrl, handleImageError } from '../../utils/image';

interface OrderDraftFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: OrderDraft) => Promise<{ success: boolean; error?: string }>;
  orderToEdit: OrderDraft | null;
  existingOrders: OrderDraft[];
  availableProducts: ManagedProduct[];
}

export const OrderDraftFormModal: React.FC<OrderDraftFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  orderToEdit,
  availableProducts,
}) => {
  const isEditing = !!orderToEdit;

  // Form State
  const [clienteNombre, setClienteNombre] = useState(orderToEdit?.cliente_nombre || '');
  const [clienteDocumento, setClienteDocumento] = useState(orderToEdit?.cliente_documento || '');
  const [clienteTelefono, setClienteTelefono] = useState(orderToEdit?.cliente_telefono || '');
  const [clienteDireccion, setClienteDireccion] = useState(orderToEdit?.cliente_direccion || '');
  const [notas, setNotas] = useState(orderToEdit?.notas || '');
  const [lineas, setLineas] = useState<OrderDraftLine[]>(orderToEdit?.lineas || []);

  // Line item addition state
  const [selectedProductCode, setSelectedProductCode] = useState(
    availableProducts.length > 0 ? availableProducts[0].codigo : ''
  );
  const [itemQuantity, setItemQuantity] = useState<number>(10);

  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Populate client from test preset (Criterio 1 HU12)
  const handleSelectPresetClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const preset = CLIENTES_PRUEBA.find((c) => c.documento === val);
    if (preset) {
      setClienteNombre(preset.nombre);
      setClienteDocumento(preset.documento);
      setClienteTelefono(preset.telefono);
      setClienteDireccion(preset.direccion);
    }
  };

  // Add line item to draft
  const handleAddLineItem = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const product = availableProducts.find((p) => p.codigo === selectedProductCode);
    if (!product) {
      setErrorMessage('Por favor selecciona un producto válido.');
      return;
    }

    const qty = Number(itemQuantity);
    if (!Number.isSafeInteger(qty) || qty <= 0) {
      setErrorMessage('La cantidad debe ser un número entero estrictamente positivo (> 0).');
      return;
    }

    // Check if product already exists in draft lines
    const existingIndex = lineas.findIndex((l) => l.producto_id === product.codigo);
    if (existingIndex >= 0) {
      // Update quantity
      const updated = [...lineas];
      const newQty = updated[existingIndex].cantidad + qty;
      updated[existingIndex] = {
        ...updated[existingIndex],
        cantidad: newQty,
        subtotal: Number((newQty * updated[existingIndex].precio_unitario).toFixed(2)),
      };
      setLineas(updated);
    } else {
      const newLine: OrderDraftLine = {
        producto_id: product.codigo,
        producto_nombre: product.nombre,
        precio_unitario: product.precio,
        cantidad: qty,
        subtotal: Number((qty * product.precio).toFixed(2)),
        imagen: product.imagen || 'imagenes/pamspry.png',
      };
      setLineas([...lineas, newLine]);
    }

    // Reset input
    setItemQuantity(1);
  };

  const handleRemoveLine = (productCode: string) => {
    setLineas(lineas.filter((l) => l.producto_id !== productCode));
  };

  const handleUpdateLineQuantity = (productCode: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveLine(productCode);
      return;
    }
    setLineas(
      lineas.map((l) => {
        if (l.producto_id === productCode) {
          return {
            ...l,
            cantidad: newQty,
            subtotal: Number((newQty * l.precio_unitario).toFixed(2)),
          };
        }
        return l;
      })
    );
  };

  const calculateTotal = () => {
    return lineas.reduce((acc, l) => acc + l.subtotal, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!clienteNombre.trim()) {
      setErrorMessage('El nombre o razón social del cliente es obligatorio.');
      return;
    }

    if (lineas.length === 0) {
      setErrorMessage('Debes agregar al menos un producto al pedido en borrador.');
      return;
    }

    setBusy(true);

    const draftOrder: OrderDraft = {
      id: orderToEdit?.id || '',
      cliente_nombre: clienteNombre.trim(),
      cliente_documento: clienteDocumento.trim(),
      cliente_telefono: clienteTelefono.trim(),
      cliente_direccion: clienteDireccion.trim(),
      estado: 'BORRADOR',
      version: orderToEdit?.version,
      total: Number(calculateTotal().toFixed(2)),
      notas: notas.trim(),
      lineas,
    };

    try {
      const res = await onSave(draftOrder);
      if (res.success) onClose();
      else setErrorMessage(res.error || 'No se guardó el borrador.');
    } catch { setErrorMessage('No se guardó el borrador. Comprueba tu conexión.'); }
    finally { setBusy(false); }
  };

  const selectedProduct = availableProducts.find((p) => p.codigo === selectedProductCode);
  const selectedQuantity = lineas.find((line) => line.producto_id === selectedProductCode)?.cantidad ?? 0;

  return (
    <div
      className="tca-form-overlay fixed inset-0 bg-black/65 z-[9999] grid place-items-center p-4 backdrop-blur-sm"
      onClick={() => { if (!busy) onClose(); }}
    >
      <div
        className="tca-form-dialog bg-white w-full max-w-[850px] rounded-3xl p-6 sm:p-8 relative shadow-2xl border-t-[6px] border-amber-500"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? 'Editar borrador' : 'Crear borrador'}
      >
        <button
          onClick={onClose}
          disabled={busy}
          className="absolute top-4 right-5 bg-transparent border-none text-2xl text-gray-400 hover:text-amber-600 cursor-pointer p-1 leading-none transition-colors"
          aria-label="Cerrar modal"
        >
          &times;
        </button>

        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 m-0 pr-8">
            {isEditing ? 'Editar Pedido en Borrador' : 'Crear Pedido en Borrador'}
          </h3>
          {isEditing && <p className="text-xs text-gray-700 break-all">{orderToEdit?.id}</p>}

          {/* Aviso Criterio 4 HU12 */}
          <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
            <span className="text-base">ℹ️</span>
            <span>
              <strong>La reserva de stock se realiza al confirmar el pedido.</strong>
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 text-xs sm:text-sm font-semibold rounded-xl flex-shrink-0">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Sección 1: Datos del Cliente */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-4 flex-shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider m-0">
                1. Datos del Cliente de Prueba
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 font-semibold">Cargar datos rápidos:</span>
                <select
                  onChange={handleSelectPresetClient}
                  className="text-xs py-1 px-2.5 bg-white border border-gray-300 rounded-lg outline-none font-medium cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Seleccionar cliente demo...
                  </option>
                  {CLIENTES_PRUEBA.map((c) => (
                    <option key={c.documento} value={c.documento}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nombre o Razón Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Bodega San José E.I.R.L."
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">RUC o DNI</label>
                <input
                  type="text"
                  placeholder="Ej. 20601234567"
                  value={clienteDocumento}
                  onChange={(e) => setClienteDocumento(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono / WhatsApp</label>
                <input
                  type="text"
                  placeholder="Ej. 969123456"
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Dirección de Entrega</label>
                <input
                  type="text"
                  placeholder="Ej. Av. Los Álamos 450, Piura"
                  value={clienteDireccion}
                  onChange={(e) => setClienteDireccion(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Selección y Adición de Productos */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-4 flex-shrink-0">
            <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider m-0 mb-3">
              2. Agregar productos
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-7">
                <label htmlFor="draft-product" className="block text-xs font-bold text-gray-700 mb-1">Producto del catálogo</label>
                <select
                  id="draft-product"
                  value={selectedProductCode}
                  onChange={(e) => setSelectedProductCode(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-amber-500"
                >
                  {availableProducts.map((p) => (
                    <option key={p.codigo} value={p.codigo}>
                      [{p.codigo}] {p.nombre} — S/. {p.precio.toFixed(2)} (Stock físico: {p.stock_actual})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="draft-add-quantity" className="block text-xs font-bold text-gray-700 mb-1">Unidades a agregar</label>
                <input
                  id="draft-add-quantity"
                  aria-describedby="draft-selected-quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(Number(e.target.value))}
                  className="w-full text-xs sm:text-sm p-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-lg cursor-pointer transition-colors border-none shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>+ Agregar al Pedido</span>
                </button>
              </div>
            </div>
            <p id="draft-selected-quantity" className="text-xs text-gray-600" role="status">
              {selectedProduct && <>Ya en el pedido: <strong>{selectedQuantity}</strong> {selectedQuantity === 1 ? 'unidad' : 'unidades'}</>}
            </p>

            {selectedProduct && (
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                <img
                  src={getImageUrl(selectedProduct.imagen || '')}
                  alt={selectedProduct.nombre}
                  className="w-9 h-9 object-contain bg-white rounded p-0.5 border border-gray-200 flex-shrink-0"
                  onError={(e) => handleImageError(e, selectedProduct.nombre)}
                />
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-gray-900 truncate block">{selectedProduct.nombre}</span>
                  <span className="text-gray-500">
                    Marca: <strong>{selectedProduct.marca || 'TCA'}</strong> · Categoría:{' '}
                    <strong>{selectedProduct.categoria}</strong> · Precio:{' '}
                    <strong className="text-amber-800">S/. {selectedProduct.precio.toFixed(2)}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Sección 3: Tabla de Ítems Agregados al Borrador */}
          <div className="flex-1 flex flex-col mb-4 min-h-[140px]">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider m-0">
                3. Ítems del Pedido ({lineas.length})
              </h4>
              <span className="text-xs font-bold text-gray-500">
                Subtotal acumulado:{' '}
                <strong className="text-gray-900 font-black">S/. {calculateTotal().toFixed(2)}</strong>
              </span>
            </div>

            {lineas.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-2xl p-6 text-center text-gray-400 text-xs">
                Aún no has agregado ningún producto al borrador. Selecciona uno arriba y haz clic en "+ Agregar al Pedido".
              </div>
            ) : (
              <div className="tca-table border border-gray-200 rounded-2xl shadow-sm" tabIndex={0} role="region" aria-label="Ítems del pedido">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-100 text-gray-600 font-bold sticky top-0">
                    <tr>
                      <th className="p-2.5 pl-3">Producto</th>
                      <th className="p-2.5 text-center">Precio Unit.</th>
                      <th className="p-2.5 text-center">Cantidad en el pedido</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                      <th className="p-2.5 pr-3 text-center">Quitar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lineas.map((line) => (
                      <tr key={line.producto_id} className="hover:bg-amber-50/40">
                        <td className="p-2.5 pl-3">
                          <div className="font-bold text-gray-900">{line.producto_nombre}</div>
                          <div className="text-[10px] text-gray-400">Cód: {line.producto_id}</div>
                        </td>
                        <td className="p-2.5 text-center font-semibold text-gray-700">
                          S/. {line.precio_unitario.toFixed(2)}
                        </td>
                        <td className="p-2.5 text-center">
                          <input
                            aria-label={`Cantidad en el pedido de ${line.producto_nombre}`}
                            type="number"
                            min="1"
                            step="1"
                            value={line.cantidad}
                            onChange={(e) =>
                              handleUpdateLineQuantity(line.producto_id, Number(e.target.value))
                            }
                            className="w-16 p-1 text-center font-bold border border-gray-300 rounded outline-none"
                          />
                        </td>
                        <td className="p-2.5 text-right font-black text-amber-900">
                          S/. {line.subtotal.toFixed(2)}
                        </td>
                        <td className="p-2.5 pr-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(line.producto_id)}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer bg-transparent border-none text-base font-bold"
                            title="Eliminar ítem"
                          >
                            &times;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Notas u observaciones */}
          <div className="mb-4 flex-shrink-0">
            <label className="block text-xs font-bold text-gray-700 mb-1">Notas u Observaciones del Pedido</label>
            <input
              type="text"
              placeholder="Ej. Entrega preferente por la mañana, pago contra entrega en efectivo"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-amber-500"
            />
          </div>

          {/* Footer del Modal */}
          <div className="pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Total Borrador:</span>
              <span className="text-xl sm:text-2xl font-black text-[#C32228]">
                S/. {calculateTotal().toFixed(2)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm rounded-xl cursor-pointer border-none transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm rounded-xl cursor-pointer border-none shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {busy ? 'Guardando...' : isEditing ? 'Actualizar Borrador' : 'Guardar Pedido en Borrador'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
