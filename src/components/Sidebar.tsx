import React, { useState } from 'react';
import { useUI } from '../context/UIContext';
import { TOP_CATEGORIES } from '../data/categories';
import type { TopCategory, SubmenuGroup } from '../types';

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, closeSidebar, navigate } = useUI();
  
  // Track hovered/active top category (defaults to 'alimentos')
  const [activeCategory, setActiveCategory] = useState<TopCategory>(TOP_CATEGORIES[0]);
  
  // Track active drilldown group for the current category
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  const handleTopCategoryHover = (cat: TopCategory) => {
    setActiveCategory(cat);
    setActiveGroupId(null);
  };

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (!href || href === '#') return;
    navigate(href);
    closeSidebar();
  };

  const currentGroup = activeCategory.groups.find(g => g.id === activeGroupId);

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Main Sidebar Drawer */}
      <aside
        id="sidebar"
        className={`fixed top-0 left-0 h-full w-[300px] sm:w-[320px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex justify-between items-center px-5 py-4 bg-[#C32228] text-white">
          <h3 className="text-lg font-bold tracking-wide m-0">Categorías</h3>
          <button
            onClick={closeSidebar}
            className="text-white text-3xl font-light hover:text-amber-200 transition-colors p-1 leading-none cursor-pointer border-none bg-transparent"
            aria-label="Cerrar menú"
          >
            &times;
          </button>
        </div>

        {/* Sidebar Main Menu (Top Categories) */}
        <div className="flex-1 overflow-y-auto">
          <ul className="list-none m-0 p-0">
            {TOP_CATEGORIES.map((cat) => {
              const isActive = activeCategory.id === cat.id;
              return (
                <li
                  key={cat.id}
                  className="border-b border-gray-100 relative"
                  onMouseEnter={() => handleTopCategoryHover(cat)}
                >
                  <a
                    href={cat.href}
                    onClick={(e) => {
                      if (cat.href && cat.href !== '#') {
                        handleLinkClick(e, cat.href);
                      } else {
                        e.preventDefault();
                        setActiveCategory(cat);
                        setActiveGroupId(null);
                      }
                    }}
                    className={`flex justify-between items-center px-5 py-4 text-sm font-bold tracking-wide transition-colors ${
                      isActive
                        ? 'text-[#C32228] bg-gray-50 border-l-4 border-[#C32228]'
                        : 'text-gray-800 hover:text-[#C32228] hover:bg-gray-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-gray-400 font-bold text-xs">&gt;</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bottom Section: Admin / HU11 Management link */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-2">
          <a
            href="gestion-productos.html"
            onClick={(e) => handleLinkClick(e, 'gestion-productos.html')}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-700 hover:text-[#C32228] hover:bg-white rounded-lg transition-colors border border-gray-200"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#C32228]">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <span>Gestión de Catálogo (HU11)</span>
          </a>

          <a
            href="pedidos.html"
            onClick={(e) => handleLinkClick(e, 'pedidos.html')}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-700 hover:text-amber-800 hover:bg-white rounded-lg transition-colors border border-gray-200"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <span>Pedidos en Borrador (HU12)</span>
          </a>
        </div>
      </aside>

      {/* Submenu Flyout Panel (Visible when sidebar is open and on screens md+) */}
      {isSidebarOpen && activeCategory.groups.length > 0 && (
        <div
          className="fixed top-0 left-[300px] sm:left-[320px] w-[500px] lg:w-[680px] h-full bg-white shadow-2xl z-50 p-6 md:p-8 overflow-y-auto hidden md:block border-l border-gray-100 transition-all duration-300"
        >
          {/* View 1: List of Sub-groups */}
          {!activeGroupId ? (
            <div>
              <div className="flex items-center gap-4 mb-6 pb-3 border-b-2 border-gray-100">
                <h2 className="text-2xl font-black text-gray-800 uppercase m-0">{activeCategory.name}</h2>
              </div>
              <ul className="list-none m-0 p-0 divide-y divide-gray-100">
                {activeCategory.groups.map((group: SubmenuGroup) => (
                  <li key={group.id}>
                    <button
                      type="button"
                      onClick={() => setActiveGroupId(group.id)}
                      className="w-full flex justify-between items-center py-3.5 px-2 text-left font-bold text-gray-700 hover:text-[#C32228] hover:bg-gray-50 rounded transition-colors uppercase text-sm tracking-wide cursor-pointer bg-transparent border-none"
                    >
                      <span>{group.label}</span>
                      <span className="text-gray-400 font-bold">&gt;</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            /* View 2: Grid of Subcategory Columns (Drilldown) */
            currentGroup && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gray-100">
                  <button
                    type="button"
                    onClick={() => setActiveGroupId(null)}
                    className="flex items-center gap-1.5 text-[#C32228] hover:text-red-800 font-bold text-sm cursor-pointer bg-transparent border-none p-0 transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    Volver
                  </button>
                  <span className="text-gray-300">|</span>
                  <h2 className="text-2xl font-black text-gray-800 uppercase m-0">{currentGroup.title}</h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                  {currentGroup.columns.map((col, idx) => (
                    <div key={`${col.title}-${idx}`} className="min-w-[150px]">
                      {col.title && (
                        <h4 className="m-0 mb-3 font-bold text-[15px] text-gray-900 border-b border-gray-100 pb-1">
                          {col.href && col.href !== '#' ? (
                            <a
                              href={col.href}
                              onClick={(e) => handleLinkClick(e, col.href!)}
                              className="text-gray-900 hover:text-[#C32228] transition-colors"
                            >
                              {col.title}
                            </a>
                          ) : (
                            col.title
                          )}
                        </h4>
                      )}
                      <div className="flex flex-col gap-1.5">
                        {col.links.map((link, lIdx) => (
                          <a
                            key={`${link.label}-${lIdx}`}
                            href={link.href}
                            onClick={(e) => handleLinkClick(e, link.href)}
                            className="text-xs sm:text-sm text-gray-600 hover:text-[#C32228] hover:underline transition-colors block py-0.5"
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </>
  );
};
