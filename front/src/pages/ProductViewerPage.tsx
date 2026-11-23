import React, { useRef, useState, useEffect } from 'react';
import { useUI } from '../context/UIContext';
import { getSubcategoryData } from '../data/catalog';
import { getImageUrl, handleImageError } from '../utils/image';
import type { SubcategoryData } from '../types';

interface ProductViewerPageProps {
  subcatKeyOrPath?: string;
}

export const ProductViewerPage: React.FC<ProductViewerPageProps> = ({ subcatKeyOrPath }) => {
  const { navigate, openProductZoom, openStickyModal, openCatalogModal } = useUI();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Extract subcat key from props, or query params, or URL path
  let targetSlug = subcatKeyOrPath || '';
  if (!targetSlug) {
    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get('subcat');
    if (fromParam) {
      targetSlug = fromParam;
    } else {
      const pathname = window.location.pathname.replace(/^\//, '');
      targetSlug = pathname || 'aceites-clasicos';
    }
  }

  const resolved = getSubcategoryData(targetSlug) || getSubcategoryData('aceites-clasicos');
  const subcat: SubcategoryData = resolved ? resolved.data : {
    nombre: targetSlug.replace(/-/g, ' ').toUpperCase(),
    ruta: 'Alimentos > Productos',
    marcas: [],
    productos: [],
  };

  const title = subcat.nombre || (resolved?.key || targetSlug).replace(/-/g, ' ').toUpperCase();
  const rutaParts = (subcat.ruta || 'Productos').split('>').map((p) => p.trim());
  const productCount = subcat.productos.length;

  // Auto-scroll logic matching original scripts.js (every 2.5s if not hovered and > 4 products)
  useEffect(() => {
    if (isHovered || productCount <= 4) return;
    const interval = setInterval(() => {
      const el = sliderRef.current;
      if (!el) return;
      const cardWidth = 200;
      if (Math.ceil(el.scrollLeft) >= el.scrollWidth - el.clientWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isHovered, productCount]);

  const handleScroll = (direction: number) => {
    const el = sliderRef.current;
    if (!el) return;
    const cardWidth = 220;
    el.scrollBy({ left: cardWidth * direction, behavior: 'smooth' });
  };

  // Determine container styling for centering products
  let containerAlignment = 'justify-start';
  if (productCount === 1) containerAlignment = 'justify-center';
  else if (productCount === 2) containerAlignment = 'justify-center gap-12 sm:gap-20';
  else if (productCount === 3) containerAlignment = 'justify-center gap-6 sm:gap-10';
  else if (productCount === 4) containerAlignment = 'justify-center gap-4 sm:gap-6';

  return (
    <div className="w-full">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Migas de pan" className="max-w-[1000px] mx-auto mt-6 px-5 text-xs sm:text-sm text-gray-500">
        <a
          href="index.html"
          onClick={(e) => {
            e.preventDefault();
            navigate('index.html');
          }}
          className="text-[#C32228] font-bold no-underline hover:underline"
        >
          Inicio
        </a>
        {rutaParts.map((part, index) => (
          <span key={index}>
            {' '}&gt; <span className="text-gray-600">{part}</span>
          </span>
        ))}
        {' '}&gt; <strong className="text-gray-900 font-bold">{title}</strong>
      </nav>

      {/* 2. Titles */}
      <div className="max-w-[900px] mx-auto mt-6 mb-8 px-5 text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-[38px] font-black text-gray-950 m-0 mb-1.5 leading-tight tracking-tight uppercase">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 m-0">
          Conoce las marcas de excelente calidad con las que trabajamos.
        </p>
      </div>

      {/* 3. Section Marcas Destacadas */}
      {subcat.marcas && subcat.marcas.length > 0 && (
        <section className="flex justify-center mb-12 sm:mb-16 px-5">
          <div className="bg-gradient-to-br from-[#fdfdfd] to-[#f2f2f2] border border-gray-200 border-t-[5px] border-t-[#C32228] rounded-[25px] p-8 sm:p-12 w-full max-w-[900px] text-center shadow-sm">
            <h2 className="text-2xl sm:text-[26px] font-black text-gray-900 tracking-wider mb-10 sm:mb-12 relative inline-block m-0">
              NUESTRAS MARCAS
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#fbb03b] rounded"></span>
            </h2>

            <div className="flex justify-center items-center gap-6 sm:gap-10 flex-wrap">
              {subcat.marcas.map((marca, i) => (
                <div
                  key={`${marca.nombre}-${i}`}
                  className="w-[180px] sm:w-[220px] h-[100px] sm:h-[120px] flex justify-center items-center bg-white rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 group"
                  title={marca.nombre}
                >
                  <img
                    src={getImageUrl(marca.logo)}
                    alt={`Marca ${marca.nombre}`}
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => handleImageError(e, marca.nombre)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Section Carrusel Productos */}
      <section className="w-full mb-14 px-5 flex justify-center">
        <div
          className="relative bg-gradient-to-b from-white to-[#f2f2f2] border-t-4 border-t-[#fdbf38] rounded-3xl p-8 sm:p-10 w-full max-w-[900px] shadow-sm"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Arrow Buttons (Shown only when > 4 items) */}
          {productCount > 4 && (
            <>
              <button
                type="button"
                onClick={() => handleScroll(-1)}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-white hover:bg-[#C32228] text-[#C32228] hover:text-white border-2 border-[#C32228] rounded-full w-11 h-11 text-lg font-bold flex justify-center items-center shadow-md hover:scale-110 transition-all z-20 cursor-pointer"
                aria-label="Desplazar a la izquierda"
              >
                &#10094;
              </button>
              <button
                type="button"
                onClick={() => handleScroll(1)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white hover:bg-[#C32228] text-[#C32228] hover:text-white border-2 border-[#C32228] rounded-full w-11 h-11 text-lg font-bold flex justify-center items-center shadow-md hover:scale-110 transition-all z-20 cursor-pointer"
                aria-label="Desplazar a la derecha"
              >
                &#10095;
              </button>
            </>
          )}

          {/* Product Items Slider */}
          <div
            ref={sliderRef}
            className={`flex items-center gap-6 overflow-x-auto scroll-smooth py-3 px-2 no-scrollbar ${containerAlignment}`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {subcat.productos.map((prod) => (
              <div
                key={prod.id}
                onClick={() =>
                  openProductZoom(getImageUrl(prod.imagen), prod.nombre, `${prod.marca} · Descubre todas nuestras presentaciones`)
                }
                className="group flex-shrink-0 w-[150px] sm:w-[170px] flex flex-col items-center text-center cursor-pointer p-2 rounded-xl transition-all duration-200 hover:-translate-y-1.5"
              >
                <div className="w-[120px] sm:w-[130px] h-[120px] sm:h-[130px] flex justify-center items-center mb-3">
                  <img
                    src={getImageUrl(prod.imagen)}
                    alt={prod.nombre}
                    className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => handleImageError(e, prod.nombre)}
                  />
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-800 leading-tight block">
                  {prod.nombre}
                  <span className="block text-[#C32228] font-bold mt-1 text-[11px] sm:text-xs">
                    {prod.marca}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Section CTA Final */}
      <section className="w-full flex justify-center mb-16 px-5">
        <div className="bg-[#8c0c12] rounded-2xl p-8 sm:p-10 w-full max-w-[900px] flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
          <div className="flex flex-col gap-4 text-center md:text-left">
            <p className="text-base sm:text-lg lg:text-[19px] text-white m-0 tracking-wide">
              Descubre todas las <strong className="text-[#fbb03b] font-black text-lg sm:text-xl">novedades</strong> para ti y tu negocio
            </p>
            <p className="text-base sm:text-lg lg:text-[19px] text-white m-0 tracking-wide">
              Conoce todas nuestras <strong className="text-[#fbb03b] font-black text-lg sm:text-xl">líneas de producto</strong>
            </p>
          </div>

          <div className="flex flex-col gap-3.5 w-full max-w-[280px]">
            <button
              type="button"
              onClick={openStickyModal}
              className="bg-[#fbb03b] hover:bg-[#ffe070] text-[#8c0c12] font-black text-base sm:text-lg py-3.5 px-6 rounded-lg border-none shadow-md hover:-translate-y-0.5 transition-all cursor-pointer tracking-wider uppercase text-center"
            >
              COTIZAR
            </button>

            <button
              type="button"
              onClick={openCatalogModal}
              className="bg-[#fbb03b] hover:bg-[#ffe070] text-[#8c0c12] rounded-lg p-2.5 px-4 flex items-center justify-between shadow-md hover:-translate-y-0.5 transition-all cursor-pointer border-none"
            >
              <div className="flex flex-col text-center flex-grow">
                <span className="text-[11px] font-semibold text-[#8c0c12] uppercase leading-tight">
                  CONOCE NUESTRO
                </span>
                <strong className="text-base font-black text-[#8c0c12] uppercase leading-tight">
                  CATÁLOGO
                </strong>
              </div>
              <svg
                viewBox="0 0 24 24"
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#8c0c12] flex-shrink-0"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="8 12 12 16 16 12"></polyline>
                <line x1="12" y1="8" x2="12" y2="16"></line>
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
