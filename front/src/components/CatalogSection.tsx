import React from 'react';
import { useUI } from '../context/UIContext';
import { getImageUrl, handleImageError } from '../utils/image';

const BENEFITS = [
  'Precios de distribuidor.',
  'Marcas líderes.',
  'Catálogo actualizado.',
  'Paquetes exclusivos.',
];

export const CatalogSection: React.FC = () => {
  const { openCatalogModal } = useUI();

  return (
    <section className="py-14 px-5 flex justify-center">
      <div className="bg-gradient-to-br from-white to-gray-100 border-[3px] border-[#ffb300] rounded-[35px] flex items-center justify-between max-w-[1100px] w-full p-8 sm:p-12 lg:p-14 gap-8 shadow-md flex-wrap lg:flex-nowrap overflow-hidden">
        {/* Left Column Content */}
        <div className="flex-[1.5] text-center min-w-[280px] flex flex-col items-center gap-5">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] text-gray-900 m-0 font-black whitespace-normal sm:whitespace-nowrap leading-tight">
            ¡NO TE LO PIERDAS!
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 m-0 -mt-2">
            Haz clic y obtén nuestro catálogo <strong className="font-bold text-gray-900">exclusivo</strong> en segundos
          </p>

          <button
            type="button"
            onClick={openCatalogModal}
            className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-black text-lg sm:text-xl py-4 sm:py-5 px-10 sm:px-12 rounded-full cursor-pointer shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 border-none my-2"
          >
            DESCARGAR AQUÍ
          </button>

          <ul className="list-none p-0 text-left grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-6 max-w-[500px] mx-auto mt-3">
            {BENEFITS.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm sm:text-base text-gray-800 font-medium">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="#28a745"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column Image */}
        <div className="flex-1 flex justify-center items-center min-w-[240px]">
          <img
            src={getImageUrl('imagenes/CATAL.png')}
            alt="Catálogo en celular TCA"
            className="w-[220px] sm:w-[250px] h-[360px] sm:h-[400px] object-contain rounded-2xl shadow-xl transition-transform duration-300 hover:scale-105"
            onError={(e) => handleImageError(e, 'CATALOGO TCA')}
          />
        </div>
      </div>
    </section>
  );
};
