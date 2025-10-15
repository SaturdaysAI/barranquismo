const FEATURED_ARTICLES = [
  {
    id: 'planificacion-segura',
    title: 'Planificación segura de un descenso complejo',
    summary: 'Checklist mental para evaluar caudal, escapes y material antes de entrar al cañón.',
    url: 'https://example.com/blog/planificacion-segura'
  },
  {
    id: 'material-2026',
    title: 'Material imprescindible para la temporada 2026',
    summary: 'Comparativa de neoprenos, escarpines y sacas estancas con recomendaciones por nivel.',
    url: 'https://example.com/blog/material-2026'
  },
  {
    id: 'rescate-rapido',
    title: 'Maniobras de rescate rápido en pozas activas',
    summary: 'Tres maniobras básicas para evacuar a un compañero atrapado en rebufos.',
    url: 'https://example.com/blog/rescate-rapido'
  }
];

// Blog page curates external reading to keep users engaged while offline content loads.
function Blog() {
  return (
    <section className="page blog">
      <header className="page-heading">
        <h1 className="page-title">Blog y recursos</h1>
        <p className="page-subtitle">
          Lecturas recomendadas sobre técnica, material y seguridad. Sustituye los enlaces por tus
          artículos o podcasts favoritos cuando los tengas listos.
        </p>
      </header>
      <ul className="card-list">
        {FEATURED_ARTICLES.map((article) => (
          <li key={article.id} className="info-card">
            <h2 className="card-title">{article.title}</h2>
            <p className="card-description">{article.summary}</p>
            <a
              className="canyon-link external"
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Leer artículo
            </a>
          </li>
        ))}
      </ul>
      <footer className="page-footer">
        <p>
          ¿Quieres compartir tus historias? Añade nuevas entradas en este módulo o enlaza tu sitio
          externo.
        </p>
      </footer>
    </section>
  );
}

export default Blog;
