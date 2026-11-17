import { useState } from 'react';

export function LegacyDataRecovery() {
  const [legacy] = useState(() => {
    const found: Record<string, unknown> = {};
    for (const key of ['tca_productos_catalogo_hu11','tca_pedidos_borrador_hu12']) {
      const raw = localStorage.getItem(key);
      if (raw) { try { found[key] = JSON.parse(raw); } catch { found[key] = raw; } }
    }
    return found;
  });
  if (!Object.keys(legacy).length) return null;
  return <section className="tca-card"><h2>Registros locales de la versión anterior</h2><p>Este navegador conserva datos del almacenamiento antiguo. No se mezclan automáticamente con el inventario central ni se borran al cerrar sesión. Descarga una copia y revisa con el equipo qué registros deben recuperarse.</p>
    <button className="tca-button secondary" onClick={() => {
      const blob = new Blob([JSON.stringify(legacy,null,2)],{type:'application/json'});
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='respaldo-local-tca.json'; a.click(); window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    }}>Descargar respaldo local</button>
  </section>;
}
