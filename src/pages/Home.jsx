import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage.js';
import canyons from '../data/canyons.seed.json';

// Home lists the available canyons with quick access to detail pages.
function Home() {
  const [searchTerm, setSearchTerm] = useLocalStorage('canyon-search', '');
  const [favoriteIds] = useLocalStorage('favorite-canyons', []);
  const [favoritesOnly, setFavoritesOnly] = useLocalStorage('show-only-favorites', false);

  const filteredCanyons = useMemo(() => {
    if (!searchTerm) {
      return canyons;
    }
    const normalizedTerm = searchTerm.toLowerCase();
    return canyons.filter((canyon) => {
      return (
        canyon.name.toLowerCase().includes(normalizedTerm) ||
        canyon.difficulty.toLowerCase().includes(normalizedTerm)
      );
    });
  }, [searchTerm]);

  const visibleCanyons = useMemo(() => {
    if (!favoritesOnly) {
      return filteredCanyons;
    }
    return filteredCanyons.filter((canyon) => favoriteIds.includes(canyon.id));
  }, [filteredCanyons, favoritesOnly, favoriteIds]);

  return (
    <section className="home">
      <h1 className="page-title">Barrancos destacados</h1>
      <p className="page-subtitle">
        Consulta las reseñas rápidas y prepara tu descenso con confianza.
      </p>
      <div className="search-wrapper">
        <label htmlFor="search" className="sr-only">
          Busca por nombre o dificultad
        </label>
        <input
          id="search"
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar por nombre o dificultad..."
          className="search-input"
        />
      </div>
      <div className="filters">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={favoritesOnly}
            onChange={(event) => setFavoritesOnly(event.target.checked)}
          />
          Mostrar solo favoritos
        </label>
      </div>
      {visibleCanyons.length > 0 ? (
        <ul className="canyon-list">
          {visibleCanyons.map((canyon) => (
            <li key={canyon.id} className="canyon-item">
              <div className="canyon-meta">
                <h2 className="canyon-name">{canyon.name}</h2>
                <span className="canyon-difficulty">Dificultad: {canyon.difficulty}</span>
                <p className="canyon-summary">{canyon.summary}</p>
              </div>
              <div className="canyon-actions">
                <Link to={`/barranco/${canyon.id}`} className="canyon-link">
                  Ver ficha
                </Link>
                <a
                  href={canyon.wikiloc.approach}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="canyon-link external"
                >
                  Aproximación
                </a>
                <a
                  href={canyon.wikiloc.return}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="canyon-link external"
                >
                  Retorno
                </a>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-results">No encontramos resultados. Ajusta tu búsqueda o revisa el listado completo.</p>
      )}
    </section>
  );
}

export default Home;
