import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import canyons from '../data/canyons.js';
import useLocalStorage from '../hooks/useLocalStorage.js';
import MapPreview from '../components/MapPreview.jsx';
import StarRating from '../components/StarRating.jsx';

// Detail page locates the requested canyon and shows extended information.
function BarrancoDetail() {
  const { id } = useParams();
  const canyon = canyons.find((item) => item.id === id);
  const [favorites, setFavorites] = useLocalStorage('favorite-canyons', []);
  const [userRatings, setUserRatings] = useLocalStorage('user-canyon-ratings', {});
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
  const baseVotes = typeof canyon.ratingVotes === 'number' ? canyon.ratingVotes : 0;
  const baseAverage = typeof canyon.ratingAverage === 'number' ? canyon.ratingAverage : null;
  const storedUserRating =
    userRatings && typeof userRatings === 'object' && typeof userRatings[canyon.id] === 'number'
      ? Math.max(1, Math.min(5, userRatings[canyon.id]))
      : null;
  const combinedVotes = baseVotes + (storedUserRating ? 1 : 0);
  const totalScore = (baseAverage ?? 0) * baseVotes + (storedUserRating ?? 0);
  const combinedAverage = combinedVotes > 0 ? totalScore / combinedVotes : 0;

  const toggleFavorite = () => {
    setFavorites((prev) => {
      if (prev.includes(canyon.id)) {
        return prev.filter((favId) => favId !== canyon.id);
      }
      return [...prev, canyon.id];
    });
  };

  const handleRatingChange = (value) => {
    setUserRatings((prev = {}) => {
      const next = { ...prev };
      if (next[canyon.id] === value) {
        delete next[canyon.id];
      } else {
        next[canyon.id] = value;
      }
      return next;
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
        {canyon.location?.text && <p className="detail-location">{canyon.location.text}</p>}
      </header>
      <section className="detail-rating">
        <StarRating
          value={combinedAverage}
          size="large"
          onRate={handleRatingChange}
          label={`Valorar ${canyon.name}`}
        />
        <div className="detail-rating__info">
          <p className="detail-rating__average">
            {combinedVotes > 0 ? `${combinedAverage.toFixed(1)} / 5 · ${combinedVotes} valoraciones` : 'Sin valoraciones todavía'}
          </p>
          <p className="detail-rating__user">
            {storedUserRating
              ? `Tu valoración: ${storedUserRating} / 5 (toca una estrella para cambiar o quitar).`
              : 'Añade tu valoración tocando una estrella. Se guarda en tu dispositivo.'}
          </p>
        </div>
  </section>

  {canyon.description && <p className="detail-description">{canyon.description}</p>}

      <section className="detail-section">
        <button type="button" className="section-toggle" onClick={() => setIsLinksOpen((open) => !open)}>
          Enlaces útiles
        </button>
        {isLinksOpen && (
          <ul className="section-list">
            {canyon.wikiloc?.approach && (
              <li>
                <a href={canyon.wikiloc.approach} target="_blank" rel="noopener noreferrer" className="canyon-link external">
                  Ruta de aproximación
                </a>
              </li>
            )}
            {canyon.wikiloc?.return && (
              <li>
                <a href={canyon.wikiloc.return} target="_blank" rel="noopener noreferrer" className="canyon-link external">
                  Ruta de retorno
                </a>
              </li>
            )}
            {canyon.wikiloc_search_url && (
              <li>
                <a href={canyon.wikiloc_search_url} target="_blank" rel="noopener noreferrer" className="canyon-link external">
                  Buscar rutas en Wikiloc
                </a>
              </li>
            )}
          </ul>
        )}
      </section>

      <section className="detail-section">
        <button type="button" className="section-toggle" onClick={() => setIsGearOpen((open) => !open)}>
          Material recomendado
        </button>
        {isGearOpen && (
          <ul className="section-list">
            {canyon.gear.length > 0 ? (
              canyon.gear.map((item) => (
                <li key={item}>{item}</li>
              ))
            ) : (
              <li>Datos de material pendientes de añadir.</li>
            )}
          </ul>
        )}
      </section>

      <section className="detail-section">
        <button type="button" className="section-toggle" onClick={() => setIsMapOpen((open) => !open)}>
          Mapa de referencia
        </button>
        {isMapOpen && (
          canyon.coordinates ? (
            <MapPreview lat={canyon.coordinates.lat} lng={canyon.coordinates.lng} zoom={canyon.coordinates.zoom} />
          ) : canyon.wikiloc_search_url ? (
            <p className="detail-placeholder">
              Aún no hay coordenadas registradas. Puedes consultar las rutas en{' '}
              <a href={canyon.wikiloc_search_url} target="_blank" rel="noopener noreferrer" className="canyon-link external">
                Wikiloc
              </a>
              .
            </p>
          ) : (
            <p className="detail-placeholder">Mapa pendiente de añadir.</p>
          )
        )}
      </section>

      <Link to="/" className="canyon-link back">
        Volver al listado
      </Link>
    </article>
  );
}

export default BarrancoDetail;
