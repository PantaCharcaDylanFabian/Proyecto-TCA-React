import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';

export const CatalogSecretModal: React.FC = () => {
  const { isCatalogModalOpen, closeCatalogModal } = useUI();
  const [code, setCode] = useState('');
  const [hasError, setHasError] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isCatalogModalOpen) return null;

  const validCodes = ['VIP-2026', 'TCA-GERENTE'];

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (validCodes.includes(clean)) {
      setHasError(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCode('');
        closeCatalogModal();
        alert('¡Código validado! Iniciando descarga del Catálogo Corporativo TCA...');
      }, 1500);
    } else {
      setHasError(true);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[9999] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeCatalogModal}
    >
      <div
        className="bg-white rounded-2xl p-7 sm:p-9 text-center relative max-w-[400px] w-full shadow-2xl border-t-[5px] border-[#C32228] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeCatalogModal}
          className="absolute top-3 right-4 bg-transparent border-none text-2xl text-gray-400 hover:text-[#C32228] cursor-pointer p-1 leading-none transition-colors"
          aria-label="Cerrar modal"
        >
          &times;
        </button>

        <h3 className="text-[#C32228] text-xl sm:text-2xl font-black m-0 mb-2">
          Acceso a Catálogo
        </h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-6">
          Ingresa tu código de cliente corporativo para habilitar la descarga exclusiva.
        </p>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl text-center">
            <p className="font-bold text-base m-0">✓ ¡Código VIP Verificado!</p>
            <p className="text-xs m-0 text-emerald-600 mt-1">Generando enlace de descarga seguro...</p>
          </div>
        ) : (
          <form onSubmit={handleValidate} className="flex flex-col gap-3">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setHasError(false);
                }}
                placeholder="Ej: VIP-2026 / TCA-GERENTE"
                autoComplete="off"
                className={`w-full px-4 py-3 rounded-lg text-center uppercase tracking-widest text-base sm:text-lg font-bold border-2 outline-none transition-colors ${
                  hasError ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#C32228]'
                }`}
              />
              {hasError && (
                <p className="text-red-600 text-xs font-semibold mt-1.5 mb-0">
                  Código inválido. Prueba con <span className="font-mono bg-red-100 px-1 py-0.5 rounded">VIP-2026</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="mt-2 w-full bg-[#fbb03b] hover:bg-[#e5a720] text-[#8c0c12] font-black text-sm sm:text-base py-3.5 rounded-lg border-none cursor-pointer shadow-md hover:shadow-lg transition-all tracking-wider uppercase"
            >
              Validar Código
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
