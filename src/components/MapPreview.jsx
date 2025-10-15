// MapPreview renders a lightweight OpenStreetMap iframe without external dependencies.
function MapPreview({ lat, lng, zoom = 13 }) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return null;
  }

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02}%2C${lat - 0.02}%2C${lng + 0.02}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="map-preview">
      <iframe
        title="Mapa del barranco"
        src={src}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
      <p className="map-caption">Vista previa OpenStreetMap · Ajusta coordenadas en los datos si lo necesitas.</p>
    </div>
  );
}

export default MapPreview;
