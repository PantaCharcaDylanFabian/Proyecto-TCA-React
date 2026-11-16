import React, { useState, useEffect } from 'react';
import type { ManagedProduct } from '../types';
import {
  getManagedProducts,
  saveManagedProduct,
  updateManagedProduct,
  deleteManagedProduct,
} from '../services/productService';
import { ProductFormModal } from '../components/admin/ProductFormModal';
import { CatalogImportModal } from '../components/admin/CatalogImportModal';
import { getImageUrl, handleImageError } from '../utils/image';
import { useUI } from '../context/UIContext';

export const ProductManagementPage: React.FC = () => {
  const { navigate } = useUI();
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>('local');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ManagedProduct | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const result = await getManagedProducts();
    setProducts(result.data);
    setDataSource(result.source);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    getManagedProducts().then((result) => {
      if (active) {
        setProducts(result.data);
        setDataSource(result.source);
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
    setProductToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: ManagedProduct) => {
    setProductToEdit(product);
    setIsFormOpen(true);
  };

  const handleSave = async (productData: ManagedProduct) => {
    if (productToEdit) {
      const res = await updateManagedProduct(productToEdit.codigo, productData, products);
      if (res.success) {
        showToast(`✓ Producto "${productData.codigo}" actualizado correctamente.`);
        loadData();
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const res = await saveManagedProduct(productData, products);
      if (res.success) {
        showToast(`✓ Producto "${productData.codigo}" registrado exitosamente.`);
        loadData();
        return { success: true };
      }
      return { success: false, error: res.error };
    }
  };

  const handleDelete = async (codigo: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar el producto con código "${codigo}"?`)) {
      await deleteManagedProduct(codigo, products);
      showToast(`Producto "${codigo}" eliminado del catálogo.`);
      loadData();
    }
  };

  // Unique categories list for dropdown
  const categoriesList = Array.from(new Set(products.map((p) => p.categoria).filter(Boolean)));

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchTerm === '' ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.marca && p.marca.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || p.categoria === categoryFilter;
    const matchesLowStock = !onlyLowStock || p.stock_actual < p.stock_minimo;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Calculate statistics
  const totalValue = products.reduce((acc, p) => acc + p.precio * p.stock_actual, 0);
  const lowStockCount = products.filter((p) => p.stock_actual < p.stock_minimo).length;

  return (
    <div className="w-full bg-[#f9f9fb] min-h-screen pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-[9999] bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="max-w-[1200px] mx-auto pt-6 px-5 text-xs text-gray-500">
        <a
          href="index.html"
          onClick={(e) => {
            e.preventDefault();
            navigate('index.html');
          }}
          className="text-[#C32228] font-bold no-underline hover:underline"
        >
          Inicio
        </a>{' '}
        &gt; <strong className="text-gray-900">Gestión de Productos (HU11)</strong>
      </div>

      <div className="max-w-[1200px] mx-auto mt-4 px-5">
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black text-white bg-[#C32228] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Ticket KAN-26
              </span>
              <span
                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                  dataSource === 'supabase'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    dataSource === 'supabase' ? 'bg-emerald-600' : 'bg-amber-500'
                  }`}
                ></span>
                {dataSource === 'supabase' ? 'Supabase Conectado' : 'Almacenamiento Local Persistente'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 m-0">
              Gestión de Catálogo y Productos (HU11)
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 m-0 mt-1">
              Crear y editar productos con código único, precio consistente, y auditoría de importación JSON.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-[#C32228] hover:bg-[#a00000] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border-none flex items-center gap-1.5"
            >
              <span>+</span> Nuevo Producto
            </button>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-800 font-extrabold text-xs sm:text-sm rounded-xl border border-gray-300 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              Importar Catálogo JSON
            </button>
          </div>
        </div>

        {/* Resumen de Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Total Productos
            </span>
            <span className="text-2xl font-black text-gray-900">{products.length}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Categorías
            </span>
            <span className="text-2xl font-black text-gray-900">{categoriesList.length}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Stock Bajo Mínimo
            </span>
            <span
              className={`text-2xl font-black ${
                lowStockCount > 0 ? 'text-red-600' : 'text-emerald-600'
              }`}
            >
              {lowStockCount}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Valor Almacén
            </span>
            <span className="text-2xl font-black text-[#C32228]">
              S/. {totalValue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, nombre o marca..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-800 outline-none focus:border-[#C32228] transition-colors"
            />
            <svg
              className="absolute left-3 top-2.5 text-gray-400"
              width="15"
              height="15"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 px-3 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-800 bg-white outline-none focus:border-[#C32228]"
            >
              <option value="ALL">Todas las Categorías</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                onlyLowStock
                  ? 'bg-red-50 border-red-500 text-red-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Bajo Stock ({lowStockCount})
            </button>

            <button
              type="button"
              onClick={loadData}
              title="Recargar datos"
              className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:text-[#C32228] hover:bg-gray-50 transition-colors cursor-pointer bg-white"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Tabla de Productos */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500 font-medium text-sm">
              Cargando catálogo maestro...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-sm font-medium mb-3">
                No se encontraron productos con los criterios seleccionados.
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="px-4 py-2 bg-[#C32228] text-white text-xs font-bold rounded-lg cursor-pointer border-none"
              >
                Registrar Primer Producto
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[11px] tracking-wider">
                    <th className="p-3.5 pl-5">Producto</th>
                    <th className="p-3.5">Código</th>
                    <th className="p-3.5">Categoría</th>
                    <th className="p-3.5">Precio</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 pr-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((p) => {
                    const isLow = p.stock_actual < p.stock_minimo;
                    return (
                      <tr key={p.codigo} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3.5 pl-5 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg p-1 flex items-center justify-center flex-shrink-0">
                            <img
                              src={getImageUrl(p.imagen)}
                              alt={p.nombre}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => handleImageError(e, p.nombre)}
                            />
                          </div>
                          <div>
                            <span className="font-extrabold text-gray-900 block leading-tight">
                              {p.nombre}
                            </span>
                            {p.marca && (
                              <span className="text-[11px] font-bold text-gray-400 uppercase">
                                {p.marca}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs">
                            {p.codigo}
                          </span>
                        </td>

                        <td className="p-3.5 text-gray-600 font-medium">
                          {p.categoria}
                        </td>

                        <td className="p-3.5 font-bold text-[#C32228]">
                          S/. {p.precio.toFixed(2)}
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span className={`font-black ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                              {p.stock_actual}
                            </span>
                            <span className="text-gray-400 text-xs">/ mín {p.stock_minimo}</span>
                            {isLow && (
                              <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                                Reponer
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              p.activo
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {p.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>

                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 text-gray-600 hover:text-[#C32228] hover:bg-red-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                              title="Editar producto"
                            >
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(p.codigo)}
                              className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                              title="Eliminar producto"
                            >
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modales HU11 */}
      {isFormOpen && (
        <ProductFormModal
          key={productToEdit?.codigo || 'new'}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
          productToEdit={productToEdit}
          existingProducts={products}
        />
      )}

      <CatalogImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        existingProducts={products}
        onImportCompleted={loadData}
      />
    </div>
  );
};
