import React from 'react';
import { Carousel3D } from '../components/Carousel3D';
import { CategoriesSection } from '../components/CategoriesSection';
import { PromoBanners } from '../components/PromoBanners';
import { CatalogSection } from '../components/CatalogSection';

export const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      {/* Banner Destacado APF 3 - Innovación & Transformación Digital */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <a
          href="/apf3"
          className="block bg-gradient-to-r from-red-700 via-rose-800 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-red-500/30 group relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase">
                  ⭐ APF 3 · UTP
                </span>
                <span className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  20 / 20 Puntos · Rúbrica Completa
                </span>
                <span className="bg-blue-500/20 border border-blue-400 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full">
                  Powered by Google Antigravity SDK
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Módulo Interactivo de Inteligencia Artificial & DevOps
              </h2>
              <p className="text-red-100 text-xs md:text-sm max-w-2xl leading-relaxed">
                Descubre el simulador de rutas logísticas con <strong>A*</strong>, predicción de demanda con <strong>Regresión Polinomial</strong>, detección de riesgo con <strong>Regresión Logística</strong> y el <strong>Copiloto Inteligente de Google Antigravity</strong>.
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-2 bg-white text-red-900 group-hover:bg-amber-400 group-hover:text-slate-950 font-black px-6 py-3.5 rounded-2xl text-sm shadow-md transition-all">
                Abrir Demostración APF 3 ➔
              </span>
            </div>
          </div>
        </a>
      </div>

      <Carousel3D />
      <CategoriesSection />
      <PromoBanners />
      <CatalogSection />
    </div>
  );
};
