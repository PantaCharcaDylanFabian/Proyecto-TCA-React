import React, { useState } from 'react';
import type { ManagedProduct, ImportValidationResult } from '../../types';
import { validateCatalogImport, importAcceptedRows } from '../../services/productService';
import existingCatalogRaw from '../../data/productos.json';
import depuradoCatalogRaw from '../../data/catalogo-depurado.json';

interface CatalogImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingProducts: ManagedProduct[];
  onImportCompleted: () => void;
}

export const CatalogImportModal: React.FC<CatalogImportModalProps> = ({
  isOpen,
  onClose,
  existingProducts,
  onImportCompleted,
}) => {
  const [activeTab, setActiveTab] = useState<'rejected' | 'accepted'>('rejected');
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Ejecuta la validación con el JSON existente del repositorio
  const handleValidateExistingJson = () => {
    setImportStatus(null);
    const result = validateCatalogImport(existingCatalogRaw, existingProducts);
    setValidationResult(result);
    setActiveTab(result.rejectedRows.length > 0 ? 'rejected' : 'accepted');
  };

  // Carga y valida la semilla limpia y deduplicada generada en TK11 (KAN-31)
  const handleValidateCleanSeed = () => {
    setImportStatus(null);
    const result = validateCatalogImport(depuradoCatalogRaw as unknown as Record<string, unknown>, existingProducts);
    setValidationResult(result);
    setActiveTab(result.acceptedRows.length > 0 ? 'accepted' : 'rejected');
  };

  // Permite subir un archivo JSON personalizado para prueba de archivos mal formados
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const result = validateCatalogImport(parsed, existingProducts);
        setValidationResult(result);
        setActiveTab(result.rejectedRows.length > 0 ? 'rejected' : 'accepted');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setValidationResult({
          totalRows: 0,
          acceptedRows: [],
          rejectedRows: [
            {
              row: 0,
              item: {},
              errors: [`Error sintáctico JSON: ${msg}. El archivo no es procesable.`],
            },
          ],
        });
        setActiveTab('rejected');
      }
    };
    reader.readAsText(file);
  };

  // Confirmar inserción SOLO de las filas aceptadas (Criterio 4 HU11)
  const handleProcessAcceptedRows = async () => {
    if (!validationResult || validationResult.acceptedRows.length === 0) return;

    setBusy(true);
    try {
      const { successCount } = await importAcceptedRows(
        validationResult.acceptedRows,
        existingProducts
      );
      setImportStatus(
        `✓ Se importaron con éxito ${successCount} productos verificados a la base productiva. Las filas rechazadas fueron descartadas con seguridad.`
      );
      onImportCompleted();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setImportStatus(`Error durante la importación: ${msg}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/65 z-[9999] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-[850px] rounded-3xl p-6 sm:p-9 relative shadow-2xl border-t-[6px] border-[#C32228] my-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-5 bg-transparent border-none text-2xl text-gray-400 hover:text-[#C32228] cursor-pointer p-1 leading-none transition-colors"
          aria-label="Cerrar modal"
        >
          &times;
        </button>

        {/* Header */}
        <div className="mb-6 flex-shrink-0">
          <span className="text-[11px] font-black tracking-widest text-[#C32228] bg-red-50 px-3 py-1 rounded-full uppercase">
            HU11 · Validación de Catálogo Existente
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 m-0 mt-2">
            Importador y Validador de Catálogo JSON
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 m-0 mt-1 leading-relaxed">
            Audita el archivo de catálogo contra las reglas de integridad (código único, nombre, precio &gt; 0, stock).
            <strong> No utiliza archivos mal formados como fuente productiva;</strong> solo incorpora las filas aceptadas.
          </p>
        </div>

        {/* Acciones de carga / validación */}
        <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200 flex-shrink-0 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleValidateCleanSeed}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-xl cursor-pointer border-none shadow-sm hover:shadow transition-all flex items-center gap-1.5"
              title="Cargar catálogo depurado de TK11 con 160 productos limpios y deduplicados"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Semilla Depurada (TK11)</span>
            </button>

            <button
              type="button"
              onClick={handleValidateExistingJson}
              className="px-4 py-2.5 bg-[#C32228] hover:bg-[#a00000] text-white font-extrabold text-xs sm:text-sm rounded-xl cursor-pointer border-none shadow-sm hover:shadow transition-all"
            >
              Auditar Origen Crudo (productos.json)
            </button>

            <label className="px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs sm:text-sm rounded-xl cursor-pointer border border-gray-300 shadow-sm transition-all inline-block">
              Subir JSON Externo
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <span className="text-xs text-gray-500 font-medium">
            Productos existentes en sistema: <strong>{existingProducts.length}</strong>
          </span>
        </div>

        {/* Estado de importación completada */}
        {importStatus && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold flex-shrink-0">
            {importStatus}
          </div>
        )}

        {/* Dashboard de métricas de validación */}
        {validationResult && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 flex-shrink-0">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-xl text-center border border-gray-200">
                <span className="text-xs text-gray-500 font-bold uppercase block">Total Analizados</span>
                <span className="text-xl sm:text-2xl font-black text-gray-900">{validationResult.totalRows}</span>
              </div>
              <div className="bg-emerald-50 p-3 sm:p-4 rounded-xl text-center border border-emerald-200">
                <span className="text-xs text-emerald-700 font-bold uppercase block">Filas Aceptadas</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-700">
                  {validationResult.acceptedRows.length}
                </span>
              </div>
              <div className="bg-red-50 p-3 sm:p-4 rounded-xl text-center border border-red-200">
                <span className="text-xs text-red-700 font-bold uppercase block">Filas Rechazadas</span>
                <span className="text-xl sm:text-2xl font-black text-red-700">
                  {validationResult.rejectedRows.length}
                </span>
              </div>
            </div>

            {/* Pestañas para ver filas rechazadas o aceptadas */}
            <div className="flex border-b border-gray-200 mb-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('rejected')}
                className={`py-2 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer bg-transparent border-t-0 border-l-0 border-r-0 ${
                  activeTab === 'rejected'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Filas Rechazadas ({validationResult.rejectedRows.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('accepted')}
                className={`py-2 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer bg-transparent border-t-0 border-l-0 border-r-0 ${
                  activeTab === 'accepted'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Filas Aceptadas ({validationResult.acceptedRows.length})
              </button>
            </div>

            {/* Lista con scroll de filas */}
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50/50 p-3 text-left">
              {activeTab === 'rejected' ? (
                validationResult.rejectedRows.length === 0 ? (
                  <p className="text-center text-xs text-gray-500 py-6 m-0">
                    ✓ Ninguna fila rechazada. Todas las filas cumplen las restricciones de unicidad y rangos válidos.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {validationResult.rejectedRows.map((rej, i) => (
                      <div
                        key={i}
                        className="bg-white p-3 rounded-lg border border-red-200 shadow-sm flex flex-col gap-1 text-xs"
                      >
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-red-700">Fila #{rej.row}</span>
                          <span className="text-gray-600 font-mono">
                            Código: {rej.item.codigo || '(sin código)'}
                          </span>
                          <span className="text-gray-900 truncate max-w-[200px]">
                            {rej.item.nombre || '(sin nombre)'}
                          </span>
                        </div>
                        <ul className="m-0 pl-4 text-red-600 font-medium">
                          {rej.errors.map((err, errIdx) => (
                            <li key={errIdx}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                validationResult.acceptedRows.length === 0 ? (
                  <p className="text-center text-xs text-gray-500 py-6 m-0">
                    No hay filas aceptadas en este archivo.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {validationResult.acceptedRows.slice(0, 50).map((acc, i) => (
                      <div
                        key={i}
                        className="bg-white p-2.5 rounded-lg border border-gray-200 text-xs flex justify-between items-center"
                      >
                        <div>
                          <span className="font-mono font-bold text-gray-800 mr-2 bg-gray-100 px-1.5 py-0.5 rounded">
                            {acc.codigo}
                          </span>
                          <span className="font-bold text-gray-900 mr-2">{acc.nombre}</span>
                          <span className="text-gray-500">({acc.categoria})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-700 mr-3">S/. {acc.precio.toFixed(2)}</span>
                          <span className="text-gray-500 text-[11px]">Stock: {acc.stock_actual}</span>
                        </div>
                      </div>
                    ))}
                    {validationResult.acceptedRows.length > 50 && (
                      <p className="text-center text-[11px] text-gray-500 py-2 m-0">
                        ... y {validationResult.acceptedRows.length - 50} productos más listos para importar.
                      </p>
                    )}
                  </div>
                )
              )}
            </div>

            {/* Botón de importación segura */}
            <div className="flex justify-between items-center gap-3 pt-4 mt-2 flex-shrink-0 border-t border-gray-100">
              <span className="text-xs text-gray-500 font-medium">
                Regla HU11: Solo se procesan las filas válidas en Supabase / BD.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleProcessAcceptedRows}
                  disabled={busy || validationResult.acceptedRows.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-lg border-none shadow-md hover:shadow transition-all cursor-pointer"
                >
                  {busy
                    ? 'Procesando…'
                    : `Importar ${validationResult.acceptedRows.length} Filas Aceptadas`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
