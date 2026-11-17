import { dateTime } from '../utils/format';
import { useRef, useState } from 'react';
import { getManagedProducts } from '../services/productService';
import { rpc } from '../lib/api';
import { useAction, useResource } from '../hooks/useResource';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { Page, Notice, ResourceStatus } from '../components/OperationUI';
import type { Movement } from '../types';
import { CameraScanner } from '../components/CameraScanner';

export function InventoryPage() {
  const resource = useResource(async () => ({ products: (await getManagedProducts()).data, movements: await rpc<Movement[]>('tca_movimientos') }));
  const action = useAction(resource.refresh); const auth = useAuth(); const { navigate } = useUI();
  const [scan, setScan] = useState(''); const [selected, setSelected] = useState('');
  const [search, setSearch] = useState(''); const [quantity, setQuantity] = useState('');
  const [reference, setReference] = useState(''); const [supplier, setSupplier] = useState('');
  const [recognition, setRecognition] = useState(''); const scanRef = useRef<HTMLInputElement>(null);
  const product = resource.data?.products.find(p => p.codigo === selected);
  const recognize = (code: string) => {
    const found = resource.data?.products.find(p => p.activo && (p.codigo.toUpperCase() === code.trim().toUpperCase() || p.codigo_barras === code.trim()));
    if (!found) { setSelected(''); setRecognition('Código no reconocido. Busca por nombre o revisa el catálogo.'); return; }
    setSelected(found.codigo); setSupplier(found.proveedor || ''); setRecognition(`✓ Código reconocido: ${found.nombre}`);
  };
  return <Page title="Inventario y recepción" description="Escanea con un lector que envíe Enter, escribe un código o busca el producto. Cada entrada queda registrada con usuario y fecha.">
    <ResourceStatus {...resource} retry={resource.refresh} /><Notice error={action.error} message={action.message} />
    <div className="tca-grid">
      <section className="tca-card tca-stack"><h2>Registrar entrada</h2>
        <CameraScanner onCode={code => { setScan(code); recognize(code); }} />
        <form className="tca-row" onSubmit={e => { e.preventDefault(); recognize(scan); }}>
          <label className="grow">Código de producto o barras<input ref={scanRef} autoFocus value={scan} onChange={e => setScan(e.target.value)} placeholder="Escanear o escribir código" /></label>
          <button className="tca-button secondary" disabled={resource.loading}>Reconocer</button>
        </form>
        {recognition && <p role="status" className={product ? 'tca-success' : 'tca-error'}>{recognition}</p>}
        {!product && recognition && auth.can('GERENCIA') && <button className="tca-button secondary" onClick={() => navigate('/gestion-productos')}>Crear producto nuevo</button>}
        <label>Buscar manualmente<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Nombre o código" /></label>
        <label>Producto<select value={selected} onChange={e => recognize(e.target.value)}><option value="">Selecciona…</option>{resource.data?.products.filter(p => p.activo && `${p.codigo} ${p.nombre}`.toLowerCase().includes(search.toLowerCase())).map(p => <option key={p.codigo} value={p.codigo}>{p.codigo} · {p.nombre}</option>)}</select></label>
        {product && <p>Stock físico: <strong>{product.stock_actual}</strong> · Reservado: {product.stock_reservado || 0} · Disponible: {product.stock_actual - (product.stock_reservado || 0)}</p>}
        <form className="tca-stack" onSubmit={async e => {
          e.preventDefault();
          if (!product || !Number.isSafeInteger(Number(quantity)) || Number(quantity) <= 0) { action.setError('Selecciona un producto y una cantidad entera positiva.'); return; }
          const payload = { p_codigo: product.codigo, p_cantidad: Number(quantity), p_referencia: reference, p_proveedor: supplier };
          if (await action.run(JSON.stringify(payload), key => rpc('tca_entrada', { ...payload, p_operacion: key }), 'Entrada registrada. El nuevo saldo está guardado.')) { setQuantity(''); setReference(''); setScan(''); scanRef.current?.focus(); }
        }}>
          <label>Cantidad recibida<input type="number" min="1" max="1000000" step="1" required value={quantity} onChange={e => setQuantity(e.target.value)} /></label>
          <label>Proveedor<input maxLength={200} value={supplier} onChange={e => setSupplier(e.target.value)} /></label>
          <label>Guía o referencia<input maxLength={200} value={reference} onChange={e => setReference(e.target.value)} /></label>
          {product && quantity && <p>Nuevo saldo previsto: <strong>{product.stock_actual + Number(quantity)}</strong> unidades.</p>}
          <button className="tca-button" disabled={action.busy || !product}>{action.busy ? 'Registrando…' : 'Confirmar recepción'}</button>
        </form>
      </section>
      <section className="tca-card"><h2>Movimientos recientes</h2><p className="tca-muted">Últimos 500 movimientos. El historial conserva las entradas y salidas; no se elimina al cancelar pedidos.</p>
        <div className="tca-table"><table><thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Saldo</th><th>Referencia / actor</th></tr></thead><tbody>
          {resource.data?.movements.map(m => <tr key={m.id}><td>{dateTime(m.created_at)}</td><td>{m.producto_codigo}</td><td>{m.tipo}</td><td>{m.cantidad}</td><td>{m.saldo}</td><td>{m.referencia}<small className="block">{m.actor || 'Semilla de prueba'}</small></td></tr>)}
        </tbody></table></div>{resource.data?.movements.length === 0 && <p>No hay movimientos registrados.</p>}
      </section>
    </div>
  </Page>;
}
