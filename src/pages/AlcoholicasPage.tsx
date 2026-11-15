import React from 'react';
import { useUI } from '../context/UIContext';
import { getImageUrl, handleImageError } from '../utils/image';

interface SubcatCard {
  title: string;
  desc: string;
  image: string;
  href: string;
}

const SUBCATS: SubcatCard[] = [
  {
    title: 'Cervezas',
    desc: 'Dorada, Lager, Negra, Pilsener, Trigo',
    image: 'imagenes/banner-cervezas.jpg',
    href: 'subcategoria-cervezas.html',
  },
  {
    title: 'Licores',
    desc: 'Espumante, Pisco, Ron, Vino, Vodka, Whisky',
    image: 'imagenes/banner-licores.jpg',
    href: 'subcategoria-cervezas.html',
  },
  {
    title: 'RTD (Ready to Drink)',
    desc: 'Sabores frutales, Ice, Guaraná, Cócteles listos',
    image: 'imagenes/banner-rtd.jpg',
    href: 'subcategoria-cervezas.html',
  },
];

export const AlcoholicasPage: React.FC = () => {
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
        &gt;{' '}
        <a
          href="categoria-bebidas.html"
          onClick={(e) => {
            e.preventDefault();
            navigate('categoria-bebidas.html');
          }}
          className="text-[#C32228] font-bold no-underline hover:underline"
        >
          Bebidas
        </a>{' '}
        &gt; <strong className="text-gray-800">Alcohólicas</strong>
      </div>

      <section className="py-12 px-5 bg-[#f9f9fb]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-2">
              BEBIDAS <span className="text-[#C32228]">ALCOHÓLICAS</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 m-0">
              Selecciona una línea para ver nuestros productos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {SUBCATS.map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate(item.href)}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-[#C32228] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="w-full h-48 overflow-hidden bg-gray-100">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => handleImageError(e, item.title)}
                  />
                </div>
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2 group-hover:text-[#C32228] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                      {item.desc}
                    </p>
                  </div>
                  <span className="text-[#C32228] font-bold text-sm tracking-wide group-hover:translate-x-1 inline-block transition-transform">
                    Ver productos &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
