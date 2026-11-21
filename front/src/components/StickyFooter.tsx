import React from 'react';
import { useUI } from '../context/UIContext';

export const StickyFooter: React.FC = () => {
  const { openStickyModal } = useUI();

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#C32228] py-3.5 px-4 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.25)] border-t border-red-700">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-7 max-w-[1200px] mx-auto text-center sm:text-left">
        <div className="flex flex-col items-center sm:items-start text-white">
          <h2 className="text-white text-xs sm:text-base lg:text-[19px] font-light tracking-wide uppercase leading-tight m-0">
            ¡Únete a nuestra comunidad para recibir
          </h2>
          <h2 className="text-white text-sm sm:text-lg lg:text-[22px] font-normal m-0 leading-tight">
            <span className="font-black text-amber-300 tracking-tight text-base sm:text-xl lg:text-[25px]">
              OFERTAS Y DESCUENTOS ÚNICOS
            </span>
          </h2>
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onClick={openStickyModal}
            className="bg-gradient-to-r from-[#ffd13b] to-[#ff9800] hover:from-[#ffe066] hover:to-[#ffa726] text-white font-extrabold text-xs sm:text-sm lg:text-[15px] py-2.5 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border-none cursor-pointer tracking-wider"
          >
            INGRESA AQUÍ
          </button>
        </div>
      </div>
    </div>
  );
};
