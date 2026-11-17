import { money } from '../utils/format';
import { useResource } from '../hooks/useResource';
import { getManagedProducts } from '../services/productService';
import { getDraftOrders } from '../services/orderService';
import { Page, ResourceStatus } from '../components/OperationUI';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { downloadCsv } from '../utils/download';
import { LegacyDataRecovery } from '../components/LegacyDataRecovery';
export function DashboardPage() {
  const resource = useResource(async () => ({ products: (await getManagedProducts()).data, orders: (await getDraftOrders()).data }));
  const auth = useAuth(); const { navigate } = useUI(); const products = resource.data?.products || []; const orders = resource.data?.orders || [];
  const low = products.filter(p => p.activo && p.stock_actual - (p.stock_reservado || 0) <= p.stock_minimo);
  return <Page title={`Bienvenido, ${auth.profile?.nombre}`} description="Resumen operativo del inventario central. Los datos se vuelven a consultar al abrir o enfocar la página.">
    <ResourceStatus {...resource} retry={resource.refresh} />
    {auth.can('GERENCIA') && <LegacyDataRecovery />}
    <div className="tca-stats">{[
      ['Productos activos',products.filter(p => p.activo).length],['Por reponer',low.length],['Borradores',orders.filter(o => o.estado==='BORRADOR').length],['Por despachar',orders.filter(o => o.estado==='CONFIRMADO').length],
    ].map(([label, value]) => <div className="tca-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    <div className="tca-card"><h2>Prioridades del equipo</h2><div className="tca-row">
      {auth.can('GERENCIA','ALMACEN') && <button className="tca-button" onClick={() => navigate('/inventario')}>Recibir mercadería</button>}
      <button className="tca-button secondary" onClick={() => navigate('/pedidos')}>Atender pedidos</button>
      {auth.can('GERENCIA','ALMACEN') && <button className="tca-button secondary" onClick={() => navigate('/reposicion')}>Revisar reposición</button>}
      {auth.can('GERENCIA') && <button className="tca-button secondary" onClick={() => downloadCsv('inventario-tca.csv',['Código','Producto','Físico','Reservado','Disponible','Mínimo','Objetivo'],products.map(p => [p.codigo,p.nombre,p.stock_actual,p.stock_reservado||0,p.stock_actual-(p.stock_reservado||0),p.stock_minimo,p.stock_objetivo||0]))}>Exportar inventario</button>}
    </div><p>Valor físico referencial: <strong>{money(products.reduce((sum,p) => sum+p.precio*p.stock_actual,0))}</strong>. No incluye contabilidad, pagos ni comprobantes SUNAT.</p></div>
    <div className="tca-card"><h2>Productos en el umbral de reposición</h2>{low.length ? <ul>{low.slice(0,12).map(p => <li key={p.codigo}>{p.nombre}: disponible <strong>{p.stock_actual-(p.stock_reservado||0)}</strong> · mínimo {p.stock_minimo}</li>)}</ul> : <p>No hay alertas activas.</p>}</div>
  </Page>;
}
