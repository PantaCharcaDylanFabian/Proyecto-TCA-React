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
              <li>
                <a
                  href="gestion-productos.html"
                  onClick={(e) => handleNavClick(e, 'gestion-productos.html')}
                  className={`text-white font-bold text-sm tracking-wide hover:text-amber-200 transition-colors uppercase py-1 flex items-center gap-1.5 ${
                    isCurrent('gestion') ? 'border-b-2 border-white text-amber-200' : ''
                  }`}
                  title="Gestión de Catálogo y Productos (HU11)"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  GESTIÓN
                </a>
              </li>
              <li>
                <a
                  href="pedidos.html"
                  onClick={(e) => handleNavClick(e, 'pedidos.html')}
                  className={`text-white font-bold text-sm tracking-wide hover:text-amber-200 transition-colors uppercase py-1 flex items-center gap-1.5 ${
                    isCurrent('pedido') ? 'border-b-2 border-white text-amber-200' : ''
                  }`}
                  title="Pedidos en Borrador (HU12 · Ventas)"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  PEDIDOS
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
