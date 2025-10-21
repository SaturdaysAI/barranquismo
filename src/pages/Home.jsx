import { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage.js';
import StarRating from '../components/StarRating.jsx';
import canyons from '../data/canyons.js';

// Home lists the available canyons with quick access to detail pages.
function Home() {
  const [searchTerm, setSearchTerm] = useLocalStorage('canyon-search', '');
  const [favoriteIds] = useLocalStorage('favorite-canyons', []);
  const [favoritesOnly, setFavoritesOnly] = useLocalStorage('show-only-favorites', false);
  const [selectedZone, setSelectedZone] = useLocalStorage('canyon-zone-filter', 'all');
  const [selectedVertical, setSelectedVertical] = useLocalStorage('canyon-vertical-filter', 'all');
  const [selectedAquatic, setSelectedAquatic] = useLocalStorage('canyon-aquatic-filter', 'all');
  const [maxRappelFilter, setMaxRappelFilter] = useLocalStorage('canyon-max-rappel-filter', '');
  const [userRatings] = useLocalStorage('user-canyon-ratings', {});

  useEffect(() => {
    const handleSync = (event) => {
      if (typeof event.detail === 'string') {
        setSearchTerm(event.detail);
      }
    };
    window.addEventListener('canyon-search-update', handleSync);
    return () => {
      window.removeEventListener('canyon-search-update', handleSync);
    };
  }, [setSearchTerm]);

  const numberFormatter = useMemo(() => new Intl.NumberFormat('es-ES'), []);

  const zoneOptions = useMemo(() => {
    const zones = new Set();
    const disallowedZones = new Set(['desconocido', 'desconocida', 'sin datos', 'unknown']);
    canyons.forEach((canyon) => {
      const zoneCandidate = canyon.location?.region ?? canyon.location?.province ?? canyon.location?.country ?? null;
      if (!zoneCandidate) {
        return;
      }
      const trimmed = zoneCandidate.trim();
      if (!trimmed) {
        return;
      }
      const normalized = trimmed.toLowerCase();
      if (disallowedZones.has(normalized)) {
        return;
      }
      zones.add(trimmed);
    });
    return Array.from(zones).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, []);

  const verticalOptions = useMemo(() => {
    const baseLevels = Array.from({ length: 8 }, (_, index) => `V${index}`);
    const levels = new Set(baseLevels);
    canyons.forEach((canyon) => {
      if (typeof canyon.difficultyVertical === 'string' && canyon.difficultyVertical.startsWith('V')) {
        levels.add(canyon.difficultyVertical);
      }
    });
    const parseValue = (value) => {
      const match = value.match(/V(\d+(?:\.\d+)?)/i);
      return match ? Number.parseFloat(match[1]) : Number.NaN;
    };
    return Array.from(levels)
      .filter((value) => /^V\d+(?:\.\d+)?$/i.test(value))
      .sort((a, b) => {
        const aValue = parseValue(a);
        const bValue = parseValue(b);
        if (Number.isFinite(aValue) && Number.isFinite(bValue) && aValue !== bValue) {
          return aValue - bValue;
        }
        return a.localeCompare(b, 'es', { sensitivity: 'base' });
      });
  }, []);

  const aquaticOptions = useMemo(() => {
    const baseLevels = Array.from({ length: 8 }, (_, index) => `A${index}`);
    const levels = new Set(baseLevels);
    canyons.forEach((canyon) => {
      if (typeof canyon.difficultyAquatic === 'string' && canyon.difficultyAquatic.startsWith('A')) {
        levels.add(canyon.difficultyAquatic);
      }
    });
    const parseValue = (value) => {
      const match = value.match(/A(\d+(?:\.\d+)?)/i);
      return match ? Number.parseFloat(match[1]) : Number.NaN;
    };
    return Array.from(levels)
      .filter((value) => /^A\d+(?:\.\d+)?$/i.test(value))
      .sort((a, b) => {
        const aValue = parseValue(a);
        const bValue = parseValue(b);
        if (Number.isFinite(aValue) && Number.isFinite(bValue) && aValue !== bValue) {
          return aValue - bValue;
        }
        return a.localeCompare(b, 'es', { sensitivity: 'base' });
      });
  }, []);

  const filteredCanyons = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    const parsedMaxRappel = Number.parseFloat(maxRappelFilter.replace(',', '.'));
    const hasMaxRappelFilter = Number.isFinite(parsedMaxRappel);
    return canyons.filter((canyon) => {
      const name = canyon.name ?? '';
      const difficulty = canyon.difficulty ?? '';
      const difficultyVertical = canyon.difficultyVertical ?? '';
      const difficultyAquatic = canyon.difficultyAquatic ?? '';
      const locationParts = [
        canyon.location?.text,
        canyon.location?.region,
        canyon.location?.province,
        canyon.location?.country,
      ].filter(Boolean);
      const matchesSearch = normalizedTerm
        ? [name, difficulty, difficultyVertical, difficultyAquatic, ...locationParts]
            .map((value) => value.toLowerCase())
            .some((value) => value.includes(normalizedTerm))
        : true;

      const canyonZone = canyon.location?.region ?? canyon.location?.province ?? canyon.location?.country ?? null;
      const matchesZone = selectedZone === 'all' || (canyonZone !== null && canyonZone === selectedZone);
      const matchesVertical = selectedVertical === 'all' || canyon.difficultyVertical === selectedVertical;
      const matchesAquatic = selectedAquatic === 'all' || canyon.difficultyAquatic === selectedAquatic;
      const matchesMaxRappel = !hasMaxRappelFilter
        ? true
        : typeof canyon.maxRappelMeters === 'number' && Number.isFinite(canyon.maxRappelMeters)
        ? canyon.maxRappelMeters <= parsedMaxRappel
        : false;

      return matchesSearch && matchesZone && matchesVertical && matchesAquatic && matchesMaxRappel;
    });
  }, [searchTerm, selectedZone, selectedVertical, selectedAquatic, maxRappelFilter]);

  const visibleCanyons = useMemo(() => {
    if (!favoritesOnly) {
      return filteredCanyons;
    }
    return filteredCanyons.filter((canyon) => favoriteIds.includes(canyon.id));
  }, [filteredCanyons, favoritesOnly, favoriteIds]);

  const totalCount = canyons.length;
  const resultsCount = visibleCanyons.length;
  const formattedTotal = numberFormatter.format(totalCount);
  const formattedResults = numberFormatter.format(resultsCount);
  const hasActiveFilters =
    Boolean(searchTerm) ||
    favoritesOnly ||
    selectedZone !== 'all' ||
    selectedVertical !== 'all' ||
    selectedAquatic !== 'all' ||
    maxRappelFilter.trim() !== '';

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    window.dispatchEvent(new CustomEvent('canyon-search-update', { detail: value }));
  };

  const handleResetFilters = () => {
    if (searchTerm) {
      setSearchTerm('');
      window.dispatchEvent(new CustomEvent('canyon-search-update', { detail: '' }));
    }
    if (favoritesOnly) {
      setFavoritesOnly(false);
    }
    if (selectedZone !== 'all') {
      setSelectedZone('all');
    }
    if (selectedVertical !== 'all') {
      setSelectedVertical('all');
    }
    if (selectedAquatic !== 'all') {
      setSelectedAquatic('all');
    }
    if (maxRappelFilter.trim() !== '') {
      setMaxRappelFilter('');
    }
  };

  const computeRatingData = (canyon) => {
    const baseVotes = typeof canyon.ratingVotes === 'number' ? canyon.ratingVotes : 0;
    const baseAverage = typeof canyon.ratingAverage === 'number' ? canyon.ratingAverage : null;
    const userRatingValue =
      userRatings && typeof userRatings === 'object' && typeof userRatings[canyon.id] === 'number'
        ? Math.max(1, Math.min(5, userRatings[canyon.id]))
        : null;
    const votes = baseVotes + (userRatingValue ? 1 : 0);
    const totalScore = (baseAverage ?? 0) * baseVotes + (userRatingValue ?? 0);
    const average = votes > 0 ? totalScore / votes : 0;
    return {
      average,
      votes,
      userRating: userRatingValue,
    };
  };

  return (
    <section className="home">
      <header className="home-hero">
        <div className="home-hero__text">
          <h1 className="page-title">Barrancos destacados</h1>
          <p className="page-subtitle">
            Encuentra el descenso ideal, revisa la logística y guarda tus favoritos para el próximo viaje.
          </p>
        </div>
        <div className="home-hero__search" role="search">
          <label htmlFor="search" className="sr-only">
            Buscar por nombre
          </label>
          <input
            id="search"
            type="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar por nombre"
            className="home-hero__input"
            autoComplete="off"
          />
        </div>
      </header>

      <div className="home-toolbar" aria-live="polite">
        <div className="home-toolbar__filters">
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(event) => setFavoritesOnly(event.target.checked)}
            />
            Mostrar solo favoritos
          </label>
          <label className="filter-select" htmlFor="zone-filter">
            <span>Zona</span>
            <select
              id="zone-filter"
              value={selectedZone}
              onChange={(event) => setSelectedZone(event.target.value)}
            >
              <option value="all">Todas las zonas</option>
              {zoneOptions.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-select" htmlFor="vertical-filter">
            <span>V</span>
            <select
              id="vertical-filter"
              value={selectedVertical}
              onChange={(event) => setSelectedVertical(event.target.value)}
            >
              <option value="all">Todas</option>
              {verticalOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-select" htmlFor="aquatic-filter">
            <span>A</span>
            <select
              id="aquatic-filter"
              value={selectedAquatic}
              onChange={(event) => setSelectedAquatic(event.target.value)}
            >
              <option value="all">Todas</option>
              {aquaticOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-input" htmlFor="max-rappel-filter">
            <span>Rápel máx ≤</span>
            <input
              id="max-rappel-filter"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              placeholder="metros"
              value={maxRappelFilter}
              onChange={(event) => setMaxRappelFilter(event.target.value)}
            />
          </label>
          <span className="results-pill">
            Mostrando {formattedResults} de {formattedTotal} barrancos
          </span>
        </div>
        {hasActiveFilters && (
          <button type="button" className="toolbar-reset" onClick={handleResetFilters}>
            Limpiar filtros
          </button>
        )}
      </div>

      {visibleCanyons.length > 0 ? (
        <ul className="canyon-list">
          {visibleCanyons.map((canyon) => {
            const ratingData = computeRatingData(canyon);
            const averageText = ratingData.votes > 0 ? ratingData.average.toFixed(1) : 'Sin valoraciones';
            return (
              <li key={canyon.id} className="canyon-card">
              <div className="canyon-card__header">
                <div className="canyon-card__title">
                  <h2 className="canyon-name">{canyon.name}</h2>
                  {canyon.difficulty && (
                    <span className="badge badge-difficulty" aria-label={`Dificultad ${canyon.difficulty}`}>
                      {canyon.difficulty}
                    </span>
                  )}
                </div>
                {favoriteIds.includes(canyon.id) && <span className="badge badge-favorite">Favorito</span>}
              </div>

              <div className="canyon-card__rating" aria-label={`Valoración media ${averageText}`}>
                <StarRating value={ratingData.average} size="small" label={`Valoración media de ${canyon.name}`} />
                <span>{ratingData.votes > 0 ? `${ratingData.average.toFixed(1)} · ${ratingData.votes} valoraciones` : 'Sin valoraciones'}</span>
              </div>

              {canyon.location?.text && (
                <div className="canyon-card__meta" aria-label="Localización">
                  {canyon.location.text
                    .split(',')
                    .map((segment) => segment.trim())
                    .filter(Boolean)
                    .map((segment, index) => (
                      <span className="meta-chip" key={`${canyon.id}-loc-${index}`}>
                        {segment}
                      </span>
                    ))}
                </div>
              )}

              {canyon.summary && <p className="canyon-card__summary">{canyon.summary}</p>}

              <div className="canyon-card__footer">
                <Link to={`/barranco/${canyon.id}`} className="canyon-link primary">
                  Ver ficha
                </Link>
                {canyon.wikiloc?.approach && (
                  <a
                    href={canyon.wikiloc.approach}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="canyon-link tertiary"
                  >
                    Aproximación
                  </a>
                )}
                {canyon.wikiloc?.return && (
                  <a
                    href={canyon.wikiloc.return}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="canyon-link tertiary"
                  >
                    Retorno
                  </a>
                )}
                {canyon.wikiloc_search_url && (
                  <a
                    href={canyon.wikiloc_search_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="canyon-link ghost"
                  >
                    Ver mapa Wikiloc
                  </a>
                )}
              </div>
            </li>
            );
          })}
        </ul>
      ) : (
        <p className="no-results">No encontramos resultados. Ajusta tu búsqueda o revisa el listado completo.</p>
      )}
    </section>
  );
}

export default Home;
