import React from 'react';
import { getImageUrl, handleImageError } from '../utils/image';

export const NosotrosPage: React.FC = () => {
  return (
    <div className="w-full">
      <section className="py-14 sm:py-20 px-5 bg-[#fcfcfc]">
        <div className="max-w-[1100px] mx-auto">
          {/* Header */}
          <div className="text-center mb-14 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-2">
              CONOCE <span className="text-[#C32228]">TCA</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 m-0">
              Tu socio estratégico en la distribución de productos de calidad.
            </p>
          </div>

          {/* Fila 1: ¿Quiénes Somos? */}
          <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-14 mb-16">
            <div className="flex-1 text-left">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#C32228] mb-4">
                ¿Quiénes Somos?
              </h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed text-justify m-0">
                Somos una empresa distribuidora líder, dedicada a abastecer a negocios y comercios con un portafolio de marcas reconocidas. Trabajamos día a día para garantizar que nuestros clientes tengan los productos que necesitan, en el momento exacto y al mejor precio del mercado.
              </p>
            </div>
            <div className="flex-1 w-full max-w-[500px]">
              <img
                src={getImageUrl('imagenes/equipo.avif')}
                alt="Equipo de Distribuidora TCA"
                className="w-full h-auto rounded-2xl shadow-xl object-cover hover:scale-[1.02] transition-transform duration-300"
                onError={(e) => handleImageError(e, 'Equipo TCA')}
              />
            </div>
          </div>

          {/* Fila 2: Nuestra Misión (Inversa) */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-10 lg:gap-14 mb-16">
            <div className="flex-1 text-left">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#C32228] mb-4">
                Nuestra Misión
              </h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed text-justify m-0">
                Brindar un servicio de distribución ágil, eficiente y seguro, superando las expectativas de nuestros clientes. Nos enfocamos en construir relaciones de valor a largo plazo, respaldadas por un equipo humano comprometido y soluciones logísticas de primer nivel.
              </p>
            </div>
            <div className="flex-1 w-full max-w-[500px]">
              <img
                src={getImageUrl('imagenes/mision.jpg')}
                alt="Misión logística y distribución TCA"
                className="w-full h-auto rounded-2xl shadow-xl object-cover hover:scale-[1.02] transition-transform duration-300"
                onError={(e) => handleImageError(e, 'Misión TCA')}
              />
            </div>
          </div>

          {/* Fila 3: Nuestra Visión */}
          <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-14">
            <div className="flex-1 text-left">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#C32228] mb-4">
                Nuestra Visión
              </h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed text-justify m-0">
                Posicionarnos como la distribuidora referente a nivel nacional, reconocida por la excelencia operativa, la innovación tecnológica en nuestros procesos y el impulso constante al crecimiento de los negocios de todos nuestros aliados estratégicos.
              </p>
            </div>
            <div className="flex-1 w-full max-w-[500px]">
              <img
                src={getImageUrl('imagenes/vision.avif')}
                alt="Visión de futuro TCA"
                className="w-full h-auto rounded-2xl shadow-xl object-cover hover:scale-[1.02] transition-transform duration-300"
                onError={(e) => handleImageError(e, 'Visión TCA')}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
