import { Link } from 'react-router-dom';

const FEATURED_COURSES = [
  {
    id: 'td2-barrancos-sputnik',
    title: 'Grado Medio TD2 Barrancos',
    provider: 'Sputnik Climbing',
    level: 'Título oficial TD2',
    date: 'Convocatorias anuales',
    summary:
      'Programa oficial para técnicos deportivos de barrancos que cubre planificación, seguridad, autorrescate y dirección de grupos en todo tipo de descensos.',
    url: 'https://sputnikclimbing.com/formacion/tecnicos-deportivos-montana/td2-grado-medio-tecnico-deportivo-barrancos/'
  },
  {
    id: 'curso-autoproteccion',
    title: 'Autoprotección y rescate en cañones',
    provider: 'Guías Alto Aragón',
    level: 'Nivel intermedio',
    date: 'Mayo 2026',
    url: 'https://example.com/cursos/autoproteccion'
  }
];

// Cursos shares upcoming training opportunities for canyoning practitioners.
function Cursos() {
  return (
    <section className="page courses">
      <header className="page-heading">
        <h1 className="page-title">Cursos de barranquismo</h1>
        <p className="page-subtitle">
          Formación recomendada para progresar con seguridad. Añade tus propuestas o
          actualiza enlaces desde los datos locales más adelante.
        </p>
      </header>
      <ul className="card-list">
        {FEATURED_COURSES.map((course) => (
          <li key={course.id} className="info-card">
            <h2 className="card-title">{course.title}</h2>
            <p className="card-meta">
              {course.provider} · {course.level}
            </p>
            <p className="card-date">Próxima edición: {course.date}</p>
            {course.summary && <p className="card-description">{course.summary}</p>}
            <a
              className="canyon-link external"
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Detalles e inscripción
            </a>
          </li>
        ))}
      </ul>
      <footer className="page-footer">
        <p>
          ¿Organizas un curso?{' '}
          <Link to="/checklist" className="inline-link">
            Añade tu checklist de material para los asistentes
          </Link>
          .
        </p>
      </footer>
    </section>
  );
}

export default Cursos;
