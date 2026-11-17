import React, { useState } from 'react';
import type { ManagedProduct, ProductValidationError } from '../../types';
import { validateProduct } from '../../services/productService';
import { getImageUrl, handleImageError } from '../../utils/image';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ManagedProduct) => Promise<{ success: boolean; error?: string }>;
  productToEdit: ManagedProduct | null;
  existingProducts: ManagedProduct[];
}

const CATEGORY_OPTIONS = [
  'Aceites',
  'Aceitunas',
  'Conservas',
  'Arroz y Granos',
  'Menestras',
  'Galletas y Dulces',
  'Harinas',
  'Endulzantes',
  'Bebidas Sin Alcohol',
  'Bebidas Alcohólicas',
  'Cuidado Personal',
  'Limpieza del Hogar',
  'Papelería',
  'Hogar y Utilidades',
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  existingProducts,
}) => {
  const isEditing = !!productToEdit;

  const [formData, setFormData] = useState<ManagedProduct>(() => {
    if (productToEdit) {
      return productToEdit;
    }
    return {
      codigo: '',
      nombre: '',
      categoria: 'Aceites',
      marca: '',
      precio: 10.0,
      stock_minimo: 5,
      stock_actual: 20,
      stock_objetivo: 30,
      macro_categoria: 'Otros',
      codigo_barras: '',
      proveedor: '',
      imagen: 'imagenes/pamspry.png',
      activo: true,
    };
  });

  const [errors, setErrors] = useState<ProductValidationError[]>([]);
  const [busy, setBusy] = useState(false);
  const [generalError, setGeneralError] = useState('');

  if (!isOpen) return null;

  const getFieldError = (field: string) => {
    return errors.find((e) => e.field === field)?.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    // Validación cliente estricta según HU11
    const validationErrors = validateProduct(
      formData,
      existingProducts,
      isEditing,
      productToEdit?.codigo
    );

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setGeneralError(validationErrors.map(error => error.message).join(' '));
      return;
    }

    setBusy(true);
    try {
      const result = await onSave(formData);
      if (!result.success) {
        setGeneralError(result.error || 'Error al guardar el producto');
      } else {
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setGeneralError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[9999] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={() => { if (!busy) onClose(); }}
    >
      <div
        className="bg-white w-full max-w-[620px] rounded-2xl p-6 sm:p-8 relative shadow-2xl border-t-[5px] border-[#C32228] my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? 'Editar producto' : 'Crear producto'}
      >
        <button
          onClick={onClose}
          disabled={busy}
          className="absolute top-4 right-5 bg-transparent border-none text-2xl text-gray-400 hover:text-[#C32228] cursor-pointer p-1 leading-none transition-colors"
          aria-label="Cerrar modal"
        >
          &times;
        </button>

        <div className="mb-6">
          <span className="text-[11px] font-black tracking-widest text-[#C32228] bg-red-50 px-2.5 py-1 rounded-full uppercase">
            HU11 · Gestión de Catálogo
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 m-0 mt-2">
            {isEditing ? `Editar Producto: ${productToEdit.codigo}` : 'Registrar Nuevo Producto'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 m-0 mt-1">
            Todos los campos marcados con asterisco (*) son obligatorios y auditados por el sistema.
          </p>
        </div>

        {generalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          {/* Fila 1: Código y Marca */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                Código Único *
              </label>
              <input
                type="text"
                required
                value={formData.codigo}
                onChange={(e) => {
                  setFormData({ ...formData, codigo: e.target.value.toUpperCase() });
                  setErrors(errors.filter((err) => err.field !== 'codigo'));
                }}
                placeholder="Ej. 029085 o PRD-001"
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-gray-900 font-mono outline-none transition-colors ${
                  getFieldError('codigo') ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#C32228]'
                }`}
              />
              {getFieldError('codigo') && (
                <p className="text-red-600 text-[11px] font-bold mt-1 m-0">{getFieldError('codigo')}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                Marca
              </label>
              <input
                type="text"
                value={formData.marca || ''}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                placeholder="Ej. EL OLIVAR, MOLITALIA"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:border-[#C32228] transition-colors"
              />
            </div>
          </div>

          {/* Fila 2: Nombre */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
              Nombre del Producto *
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => {
                setFormData({ ...formData, nombre: e.target.value });
                setErrors(errors.filter((err) => err.field !== 'nombre'));
              }}
              placeholder="Ej. ACEITE DE OLIVA EXTRA VIRGEN 500ML"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-gray-900 outline-none transition-colors ${
                getFieldError('nombre') ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#C32228]'
              }`}
            />
            {getFieldError('nombre') && (
              <p className="text-red-600 text-[11px] font-bold mt-1 m-0">{getFieldError('nombre')}</p>
            )}
          </div>

          {/* Fila 3: Categoría y Precio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                Categoría *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => {
                  setFormData({ ...formData, categoria: e.target.value });
                  setErrors(errors.filter((err) => err.field !== 'categoria'));
                }}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white outline-none focus:border-[#C32228] transition-colors"
              >
                {Array.from(new Set([...CATEGORY_OPTIONS, formData.categoria, ...existingProducts.map(p => p.categoria)])).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                Precio (S/.) * &gt; 0
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-sm">S/.</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.precio || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 });
                    setErrors(errors.filter((err) => err.field !== 'precio'));
                  }}
                  placeholder="0.00"
                  className={`w-full pl-10 pr-3.5 py-2.5 border rounded-lg text-sm text-gray-900 outline-none transition-colors ${
                    getFieldError('precio') ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#C32228]'
                  }`}
                />
              </div>
              {getFieldError('precio') && (
                <p className="text-red-600 text-[11px] font-bold mt-1 m-0">{getFieldError('precio')}</p>
              )}
            </div>
          </div>

          {/* Fila 4: Stock Mínimo y Stock Actual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                Stock Mínimo (&gt;= 0)
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock_minimo}
                onChange={(e) =>
                  setFormData({ ...formData, stock_minimo: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:border-[#C32228] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                Stock Actual en Almacén
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock_actual}
                disabled={isEditing}
                onChange={(e) =>
                  setFormData({ ...formData, stock_actual: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:border-[#C32228] transition-colors"
              />
            </div>
          </div>

          {/* Fila 5: Referencia de Imagen */}
          <p className="text-xs text-gray-600">El saldo inicial queda auditado al crear el producto. Para cambiar existencias luego, registra una entrada o despacho.</p>
          <div className="tca-stack">
            <label className="tca-check"><input type="checkbox" checked={formData.datos_ejemplo || false} onChange={e => setFormData({ ...formData, datos_ejemplo: e.target.checked })} />Precios y existencias de ejemplo</label>
            <label>Objetivo de reposición<input type="number" min={formData.stock_minimo} step="1" value={formData.stock_objetivo ?? Math.max(30, formData.stock_minimo)} onChange={e => setFormData({ ...formData, stock_objetivo: Number(e.target.value) })} /></label>
            <label>Código de barras (opcional)<input maxLength={80} value={formData.codigo_barras || ''} onChange={e => setFormData({ ...formData, codigo_barras: e.target.value })} /></label>
            <label>Proveedor habitual<input maxLength={200} value={formData.proveedor || ''} onChange={e => setFormData({ ...formData, proveedor: e.target.value })} /></label>
            <label>Línea comercial<select value={formData.macro_categoria || 'Otros'} onChange={e => setFormData({ ...formData, macro_categoria: e.target.value })}>{['Alimentos','Bebidas','Limpieza del Hogar','Útiles de Oficina','Cuidado Personal','Otros'].map(c => <option key={c}>{c}</option>)}</select></label>
            <label>Subcategoría (identificador opcional)<input value={formData.subcategoria_slug || ''} onChange={e => setFormData({ ...formData, subcategoria_slug: e.target.value })} placeholder="Ej. papeleria-oficina" /></label>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
              Referencia de Imagen (Ruta en public/imagenes/)
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={formData.imagen || ''}
                onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                placeholder="imagenes/029085.png"
                className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 font-mono outline-none focus:border-[#C32228] transition-colors"
              />
              <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center p-1 flex-shrink-0">
                <img
                  src={getImageUrl(formData.imagen)}
                  alt="Vista previa"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => handleImageError(e, 'Preview')}
                />
              </div>
            </div>
          </div>

          {/* Fila 6: Estado Activo */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="chk-activo"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="w-4 h-4 text-[#C32228] rounded border-gray-300 focus:ring-[#C32228]"
            />
            <label htmlFor="chk-activo" className="text-xs sm:text-sm font-semibold text-gray-700 cursor-pointer">
              Producto activo en catálogo visible
            </label>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-6 py-2.5 rounded-lg bg-[#C32228] hover:bg-[#a00000] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer border-none flex items-center gap-2"
            >
              {busy ? 'Guardando…' : isEditing ? 'Actualizar Producto' : 'Registrar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
