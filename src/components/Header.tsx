import React, { useState } from 'react';
import { useUI } from '../context/UIContext';
import { getImageUrl, handleImageError } from '../utils/image';
import { searchAllProducts } from '../data/catalog';

export const Header: React.FC = () => {
  const { toggleSidebar, navigate, currentPath, openProductZoom } = useUI();
  const [searchInput, setSearchInput] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchResults = searchInput.trim().length >= 2 ? searchAllProducts(searchInput).slice(0, 8) : [];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigate(path);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      const first = searchResults[0];
      navigate(`/productos-visor.html?subcat=${first.subcatKey}`);
      setIsSearchFocused(false);
    }
  };

  const isCurrent = (path: string) => {
    const cur = currentPath.toLowerCase();
    const target = path.toLowerCase();
    if (target === '/' && (cur === '/' || cur === '/index.html' || cur === '')) return true;
    return cur.includes(target.replace(/^\//, '').replace(/\.html$/, ''));
  };

  return (
    <header className="bg-[#C32228] w-full sticky top-0 z-40 shadow-md">
      <div className="flex items-center justify-between md:justify-center gap-4 md:gap-[100px] lg:gap-[120px] w-full max-w-[1200px] mx-auto px-4 py-3 md:py-[15px]">
        {/* Logo */}
        <div className="flex-shrink-0">
          <a
            href="index.html"
            onClick={(e) => handleNavClick(e, 'index.html')}
            className="flex items-center text-decoration-none"
            title="Distribuidora TCA - Inicio"
          >
            <img
              src={getImageUrl('imagenes/TCALOGOINICIO.png')}
              alt="Logo TCA"
              className="h-[50px] md:h-[60px] w-auto block object-contain"
              onError={(e) => handleImageError(e, 'TCA LOGO')}
            />
          </a>
        </div>

        {/* Nav & Burger Wrapper */}
        <div className="flex items-center gap-6 md:gap-[40px]">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Abrir menú de categorías"
            className="text-white hover:scale-110 transition-transform cursor-pointer p-1.5 focus:outline-none"
          >
            <svg viewBox="0 0 100 80" width="24" height="24" fill="currentColor">
              <rect width="100" height="15" rx="8"></rect>
              <rect y="30" width="100" height="15" rx="8"></rect>
              <rect y="60" width="100" height="15" rx="8"></rect>
            </svg>
          </button>

          <nav className="hidden md:block">
            <ul className="flex list-none gap-[40px] lg:gap-[50px] m-0 p-0">
              <li>
                <a
                  href="index.html"
                  onClick={(e) => handleNavClick(e, 'index.html')}
                  className={`text-white font-bold text-sm tracking-wide hover:text-amber-200 transition-colors uppercase py-1 ${
                    isCurrent('/') ? 'border-b-2 border-white' : ''
                  }`}
                >
                  INICIO
                </a>
              </li>
              <li>
                <a
                  href="marcas.html"
                  onClick={(e) => handleNavClick(e, 'marcas.html')}
                  className={`text-white font-bold text-sm tracking-wide hover:text-amber-200 transition-colors uppercase py-1 ${
                    isCurrent('marcas') ? 'border-b-2 border-white' : ''
                  }`}
                >
                  MARCAS
                </a>
              </li>
              <li>
                <a
                  href="nosotros.html"
                  onClick={(e) => handleNavClick(e, 'nosotros.html')}
                  className={`text-white font-bold text-sm tracking-wide hover:text-amber-200 transition-colors uppercase py-1 ${
                    isCurrent('nosotros') ? 'border-b-2 border-white' : ''
                  }`}
                >
                  NOSOTROS
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Search Container */}
        <div className="relative">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-white rounded px-2 py-1 w-[180px] sm:w-[220px] md:w-[250px] shadow-sm"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Buscar productos..."
              className="w-full border-none outline-none text-xs sm:text-sm text-gray-800 bg-transparent pr-1"
            />
            <button
              type="submit"
              className="bg-transparent border-none p-1 cursor-pointer text-gray-600 hover:text-[#C32228] transition-colors"
              aria-label="Buscar"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
            </button>
          </form>

          {/* Quick Search Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full right-0 mt-2 w-[280px] sm:w-[320px] bg-white rounded-lg shadow-2xl border border-gray-100 max-h-[360px] overflow-y-auto z-50 p-2">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">
                Resultados encontrados ({searchResults.length})
              </div>
              {searchResults.map(({ product, subcatKey, subcatName }) => (
                <div
                  key={`${product.id}-${product.nombre}`}
                  onMouseDown={() => {
                    navigate(`/productos-visor.html?subcat=${subcatKey}`);
                    openProductZoom(getImageUrl(product.imagen), product.nombre, `${product.marca} · ${subcatName}`);
                    setIsSearchFocused(false);
                  }}
                  className="flex items-center gap-3 p-2 hover:bg-red-50 rounded-md cursor-pointer transition-colors"
                >
                  <img
                    src={getImageUrl(product.imagen)}
                    alt={product.nombre}
                    className="w-9 h-9 object-contain flex-shrink-0"
                    onError={(e) => handleImageError(e, product.nombre)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate m-0">{product.nombre}</p>
                    <p className="text-[11px] text-[#C32228] font-semibold truncate m-0">{product.marca}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
