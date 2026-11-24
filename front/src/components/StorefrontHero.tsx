import { useState } from 'react';
import { getImageUrl, handleImageError } from '../utils/image';

const photos = [
  ['bodega2.jpeg', 'Comerciante frente a los estantes de su bodega'],
  ['Bodega.jpg', 'Atención a un cliente en el mostrador de una bodega'],
  ['EXAMPLE.jpg', 'Equipo de almacén revisando productos en un pasillo'],
  ['example3.jpg', 'Personal de almacén junto a las estanterías'],
  ['estanterias.avif', 'Estanterías con mercadería'],
  ['example2.jpg', 'Equipo reunido en un centro de distribución'],
];

export function StorefrontHero() {
  const [index, setIndex] = useState(0);
  const [photo, description] = photos[index];

  function changePhoto(step: number) {
    setIndex(current => (current + step + photos.length) % photos.length);
  }

  return (
    <section className="store-hero" aria-labelledby="store-title">
      <div className="store-hero-copy">
        <h1 id="store-title">Abastece tu negocio</h1>
        <p>Encuentra alimentos, bebidas y productos de uso diario. Consulta precios y arma tu pedido.</p>
        <a className="store-hero-link" href="/catalogo">Explorar productos <span aria-hidden="true">→</span></a>
      </div>
      <div className="store-hero-photo">
        <img src={getImageUrl(photo)} alt={description} onError={e => handleImageError(e, 'Distribuidora TCA')} />
        <div className="store-photo-controls">
          <button type="button" aria-label="Foto anterior" onClick={() => changePhoto(-1)}>←</button>
          <span aria-live="polite" aria-atomic="true" aria-label={`Foto ${index + 1} de ${photos.length}`}>{index + 1} / {photos.length}</span>
          <button type="button" aria-label="Foto siguiente" onClick={() => changePhoto(1)}>→</button>
        </div>
      </div>
    </section>
  );
}
