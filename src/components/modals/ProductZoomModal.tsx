import React from 'react';
import { useUI } from '../../context/UIContext';
import { handleImageError } from '../../utils/image';

export const ProductZoomModal: React.FC = () => {
  const { zoomedProduct, closeProductZoom, openStickyModal } = useUI();

  if (!zoomedProduct) return null;

  const handleCotizar = () => {
    closeProductZoom();
    openStickyModal();
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 z-[9999] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeProductZoom}
    >
      <div
        className="bg-white rounded-3xl p-6 sm:p-8 text-center relative max-w-[380px] w-full shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeProductZoom}
          className="absolute -top-3.5 -right-3.5 bg-gray-900 hover:bg-[#C32228] text-white rounded-full w-9 h-9 flex items-center justify-center text-xl font-bold cursor-pointer border-none shadow-md hover:scale-110 transition-all"
          aria-label="Cerrar modal"
        >
          &times;
        </button>

        <div className="h-[200px] sm:h-[220px] flex justify-center items-center mb-5 bg-[#fcfcfc] rounded-2xl p-3 border border-gray-100">
          <img
            src={zoomedProduct.image}
            alt={zoomedProduct.title}
            className="max-h-full max-w-full object-contain mix-blend-multiply"
            onError={(e) => handleImageError(e, zoomedProduct.title)}
          />
        </div>

        <h3 className="text-gray-900 text-lg sm:text-xl font-black m-0 mb-1.5 leading-snug">
          {zoomedProduct.title}
        </h3>

        <p className="text-[#C32228] text-xs sm:text-sm font-bold mb-6">
          {zoomedProduct.detail}
        </p>

        <button
          type="button"
          onClick={handleCotizar}
          className="w-full bg-[#fbb03b] hover:bg-[#e5a720] text-[#c8232c] font-black py-3.5 px-5 rounded-xl cursor-pointer text-sm sm:text-base shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all border-none tracking-wider uppercase"
        >
          COTIZA CON NOSOTROS
        </button>
      </div>
    </div>
  );
};
