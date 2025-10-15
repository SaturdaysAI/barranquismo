import { useParams, Link } from 'react-router-dom';
import canyons from '../data/canyons.seed.json';

// Detail page locates the requested canyon and shows extended information.
function BarrancoDetail() {
  const { id } = useParams();
  const canyon = canyons.find((item) => item.id === id);

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

  return (
    <article className="detail">
      <h1 className="page-title">{canyon.name}</h1>
      <p className="detail-difficulty">Dificultad: {canyon.difficulty}</p>
      <p className="detail-description">{canyon.description}</p>
      <section className="detail-links">
        <h2>Enlaces útiles</h2>
        <ul>
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
      </section>
      <section className="detail-material">
        <h2>Material recomendado</h2>
        <ul>
          {canyon.gear.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <Link to="/" className="canyon-link back">
        Volver al listado
      </Link>
    </article>
  );
}

export default BarrancoDetail;
