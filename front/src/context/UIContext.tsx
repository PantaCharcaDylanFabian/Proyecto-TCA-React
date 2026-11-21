import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ZoomedProduct } from '../types';

interface UIContextType {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;

  isStickyModalOpen: boolean;
  openStickyModal: () => void;
  closeStickyModal: () => void;

  isCatalogModalOpen: boolean;
  openCatalogModal: () => void;
  closeCatalogModal: () => void;

  zoomedProduct: ZoomedProduct | null;
  openProductZoom: (image: string, title: string, detail?: string) => void;
  closeProductZoom: () => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  navigate: (path: string) => void;
  currentPath: string;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStickyModalOpen, setIsStickyModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [zoomedProduct, setZoomedProduct] = useState<ZoomedProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Initialize currentPath from window.location
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname + window.location.search;
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    // If it's a hash on same page
    if (to.startsWith('#')) {
      const el = document.getElementById(to.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Clean URL
    let nextUrl = to;
    if (!nextUrl.startsWith('/')) {
      nextUrl = '/' + nextUrl;
    }

    if (window.location.pathname + window.location.search !== nextUrl) {
      window.history.pushState({}, '', nextUrl);
      setCurrentPath(nextUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsSidebarOpen(false);
  };

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const openStickyModal = () => setIsStickyModalOpen(true);
  const closeStickyModal = () => setIsStickyModalOpen(false);

  const openCatalogModal = () => setIsCatalogModalOpen(true);
  const closeCatalogModal = () => setIsCatalogModalOpen(false);

  const openProductZoom = (image: string, title: string, detail = 'Descubre todas nuestras presentaciones') => {
    setZoomedProduct({ image, title, detail });
  };
  const closeProductZoom = () => setZoomedProduct(null);

  // Global escape key listener to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomedProduct) setZoomedProduct(null);
        else if (isCatalogModalOpen) setIsCatalogModalOpen(false);
        else if (isStickyModalOpen) setIsStickyModalOpen(false);
        else if (isSidebarOpen) setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedProduct, isCatalogModalOpen, isStickyModalOpen, isSidebarOpen]);

  return (
    <UIContext.Provider
      value={{
        isSidebarOpen,
        openSidebar,
        closeSidebar,
        toggleSidebar,
        isStickyModalOpen,
        openStickyModal,
        closeStickyModal,
        isCatalogModalOpen,
        openCatalogModal,
        closeCatalogModal,
        zoomedProduct,
        openProductZoom,
        closeProductZoom,
        searchQuery,
        setSearchQuery,
        navigate,
        currentPath,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within a UIProvider');
  return context;
};
