/**
 * Returns the normalized path for an image located in public/imagenes/
 */
export function getImageUrl(path: string | undefined): string {
  if (!path) return '/imagenes/TCALOGOINICIO.png';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  // Strip leading ./, /, or imagenes/
  const clean = path.replace(/^\.?\/?(imagenes\/)?/, '');
  return `/imagenes/${clean}`;
}

/**
 * Fallback image handler for <img> tags
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackText = 'TCA') {
  const target = e.currentTarget;
  target.onerror = null; // Prevent infinite loop
  // Inline SVG placeholder
  target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f2f2f2" rx="12"/><text x="50%" y="45%" text-anchor="middle" fill="%23c32228" font-family="Arial, sans-serif" font-weight="bold" font-size="20">TCA</text><text x="50%" y="65%" text-anchor="middle" fill="%23666666" font-family="Arial, sans-serif" font-size="12">${encodeURIComponent(fallbackText.slice(0, 18))}</text></svg>`;
}
