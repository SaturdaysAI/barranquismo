import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import canyons from '../data/canyons.seed.json';
import useLocalStorage from '../hooks/useLocalStorage.js';
import MapPreview from '../components/MapPreview.jsx';

// Detail page locates the requested canyon and shows extended information.
function BarrancoDetail() {
  const { id } = useParams();
  const canyon = canyons.find((item) => item.id === id);
  const [favorites, setFavorites] = useLocalStorage('favorite-canyons', []);
  const [isGearOpen, setIsGearOpen] = useState(true);
  const [isLinksOpen, setIsLinksOpen] = useState(true);
  const [isMapOpen, setIsMapOpen] = useState(true);

  if (!canyon) {
    return (
      <section className="detail">
        <h1 className="page-title">Barranco no encontrado</h1>
        <p>Revisa la lista principal o actualiza la aplicación.</p>
        <Link to="/" className="canyon-link">
          Volver al listado
        </Link>
      </section>
    );
  }

  const isFavorite = favorites.includes(canyon.id);

  const toggleFavorite = () => {
    setFavorites((prev) => {
      if (prev.includes(canyon.id)) {
        return prev.filter((favId) => favId !== canyon.id);
      }
      return [...prev, canyon.id];
    });
  };

  return (
    <article className="detail">
      <header className="detail-header">
        <h1 className="page-title">{canyon.name}</h1>
        <div className="detail-topline">
          <span className="badge">{canyon.difficulty}</span>
          <button type="button" className={`favorite-button${isFavorite ? ' is-active' : ''}`} onClick={toggleFavorite}>
            {isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          </button>
        </div>
      </header>
      <p className="detail-description">{canyon.description}</p>

      <section className="detail-section">
        <button type="button" className="section-toggle" onClick={() => setIsLinksOpen((open) => !open)}>
          Enlaces útiles
        </button>
        {isLinksOpen && (
          <ul className="section-list">
            <li>
              <a href={canyon.wikiloc.approach} target="_blank" rel="noopener noreferrer" className="canyon-link external">
                Ruta de aproximación
              </a>
            </li>
            <li>
              <a href={canyon.wikiloc.return} target="_blank" rel="noopener noreferrer" className="canyon-link external">
                Ruta de retorno
              </a>
            </li>
          </ul>
        )}
      </section>

      <section className="detail-section">
        <button type="button" className="section-toggle" onClick={() => setIsGearOpen((open) => !open)}>
          Material recomendado
        </button>
        {isGearOpen && (
          <ul className="section-list">
            {canyon.gear.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="detail-section">
        <button type="button" className="section-toggle" onClick={() => setIsMapOpen((open) => !open)}>
          Mapa de referencia
        </button>
        {isMapOpen && canyon.coordinates && (
          <MapPreview lat={canyon.coordinates.lat} lng={canyon.coordinates.lng} zoom={canyon.coordinates.zoom} />
        )}
      </section>

      <Link to="/" className="canyon-link back">
        Volver al listado
      </Link>
    </article>
  );
}

export default BarrancoDetail;
