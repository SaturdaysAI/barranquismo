import { Link } from 'react-router-dom';
import canyons from '../data/canyons.seed.json';

// Home lists the available canyons with quick access to detail pages.
function Home() {
  return (
    <section className="home">
      <h1 className="page-title">Barrancos destacados</h1>
      <p className="page-subtitle">
        Consulta las reseñas rápidas y prepara tu descenso con confianza.
      </p>
      <ul className="canyon-list">
        {canyons.map((canyon) => (
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
    </section>
  );
}

export default Home;
