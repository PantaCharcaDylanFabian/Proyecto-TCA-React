import { useState } from 'react';
import type { FormEvent } from 'react';
import type { ManagedProduct } from '../types';
import { estimateSupply, getForecastEvaluation } from '../services/forecastService';
import { errorMessage } from '../lib/api';
import { useResource } from '../hooks/useResource';
import { Notice, ResourceStatus } from './OperationUI';

const percent = new Intl.NumberFormat('es-PE', { style: 'percent', maximumFractionDigits: 1 });
const units = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 1 });

export function SupplyForecast({ products, incoming }: {
  products: ManagedProduct[];
  incoming: (code: string) => number;
}) {
  const [code, setCode] = useState('');
  const [showEvaluation, setShowEvaluation] = useState(false);
  const active = products.filter(product => product.activo);
  const product = active.find(item => item.codigo === code);
  const available = product ? product.stock_actual - (product.stock_reservado || 0) : 0;

  return <section className="tca-card tca-stack tca-operation-panel" aria-labelledby="forecast-title">
    <div><h2 id="forecast-title">Previsión de abastecimiento</h2>
      <p>Estima la demanda de la próxima quincena y revisa si conviene adelantar una reposición.</p></div>
    <label>Producto a evaluar<select value={code} disabled={!active.length} onChange={event => setCode(event.target.value)}>
      <option value="">{active.length ? 'Selecciona un producto' : 'No hay productos activos'}</option>
      {active.map(item => <option key={item.codigo} value={item.codigo}>{item.nombre} · {item.codigo}</option>)}
    </select></label>
    {product && <ScenarioForm key={[code, available, product.precio, product.stock_minimo].join(':')}
      product={product} available={available} incoming={incoming(code)} />}
    <details className="tca-operation-help" onToggle={event => setShowEvaluation(event.currentTarget.open)}>
      <summary>¿Qué precisión tienen las estimaciones?</summary>
      {showEvaluation && <ForecastEvaluation />}
    </details>
  </section>;
}

function ForecastEvaluation() {
  const evaluation = useResource(getForecastEvaluation);
  const data = evaluation.data;
  return <div>
    <ResourceStatus {...evaluation} retry={evaluation.refresh}/>
    {data && <p>En una prueba con {data.productosEvaluados} productos y demanda simulada, el error medio de la proyección fue de {units.format(data.errorDemanda)} unidades.
      {' '}El acierto fue del {percent.format(data.aciertoRiesgo)} para el riesgo de agotamiento y del {percent.format(data.aciertoPrioridad)} para la prioridad de reposición.</p>}
  </div>;
}

function ScenarioForm({ product, available, incoming }: { product: ManagedProduct; available: number; incoming: number }) {
  const [weekly, setWeekly] = useState('');
  const [orders, setOrders] = useState('');
  const [days, setDays] = useState('');
  const [result, setResult] = useState<Awaited<ReturnType<typeof estimateSupply>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function calculate(event: FormEvent) {
    event.preventDefault();
    setError('');
    setResult(null);
    setBusy(true);
    try {
      setResult(await estimateSupply({
        precio: Number(product.precio), stockDisponible: available, stockMinimo: product.stock_minimo,
        unidadesSemana: Number(weekly), pedidosSemana: Number(orders), plazoDias: Number(days),
      }));
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  return <>
    <p className="tca-forecast-stock"><strong>{available} unidades disponibles</strong> · {incoming} en compras pendientes</p>
    <form className="tca-stack" onSubmit={calculate} onChange={() => { setResult(null); setError(''); }}>
      <fieldset disabled={busy} className="tca-stack">
        <legend>Escenario de ventas y entrega</legend>
        <p className="tca-muted">Ingresa las unidades y los pedidos de una misma semana, y el plazo habitual de tu proveedor.</p>
        <div className="tca-forecast-fields">
          <label>Unidades vendidas por semana<input type="number" required min="1" max="1000000000" step="1" value={weekly} placeholder="Ej. 35" onChange={e => setWeekly(e.target.value)} /></label>
          <label>Pedidos con este producto por semana<input type="number" required min="1" max={Number(weekly) || undefined} step="1" value={orders} placeholder="Ej. 7" onChange={e => setOrders(e.target.value)} /></label>
          <label>Plazo del proveedor (días)<input type="number" required min="1" max="1000000000" step="1" value={days} placeholder="Ej. 5" onChange={e => setDays(e.target.value)} /></label>
        </div>
      </fieldset>
      <button className="tca-button" disabled={busy}>{busy ? 'Calculando…' : 'Calcular previsión'}</button>
      <Notice error={error} />
    </form>
    {result && <section className="tca-forecast-result" aria-label="Resultado de la previsión" aria-live="polite">
      <h3>Previsión para {product.nombre}</h3>
      <dl className="tca-forecast-fields">
        <div><dt>Demanda en 15 días</dt><dd>{units.format(result.demandaQuincenal)} unidades</dd></div>
        <div><dt>Riesgo de agotamiento antes de la entrega</dt><dd>{percent.format(result.probabilidadQuiebre)}</dd></div>
        <div><dt>Prioridad de reposición</dt><dd>{result.prioridad}</dd></div>
      </dl>
      <p>Al ritmo de venta indicado, las existencias disponibles cubren {units.format(available * 7 / Number(weekly))} días. El plazo del proveedor es de {days} días.</p>
      {result.fueraDeRango && <p className="tca-warning">Este escenario queda fuera del rango de los datos de referencia. Contrasta la estimación con tus ventas recientes.</p>}
    </section>}
  </>;
}
