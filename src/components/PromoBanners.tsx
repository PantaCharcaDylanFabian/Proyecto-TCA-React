import React from 'react';
import { useUI } from '../context/UIContext';
import { getImageUrl, handleImageError } from '../utils/image';

const BANNERS = [
  {
    image: 'imagenes/cerealbanner.png',
    alt: 'Oferta Cereales',
    href: 'subcategoria-bañadas.html',
  },
  {
    image: 'imagenes/bebbanner.png',
    alt: 'Oferta Bebidas',
    href: 'categoria-bebidas.html',
  },
  {
    image: 'imagenes/PROOF2.png',
    alt: 'Oferta Cervezas',
    href: 'subcategoria-cervezas.html',
  },
];

export const PromoBanners: React.FC = () => {
  const { navigate } = useUI();

  return (
    <div className="flex justify-center items-center gap-7 px-5 pb-20 max-w-[1200px] mx-auto flex-wrap">
      {BANNERS.map((banner, index) => (
        <a
          key={index}
          href={banner.href}
          onClick={(e) => {
            e.preventDefault();
            navigate(banner.href);
          }}
          className="block w-[340px] lg:w-[360px] group transition-all duration-300"
        >
          <img
            src={getImageUrl(banner.image)}
            alt={banner.alt}
            className="w-full h-auto block rounded-2xl shadow-md transition-all duration-300 ease-out group-hover:scale-105 group-hover:-translate-y-1.5 group-hover:shadow-2xl"
            onError={(e) => handleImageError(e, banner.alt)}
          />
        </a>
      ))}
    </div>
  );
};
