import { useState } from 'react';
import { useUI } from '../context/UIContext';
import { useCommerce } from '../context/CommerceContext';
import { getImageUrl } from '../utils/image';
export function Header(){
  const {toggleSidebar,navigate}=useUI();const commerce=useCommerce();const [query,setQuery]=useState('');
  return <header className="tca-header no-print"><a href="/" aria-label="TCA Inicio"><img src={getImageUrl('imagenes/TCALOGOINICIO.png')} alt="Distribuidora TCA"/></a>
    <button className="tca-menu" onClick={toggleSidebar} aria-label="Abrir menú de categorías">☰</button>
    <nav aria-label="Sitio">
      <a href="/">Inicio</a>
      <a href="/marcas">Marcas</a>
      <a href="/nosotros">Nosotros</a>
      <a href="/apf3" className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md shadow-amber-400/30 whitespace-nowrap transition-all hover:scale-105">
        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
        ✨ APF 3 · IA & DevOps
        <span className="bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded-md text-[10px] font-extrabold">20 Pts</span>
      </a>
    </nav>
    <form className="tca-search" onSubmit={e=>{e.preventDefault();navigate(`/catalogo?q=${encodeURIComponent(query)}`);}}><input type="search" aria-label="Buscar productos" placeholder="Nombre o código de barras" value={query} onChange={e=>setQuery(e.target.value)}/><button aria-label="Buscar">Buscar</button></form>
    <a href="/carrito" className="tca-cart-link">Carrito ({commerce.cart.reduce((n,l)=>n+l.cantidad,0)})</a>
  </header>;
}
