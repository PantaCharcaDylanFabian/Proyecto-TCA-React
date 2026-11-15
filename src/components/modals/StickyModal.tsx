import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';

export const StickyModal: React.FC = () => {
  const { isStickyModalOpen, closeStickyModal } = useUI();
  const [formData, setFormData] = useState({ nombreRuc: '', email: '', telefono: '' });
  const [submitted, setSubmitted] = useState(false);

  if (!isStickyModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ nombreRuc: '', email: '', telefono: '' });
      closeStickyModal();
    }, 2500);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[9999] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeStickyModal}
    >
      <div
        className="bg-white w-full max-w-[400px] rounded-2xl p-7 sm:p-8 relative shadow-2xl border-t-[6px] border-[#C32228] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeStickyModal}
          className="absolute top-3 right-4 bg-transparent border-none text-2xl text-gray-400 hover:text-[#C32228] cursor-pointer p-1 leading-none transition-colors"
          aria-label="Cerrar"
        >
          &times;
        </button>

        <div className="text-center mb-6">
          <h3 className="text-[#C32228] text-xl sm:text-2xl font-black m-0 mb-1.5">
            ¡Únete a Distribuidora TCA!
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm m-0">
            Rellena tus datos y un asesor se comunicará contigo al instante.
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-center">
            <p className="font-bold text-base m-0 mb-1">✓ ¡Solicitud Recibida!</p>
            <p className="text-xs m-0 text-emerald-700">Un asesor comercial de TCA se comunicará contigo a la brevedad.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                RUC / Tu nombre
              </label>
              <input
                type="text"
                required
                value={formData.nombreRuc}
                onChange={(e) => setFormData({ ...formData, nombreRuc: e.target.value })}
                placeholder="Ej. Bodega Costa / 20601234567"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 outline-none focus:border-[#C32228] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ej. bodega@gmail.com"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 outline-none focus:border-[#C32228] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                Celular / WhatsApp
              </label>
              <input
                type="tel"
                required
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Ej. 999 999 999"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 outline-none focus:border-[#C32228] transition-colors"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full bg-[#fbb03b] hover:bg-[#e59d2e] text-white font-black text-sm sm:text-base py-3.5 rounded-lg border-none shadow-md hover:shadow-lg hover:scale-[1.02] cursor-pointer transition-all tracking-wider"
            >
              SOLICITAR CONTACTO
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
