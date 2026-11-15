import React from 'react';
import { useUI } from '../context/UIContext';

export const BebidasPage: React.FC = () => {
  const { navigate } = useUI();

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="max-w-[1000px] mx-auto mt-6 px-5 text-sm text-gray-500">
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
        &gt; <strong className="text-gray-800">Bebidas</strong>
      </div>

      <section className="py-12 px-5">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-2">
              LÍNEA DE <span className="text-[#C32228]">BEBIDAS</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 m-0">
              Selecciona el tipo de bebida para ver nuestras categorías y productos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* Card 1: Sin Alcohol */}
            <div
              onClick={() => navigate('subcategoria-cervezas.html')}
              className="group bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-gray-200 hover:border-[#C32228] hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="mb-6">
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 group-hover:text-[#C32228] transition-colors">
                  Sin Alcohol
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed m-0">
                  Gaseosas, Aguas, Jugos, Rehidratantes y Energizantes
                </p>
              </div>
              <div>
                <span className="inline-block bg-[#C32228] group-hover:bg-[#a00000] text-white py-3 px-8 rounded-full font-bold text-sm tracking-wider uppercase transition-colors shadow-md">
                  Ver productos &rarr;
                </span>
              </div>
            </div>

            {/* Card 2: Alcohólicas */}
            <div
              onClick={() => navigate('categoria-alcoholicas.html')}
              className="group bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-gray-200 hover:border-[#C32228] hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="mb-6">
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 group-hover:text-[#C32228] transition-colors">
                  Alcohólicas
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed m-0">
                  Cervezas, Vinos, Piscos, Rones y Licores Premium
                </p>
              </div>
              <div>
                <span className="inline-block bg-[#C32228] group-hover:bg-[#a00000] text-white py-3 px-8 rounded-full font-bold text-sm tracking-wider uppercase transition-colors shadow-md">
                  Ver productos &rarr;
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
