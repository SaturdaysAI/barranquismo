import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const baseMarker = L.divIcon({
  html: '<span class="map-marker map-marker--default">📍</span>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 30],
});

const startMarker = L.divIcon({
  html: '<span class="map-marker map-marker--start">🚩</span>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 30],
});

const finishMarker = L.divIcon({
  html: '<span class="map-marker map-marker--finish">🏁</span>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 30],
});

const parkingMarker = L.divIcon({
  html: '<span class="map-marker map-marker--parking">🚗</span>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 30],
});

const markerByType = {
  depart: startMarker,
  arrivee: finishMarker,
  parking: parkingMarker,
};

function MapPreview({ lat, lng, zoom = 13, markers = [] }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || typeof lat !== 'number' || typeof lng !== 'number') {
      return undefined;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([lat, lng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const group = L.featureGroup();
    L.marker([lat, lng], { icon: baseMarker }).addTo(group);

    markers
      .filter((marker) => typeof marker?.lat === 'number' && typeof marker?.lng === 'number')
      .forEach((marker) => {
        const icon = markerByType[marker.type] ?? baseMarker;
        L.marker([marker.lat, marker.lng], { icon }).addTo(group);
      });

    if (group.getLayers().length > 0) {
      group.addTo(map);
      if (group.getLayers().length > 1) {
        map.fitBounds(group.getBounds().pad(0.2));
      }
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [lat, lng, zoom, markers]);

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return null;
  }

  return (
    <div className="map-preview">
      <div ref={mapContainerRef} className="map-preview__map" aria-label="Mapa del barranco" />
      <p className="map-caption">
        Vista previa OpenStreetMap · Iconos: 🚗 parking, 🚩 inicio, 🏁 final. Ajusta coordenadas en los datos si lo necesitas.
      </p>
    </div>
  );
}

export default MapPreview;
