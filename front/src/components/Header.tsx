import { useState } from 'react';
import { useUI } from '../context/UIContext';
import { useCommerce } from '../context/CommerceContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/image';

export function Header({ path }: { path: string }) {
  const { toggleSidebar, isSidebarOpen, navigate } = useUI();
  const { cart } = useCommerce();
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const quantity = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <header className="tca-header no-print">
      <div className="store-container store-header-main">
        <a href="/" aria-label="TCA Inicio"><img className="store-logo" src={getImageUrl('TCALOGOINICIO.png')} alt="Distribuidora TCA" /></a>
        <form className="store-search" role="search" onSubmit={event => {
          event.preventDefault();
          const term = query.trim();
          navigate(term ? `/catalogo?q=${encodeURIComponent(term)}` : '/catalogo');
        }}>
          <input type="search" aria-label="Buscar productos" placeholder="Nombre o código" value={query} onChange={event => setQuery(event.target.value)} />
          <button type="submit">Buscar</button>
        </form>
        <a className="store-cart" href="/carrito" aria-current={path === 'carrito' ? 'page' : undefined}>
          <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h3l2.5 12h11L21 7H6"/><circle cx="9" cy="20" r="1.2"/><circle cx="18" cy="20" r="1.2"/>
          </svg>
          Carrito <span>{quantity}</span>
        </a>
        <a className="store-account" href={profile ? '/panel' : '/login'}>{profile ? 'Panel interno' : 'Acceso interno'}</a>
      </div>
      <div className="store-nav-band">
        <nav className="store-container store-nav" aria-label="Sitio">
          <button type="button" onClick={toggleSidebar} aria-label="Abrir menú de categorías" aria-haspopup="dialog" aria-expanded={isSidebarOpen}>
            <span className="store-menu-icon" aria-hidden="true">☰</span> Categorías
          </button>
          <a href="/catalogo" aria-current={path === 'catalogo' ? 'page' : undefined}>Catálogo</a>
          <a href="/marcas" aria-current={path === 'marcas' ? 'page' : undefined}>Marcas</a>
          <a href="/nosotros" aria-current={path === 'nosotros' ? 'page' : undefined}>Nosotros</a>
        </nav>
      </div>
    </header>
  );
}
