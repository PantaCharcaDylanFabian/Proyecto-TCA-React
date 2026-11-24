import { StorefrontHero } from '../components/StorefrontHero';
import { CategoriesSection } from '../components/CategoriesSection';
import { PromoBanners } from '../components/PromoBanners';
import { CatalogSection } from '../components/CatalogSection';

export function HomePage() {
  return (
    <div className="store-front">
      <div className="store-container store-home">
        <StorefrontHero />
        <CategoriesSection />
      </div>
      <PromoBanners />
      <CatalogSection />
    </div>
  );
}
