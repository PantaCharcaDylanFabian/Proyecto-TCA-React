import { useState } from 'react';
import { useUI } from '../context/UIContext';
import { useCommerce } from '../context/CommerceContext';
import { getImageUrl } from '../utils/image';
export function Header(){
  const {toggleSidebar,navigate}=useUI();const commerce=useCommerce();const [query,setQuery]=useState('');
  return <header className="tca-header no-print"><a href="/" aria-label="TCA Inicio"><img src={getImageUrl('imagenes/TCALOGOINICIO.png')} alt="Distribuidora TCA"/></a>
    <button className="tca-menu" onClick={toggleSidebar} aria-label="Abrir menú de categorías">☰</button>
    <nav aria-label="Sitio"><a href="/">Inicio</a><a href="/marcas">Marcas</a><a href="/nosotros">Nosotros</a></nav>
    <form className="tca-search" onSubmit={e=>{e.preventDefault();navigate(`/catalogo?q=${encodeURIComponent(query)}`);}}><input type="search" aria-label="Buscar productos" placeholder="Nombre o código de barras" value={query} onChange={e=>setQuery(e.target.value)}/><button aria-label="Buscar">Buscar</button></form>
    <a href="/carrito" className="tca-cart-link">Carrito ({commerce.cart.reduce((n,l)=>n+l.cantidad,0)})</a>
  </header>;
}
