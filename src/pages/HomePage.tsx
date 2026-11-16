import React from 'react';
import { Carousel3D } from '../components/Carousel3D';
import { CategoriesSection } from '../components/CategoriesSection';
import { PromoBanners } from '../components/PromoBanners';
import { CatalogSection } from '../components/CatalogSection';

export const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      <Carousel3D />
      <CategoriesSection />
      <PromoBanners />
      <CatalogSection />
    </div>
  );
};
