import { money } from '../utils/format';
import { useResource } from '../hooks/useResource';
import { getManagedProducts } from '../services/productService';
import { getDraftOrders } from '../services/orderService';
import { Page, ResourceStatus } from '../components/OperationUI';
import { useAuth } from '../context/AuthContext';
import { downloadCsv } from '../utils/download';
import { LegacyDataRecovery } from '../components/LegacyDataRecovery';

export function DashboardPage() {
  const { can } = useAuth();
  const managesInventory = can('GERENCIA', 'ALMACEN');
  const managesSales = can('GERENCIA', 'VENTAS');
  const isManager = can('GERENCIA');
  const orderResource = useResource(getDraftOrders);
  const inventoryResource = useResource(
    async () => managesInventory ? getManagedProducts() : null,
    String(managesInventory),
  );
  const orders = orderResource.data?.data ?? [];
  const products = inventoryResource.data?.data ?? [];
  const activeProducts = products.filter(product => product.activo);
  const lowStock = activeProducts.filter(product => product.stock_actual - (product.stock_reservado ?? 0) <= product.stock_minimo);
  const indicators = [
    ...(managesSales ? [{ label: 'Borradores', count: orders.filter(order => order.estado === 'BORRADOR').length }] : []),
    { label: 'Por despachar', count: orders.filter(order => order.estado === 'CONFIRMADO').length },
  ];

  function exportInventory() {
    downloadCsv('inventario-tca.csv', ['Código', 'Producto', 'Físico', 'Reservado', 'Disponible', 'Mínimo', 'Objetivo'],
      products.map(product => {
        const reserved = product.stock_reservado ?? 0;
        return [product.codigo, product.nombre, product.stock_actual, reserved, product.stock_actual - reserved,
          product.stock_minimo, product.stock_objetivo ?? 0];
      }),
    );
  }

  return <Page title="Panel de operaciones" description="Consulta los pendientes y abre las herramientas de tu área.">
    <div className={isManager ? 'tca-dashboard tca-dashboard-manager' : 'tca-dashboard'}>
      <section className="tca-card tca-operation-panel" aria-labelledby="dashboard-orders">
        <h2 id="dashboard-orders">{managesSales ? 'Pedidos' : 'Despacho'}</h2>
        <ResourceStatus {...orderResource} retry={orderResource.refresh} />
        {orderResource.data && <dl className="tca-dashboard-metrics">
          {indicators.map(({ label, count }) => <div key={label}><dt>{label}</dt><dd>{count}</dd></div>)}
        </dl>}
        <div className="tca-row">
          <a className="tca-button" href="/pedidos">{managesSales ? 'Atender pedidos' : 'Abrir pedidos para despacho'}</a>
          {managesInventory && <a className="tca-button secondary" href="/rutas-de-reparto">Planificar reparto</a>}
        </div>
      </section>

      {managesInventory && <section className="tca-card tca-operation-panel tca-dashboard-stock" aria-labelledby="dashboard-stock">
        <h2 id="dashboard-stock">Inventario</h2>
        <ResourceStatus {...inventoryResource} retry={inventoryResource.refresh} />
        {inventoryResource.data && <dl className="tca-dashboard-metrics">
          <div><dt>Productos activos</dt><dd>{activeProducts.length}</dd></div>
          <div><dt>Por reponer</dt><dd>{lowStock.length}</dd></div>
        </dl>}
        <div className="tca-row">
          <a className="tca-button" href="/inventario">Recibir mercadería</a>
          <a className="tca-button secondary" href="/reposicion">Revisar reposición</a>
        </div>
        {inventoryResource.data && <div className="tca-operation-subsection">
          <h3>Alertas de reposición</h3>
          {lowStock.length ? <ul className="tca-dashboard-alerts">
            {lowStock.slice(0, 5).map(product => <li key={product.codigo}>
              <strong>{product.nombre}</strong>
              <span>Disponible {product.stock_actual - (product.stock_reservado ?? 0)} · Mínimo {product.stock_minimo}</span>
            </li>)}
          </ul> : <p className="tca-empty">No hay alertas activas.</p>}
          {lowStock.length > 5 && <p className="tca-muted">Mostrando 5 de {lowStock.length} alertas.</p>}
        </div>}
      </section>}

      {isManager && <section className="tca-card tca-operation-panel" aria-labelledby="dashboard-management">
        <h2 id="dashboard-management">Administración</h2>
        {inventoryResource.data && <p>Valor físico referencial del inventario <strong>{money(products.reduce((sum, product) => sum + product.precio * product.stock_actual, 0))}</strong></p>}
        <div className="tca-row">
          <a className="tca-button secondary" href="/gestion-productos">Gestionar productos</a>
          <a className="tca-button secondary" href="/equipo">Gestionar equipo</a>
          <button className="tca-button secondary" type="button" disabled={!inventoryResource.data} onClick={exportInventory}>Exportar inventario</button>
        </div>
        <LegacyDataRecovery />
      </section>}
    </div>
  </Page>;
}
