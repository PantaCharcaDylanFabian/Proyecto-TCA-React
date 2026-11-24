import { useState } from 'react';
import { Page, Notice, ResourceStatus } from '../components/OperationUI';
import { DeliveryRouteMap } from '../components/DeliveryRouteMap';
import { useResource } from '../hooks/useResource';
import { errorMessage } from '../lib/api';
import { calculateRoute, getRouteLocations } from '../services/routeService';

const distance = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 1 });

export function DeliveryRoutesPage() {
  const locations = useResource(getRouteLocations);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [result, setResult] = useState<Awaited<ReturnType<typeof calculateRoute>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const options = Object.entries(locations.data?.nodos ?? {});

  function clearResult() {
    setResult(null);
    setError('');
  }

  async function runRoute() {
    clearResult();
    setLoading(true);
    try {
      setResult(await calculateRoute(origin, destination));
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setLoading(false);
    }
  }

  return <Page title="Rutas de reparto" description="Estima la distancia y revisa el recorrido antes de organizar un despacho en Piura.">
    <div className="tca-delivery-layout">
      <form className="tca-card tca-stack tca-operation-panel" onSubmit={event => {
        event.preventDefault();
        void runRoute();
      }}>
        <h2>Planificar un recorrido</h2>
        <ResourceStatus {...locations} retry={locations.refresh} />
        <label>Origen<select required value={origin} disabled={loading || !options.length} onChange={event => {
          setOrigin(event.target.value);
          if (event.target.value === destination) setDestination('');
          clearResult();
        }}>
          <option value="">Selecciona un punto de salida</option>
          {options.map(([id, location]) => <option key={id} value={id}>{location.name}</option>)}
        </select></label>
        <label>Destino<select required value={destination} disabled={loading || !options.length} onChange={event => {
          setDestination(event.target.value);
          clearResult();
        }}>
          <option value="">Selecciona un destino</option>
          {options.map(([id, location]) => <option key={id} value={id} disabled={id === origin}>{location.name}</option>)}
        </select></label>
        <button className="tca-button" disabled={loading || !origin || !destination || origin === destination}>
          {loading ? 'Calculando ruta…' : 'Calcular ruta'}
        </button>
        <Notice error={error} />
      </form>

      <DeliveryRouteMap graph={locations.data} origin={origin} destination={destination} stops={result?.path} />

      <section className="tca-card tca-operation-panel" aria-labelledby="delivery-route-result" aria-busy={loading}>
        <h2 id="delivery-route-result">Recorrido sugerido</h2>
        {result ? <>
          <div className="tca-cart-total"><span>Distancia estimada</span><strong>{distance.format(result.cost)} km</strong></div>
          <ol className="tca-delivery-stops">{result.path.map(stop => <li key={stop}>{stop}</li>)}</ol>
          <p className="tca-muted">Estimación basada en puntos de reparto disponibles. Revisa las condiciones de tránsito antes de salir.</p>
          <a className="tca-button secondary" href="/pedidos">Ir a pedidos</a>
        </> : <p className="tca-muted" role="status">{loading ? 'Consultando el recorrido…' : 'Elige un origen y un destino para ver la distancia y el orden de las paradas.'}</p>}
      </section>
    </div>
  </Page>;
}
