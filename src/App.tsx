import React, { useEffect } from 'react';
import { UIProvider, useUI } from './context/UIContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { StickyFooter } from './components/StickyFooter';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { StickyModal } from './components/modals/StickyModal';
import { ProductZoomModal } from './components/modals/ProductZoomModal';
import { CatalogSecretModal } from './components/modals/CatalogSecretModal';

import { HomePage } from './pages/HomePage';
import { MarcasPage } from './pages/MarcasPage';
import { NosotrosPage } from './pages/NosotrosPage';
import { BebidasPage } from './pages/BebidasPage';
import { AlcoholicasPage } from './pages/AlcoholicasPage';
import { ProductViewerPage } from './pages/ProductViewerPage';
import { getSubcategoryData } from './data/catalog';

const AppContent: React.FC = () => {
  const { currentPath, navigate } = useUI();

  // Global click interceptor for legacy internal <a href="..."> links
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Ignore external links, javascript pseudo-protocol, tel, mailto, anchor only
      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('javascript:') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        target.getAttribute('target') === '_blank'
      ) {
        return;
      }

      if (href === '#' || href.startsWith('#')) {
        return;
      }

      e.preventDefault();
      navigate(href);
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [navigate]);

  // Route Resolver based on currentPath
  const renderCurrentPage = () => {
    const pathOnly = currentPath.split('?')[0].replace(/^\//, '').toLowerCase();

    // 1. Home
    if (!pathOnly || pathOnly === 'index.html' || pathOnly === 'index') {
      return <HomePage />;
    }

    // 2. Marcas
    if (pathOnly === 'marcas.html' || pathOnly === 'marcas') {
      return <MarcasPage />;
    }

    // 3. Nosotros
    if (pathOnly === 'nosotros.html' || pathOnly === 'nosotros') {
      return <NosotrosPage />;
    }

    // 4. Categoría Bebidas
    if (pathOnly === 'categoria-bebidas.html' || pathOnly === 'categoria-bebidas' || pathOnly === 'bebidas') {
      return <BebidasPage />;
    }

    // 5. Categoría Bebidas Alcohólicas
    if (pathOnly === 'categoria-alcoholicas.html' || pathOnly === 'categoria-alcoholicas' || pathOnly === 'alcoholicas') {
      return <AlcoholicasPage />;
    }

    // 6. Productos Visor (with ?subcat=...)
    if (pathOnly === 'productos-visor.html' || pathOnly === 'productos-visor') {
      return <ProductViewerPage />;
    }

    // 7. Direct Subcategory or Category HTML link (e.g. subcategoria-aceitesclasicos.html)
    const matchSubcat = getSubcategoryData(pathOnly);
    if (matchSubcat) {
      return <ProductViewerPage subcatKeyOrPath={matchSubcat.key} />;
    }

    // 8. Fallback to Home
    return <HomePage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <Sidebar />

      <main className="flex-1 w-full pb-20 overflow-x-hidden">
        {renderCurrentPage()}
      </main>

      <Footer />
      <StickyFooter />
      <WhatsAppFloat />

      {/* Global Modals */}
      <StickyModal />
      <ProductZoomModal />
      <CatalogSecretModal />
    </div>
  );
};

export function App() {
  return (
    <UIProvider>
      <AppContent />
    </UIProvider>
  );
}

export default App;
