import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { RouteGraph } from '../services/routeService';

interface Props {
  graph: RouteGraph | null;
  origin: string;
  destination: string;
  stops?: string[];
}

export function DeliveryRouteMap({ graph, origin, destination, stops }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const fittedStops = useRef<string[] | undefined>(undefined);

  useEffect(() => {
    if (!container.current) return;
    const map = L.map(container.current).setView([-5.25, -80.68], 9);
    mapRef.current = map;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      subdomains: 'abcd',
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    const resize = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    resize.observe(container.current);
    return () => {
      resize.disconnect();
      map.remove();
      mapRef.current = null;
      fittedStops.current = undefined;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !graph) return;
    const layers = L.layerGroup().addTo(map);
    const nodes = Object.entries(graph.nodos).filter(([, node]) => Number.isFinite(node.lat) && Number.isFinite(node.lng));
    const points = new Map(nodes.map(([id, node]) => [id, L.latLng(node.lat, node.lng)]));
    const byName = new Map(nodes.map(([id, node]) => [node.name, points.get(id)!]));

    for (const [from, neighbors] of Object.entries(graph.conexiones ?? {})) {
      for (const [to] of neighbors) {
        const a = points.get(from);
        const b = points.get(to);
        // Each undirected edge occurs twice in the routing graph.
        if (a && b && from < to) L.polyline([a, b], {
          color: '#536372', opacity: 0.48, weight: 2, interactive: false, className: 'tca-network-edge',
        }).addTo(layers);
      }
    }

    const route = stops?.map(name => byName.get(name));
    if (route && route.length > 1 && route.every(point => point !== undefined)) {
      const line = L.polyline(route, { color: '#1761bd', weight: 5, opacity: 0.95, interactive: false, className: 'tca-calculated-route' }).addTo(layers);
      if (fittedStops.current !== stops) map.fitBounds(line.getBounds(), { padding: [28, 28], maxZoom: 15 });
    }
    fittedStops.current = stops;

    for (const [id, node] of nodes) {
      const start = id === origin;
      const end = id === destination;
      const index = stops?.indexOf(node.name) ?? -1;
      const intermediate = index > 0 && index < (stops?.length ?? 0) - 1;
      const marker = L.circleMarker(points.get(id)!, {
        color: intermediate ? '#1761bd' : '#fff',
        weight: intermediate ? 4 : 2,
        fillColor: start ? '#117561' : end ? '#b91f28' : '#536372',
        fillOpacity: 1,
        radius: start || end || intermediate ? 8 : 5,
        className: 'tca-delivery-point',
      }).addTo(layers);
      const label = document.createElement('span');
      label.textContent = intermediate ? `Parada ${index + 1} · ${node.name}` : node.name;
      marker.bindTooltip(label, { direction: 'top' }).bindPopup(label.cloneNode(true) as HTMLElement);
    }
    return () => { map.removeLayer(layers); };
  }, [graph, origin, destination, stops]);

  return <figure className="tca-card tca-operation-panel tca-delivery-map">
    <div className="tca-delivery-map-heading"><h2>Mapa de reparto</h2><span>Piura</span></div>
    <div ref={container} className="tca-leaflet-map" role="region" aria-label="Mapa interactivo de reparto en Piura" />
    <figcaption>
      <ul className="tca-map-legend">
        <li><span className="tca-map-origin" />Origen</li>
        <li><span className="tca-map-destination" />Destino</li>
        <li><span className="tca-map-location" />Punto de reparto</li>
        {stops && <li><span className="tca-map-route" />Recorrido</li>}
      </ul>
      <p className="tca-muted">Las líneas conectan las paradas de la red de reparto.</p>
    </figcaption>
  </figure>;
}
