import { getImageUrl, handleImageError } from '../utils/image';

const categories = [
  { name: 'Alimentos', image: 'azucar.png', href: '/categoria-alimentos', tint: 'bg-[#fae5b8]' },
  { name: 'Bebidas', image: 'beb.png', href: '/categoria-bebidas', tint: 'bg-[#d6eae4]' },
  { name: 'Cuidado personal', image: 'talco.png', href: '/categoria-cuidado-personal', tint: 'bg-[#f6dedd]' },
  { name: 'Hogar y utilidades', image: 'pilas.png', href: '/categoria-hogar', tint: 'bg-[#dce7f2]' },
  { name: 'Papelería', image: 'papeldef.png', href: '/categoria-papeleria', tint: 'bg-[#e9e0ef]' },
  { name: 'Limpieza del hogar', image: 'limp.png', href: '/categoria-limpieza', tint: 'bg-[#e1eaca]' },
];

export function CategoriesSection() {
  return (
    <section aria-labelledby="store-categories">
      <h2 id="store-categories">Compra por categoría</h2>
      <ul className="store-categories">
        {categories.map(({ name, image, href, tint }) => (
          <li key={href}>
            <a href={href} className={tint}>
              <img src={getImageUrl(image)} alt="" loading="lazy" onError={e => handleImageError(e, name)} />
              <span>{name}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
