import React from 'react';
import { useUI } from '../context/UIContext';
import { getImageUrl, handleImageError } from '../utils/image';

interface CategoryItem {
  id: string;
  name: string;
  image: string;
  href: string;
  extraClass?: string;
  imageStyle?: React.CSSProperties;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'alimentos',
    name: 'ALIMENTOS',
    image: 'imagenes/azucar.png',
    href: 'subcategoria-aceitesclasicos.html',
  },
  {
    id: 'bebidas',
    name: 'BEBIDAS',
    image: 'imagenes/beb.png',
    href: 'categoria-bebidas.html',
    imageStyle: { transform: 'translateY(-10px)' },
  },
  {
    id: 'cuidado-personal',
    name: 'CUIDADO PERSONAL',
    image: 'imagenes/talco.png',
    href: 'categoria-cuidado-personal.html',
  },
  {
    id: 'hogar-utilidades',
    name: 'HOGAR Y UTILIDADES',
    image: 'imagenes/pilas.png',
    href: 'categoria-hogar.html',
  },
  {
    id: 'papeleria',
    name: 'PAPELERÍA',
    image: 'imagenes/papeldef.png',
    href: 'categoria-papeleria.html',
  },
  {
    id: 'limpieza-hogar',
    name: 'LIMPIEZA\nDEL HOGAR',
    image: 'imagenes/limp.png',
    href: 'categoria-limpieza.html',
  },
];

export const CategoriesSection: React.FC = () => {
  const { navigate } = useUI();

  return (
    <section className="flex justify-center flex-wrap gap-7 my-5 px-5 pb-20 max-w-[900px] mx-auto">
      {CATEGORIES.map((cat) => (
        <div
          key={cat.id}
          onClick={() => navigate(cat.href)}
          className="group bg-white text-center flex flex-col items-center w-[240px] p-6 rounded-2xl border border-gray-100 shadow-sm cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:border-[#C32228]"
        >
          <div className="w-[180px] h-[180px] mb-5 flex justify-center items-center overflow-hidden">
            <img
              src={getImageUrl(cat.image)}
              alt={cat.name.replace('\n', ' ')}
              style={cat.imageStyle}
              className="w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-125"
              onError={(e) => handleImageError(e, cat.name)}
            />
          </div>
          <p className="text-gray-800 text-lg font-extrabold m-0 whitespace-pre-line leading-tight">
            {cat.name}
          </p>
        </div>
      ))}
    </section>
  );
};
