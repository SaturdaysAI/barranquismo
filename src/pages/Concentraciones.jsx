import { Link } from 'react-router-dom';

const UPCOMING_MEETUPS = [
  {
    id: 'pirineos-canyon-2024',
    title: 'Pirineos Canyon 2024',
    location: 'Boltaña, Sobrarbe (Huesca)',
    date: '7-9 junio 2024',
    description:
      'Encuentro de barranquismo con talleres técnicos, charlas, exposición de material, gymkana en la Gorga y cena con sorteo en el Palacio de Congresos.',
    link: '/concentraciones/pirineos-canyon-2024'
  },
  {
    id: 'sobrarbe-2026',
    title: 'Encuentro Sobrarbe 2026',
    location: 'Ainsa, Huesca',
    date: '18-21 julio 2026',
    description: 'Rutas guiadas, charlas de seguridad y test de material técnico.'
  },
  {
    id: 'costa-blanca-primavera',
    title: 'Quedada primavera Costa Blanca',
    location: 'Callosa d\'En Sarrià, Alicante',
    date: '1-3 mayo 2026',
    description: 'Descensos progresivos para todos los niveles y talleres exprés de autorescate.'
  }
];

// Concentraciones showcases upcoming canyoning meetups and community gatherings.
function Concentraciones() {
  return (
    <section className="page meetups">
      <header className="page-heading">
        <h1 className="page-title">Concentraciones y quedadas</h1>
        <p className="page-subtitle">
          Mantente al día de los encuentros de la comunidad barranquista y comparte los tuyos.
        </p>
      </header>
      <ul className="card-list">
        {UPCOMING_MEETUPS.map((meetup) => (
          <li key={meetup.id} className="info-card">
            <h2 className="card-title">{meetup.title}</h2>
            <p className="card-meta">{meetup.location}</p>
            <p className="card-date">{meetup.date}</p>
            <p className="card-description">{meetup.description}</p>
            {meetup.link ? (
              <Link className="canyon-link" to={meetup.link}>
                Ver detalles
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
      <footer className="page-footer">
        <p>Actualiza esta sección con los eventos confirmados desde tus datos locales.</p>
      </footer>
    </section>
  );
}

export default Concentraciones;
