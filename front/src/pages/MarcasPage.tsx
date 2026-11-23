import React from 'react';
import { useUI } from '../context/UIContext';
import { getImageUrl, handleImageError } from '../utils/image';

interface LineBanner {
  title: string;
  image: string;
  href: string;
}

const LINE_BANNERS: LineBanner[] = [
  { title: 'Línea de Alimentos', image: 'imagenes/ALIMENTOSBANNER.png', href: 'subcategoria-aceitesclasicos.html' },
  { title: 'Línea de Bebidas', image: 'imagenes/bebidasbanner.png', href: 'categoria-bebidas.html' },
  { title: 'Línea de Limpieza', image: 'imagenes/limpiezadelhogarbanner.png', href: 'categoria-limpieza.html' },
  { title: 'Línea de Papelería', image: 'imagenes/papeleriabanner.png', href: 'categoria-papeleria.html' },
  { title: 'Línea de Cuidado Personal', image: 'imagenes/cuidadopersonal2.png', href: 'categoria-cuidado-personal.html' },
  { title: 'Línea de Hogar y Utilidades', image: 'imagenes/hogaryutbanner.png', href: 'categoria-hogar.html' },
];

interface PartnerBrand {
  name: string;
  logo: string;
}

const PARTNER_BRANDS: PartnerBrand[] = [
  { name: 'Colgate', logo: 'imagenes/colagatelogo.svg' },
  { name: 'Protex', logo: 'imagenes/protex-logo.png' },
  { name: 'Durex', logo: 'imagenes/Durex-Logo.png' },
  { name: 'Rendipel', logo: 'imagenes/rendipellogo.png' },
  { name: 'Paracas', logo: 'imagenes/paracas logo.png' },
  { name: 'Sapolio', logo: 'imagenes/Sapolio_logo.webp' },
  { name: 'Bolívar', logo: 'imagenes/bolivar logo.png' },
  { name: 'Suavitel', logo: 'imagenes/suavitel_logo.png' },
  { name: 'Ron Cartavio', logo: 'imagenes/roncartavio logo.png' },
  { name: 'Duff Beer', logo: 'imagenes/duff-beer-logo.png' },
  { name: 'Cielo', logo: 'imagenes/cielo logo.png' },
  { name: 'Florida', logo: 'imagenes/floridalogo1.jpg' },
  { name: 'Molitalia', logo: 'imagenes/molitalialogo.png' },
  { name: 'Quaker', logo: 'imagenes/quaker-logo.png' },
  { name: 'Ajinomen', logo: 'imagenes/ajinomenlogo.png' },
];

export const MarcasPage: React.FC = () => {
  const { navigate } = useUI();

  return (
    <div className="w-full">
      {/* Sección Líneas de Productos */}
      <section className="py-12 px-5 bg-white">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 uppercase m-0">
              Nuestra línea de <span className="text-[#C32228]">productos</span>
            </h2>
            <div className="w-16 h-1 bg-[#C32228] mx-auto mt-3.5 rounded"></div>
          </div>

          <div className="flex flex-col gap-7">
            {LINE_BANNERS.map((banner, index) => (
              <div
                key={index}
                onClick={() => navigate(banner.href)}
                className="group relative w-full rounded-2xl overflow-hidden shadow-md border-[3px] border-gray-100 hover:border-[#C32228] hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <img
                  src={getImageUrl(banner.image)}
                  alt={banner.title}
                  className="w-full h-auto block scale-[1.02] group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => handleImageError(e, banner.title)}
                />
                <div className="absolute bottom-5 right-7 bg-[#C32228] text-white py-2.5 px-5 rounded-full font-bold text-sm opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-md">
                  Ver Categoría
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección Marcas (Unificada) */}
      <section className="py-20 px-5 bg-[#f9f9fb]">
        <div className="max-w-[1100px] mx-auto">
          <div className="bg-white border border-gray-200 border-t-4 border-t-[#C32228] rounded-2xl p-8 sm:p-14 shadow-lg">
            {/* Header */}
            <div className="text-center mb-12 flex flex-col items-center">
              <span className="bg-red-50 text-[#C32228] py-1 px-4 rounded-full text-xs font-black tracking-widest uppercase mb-4">
                SOCIOS ESTRATÉGICOS
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-3 tracking-tight">
                NUESTRAS <span className="text-[#C32228]">MARCAS</span>
              </h2>
              <div className="w-12 h-1 bg-[#C32228] rounded mb-5"></div>
              <p className="text-gray-600 text-sm sm:text-base max-w-[620px] leading-relaxed m-0">
                Trabajamos de la mano con las empresas líderes del mercado para ofrecerte siempre el mejor portafolio de productos y la máxima rentabilidad.
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 sm:gap-10 items-center justify-items-center">
              {PARTNER_BRANDS.map((marca, i) => (
                <div
                  key={i}
                  className="w-full h-[85px] sm:h-[95px] flex justify-center items-center p-3 bg-gray-50/50 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 hover:shadow-md transition-all duration-300 group cursor-pointer"
                  title={marca.name}
                >
                  <img
                    src={getImageUrl(marca.logo)}
                    alt={marca.name}
                    className="max-w-full max-h-full object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                    onError={(e) => handleImageError(e, marca.name)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
