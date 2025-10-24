import { Link } from 'react-router-dom';

const HERO_IMAGE = {
  src: 'https://images.unsplash.com/photo-1445363692815-ebcd599f7621?auto=format&fit=crop&w=1200&q=80',
  alt: 'Barranquista descendiendo una cascada en rapel con abundante caudal.',
  caption: 'Foto de Tommy Lisbin vía Unsplash.'
};

const ARTICLE_SECTIONS = [
  {
    heading: 'Analiza normativa y logística de acceso',
    body: [
      'Antes de elegir un cañón confirma que el descenso está abierto en las fechas deseadas y revisa si necesitas autorización previa. Fuentes como los boletines de montanasegura.com y las webs de cada parque natural recopilan cierres, cupos y recomendaciones específicas por temporada.',
      'Comprueba los tiempos de aproximación y retorno, así como los escapes intermedios. Programa un plan B cercano por si al llegar al cauce detectas un caudal fuera de rango o algún impedimento inesperado.'
    ]
  },
  {
    heading: 'Evalúa caudal y meteorología con margen',
    body: [
      'Cruza la información de las estaciones hidrológicas, la predicción de lluvias y las observaciones recientes de otros equipos. Un frente frío, aunque parezca alejado, puede disparar el caudal en pocas horas: solo entra si cuentas con margen suficiente y todos los integrantes entienden las implicaciones.',
      'Durante la aproximación realiza microevaluaciones: analiza la temperatura del agua, escucha el rumor del cañón y revisa si hay espumas o arrastres en la superficie. Si algo no cuadra, da media vuelta y aplica el plan alternativo.'
    ]
  },
  {
    heading: 'Material redundante y roles claros',
    body: [
      'Además del equipo personal mínimo —neopreno integral, casco, arnés específico y descensor homologado— reparte material colectivo redundante: cuerda de repuesto, kit de instalación, bloqueadores y cordinos auxiliares. Un botiquín compacto, manta térmica y un medio de comunicación protegido del agua son imprescindibles.',
      'Define quién lidera las instalaciones, quién controla la progresión del grupo y quién gestiona la comunicación externa. Practicar los montajes de pasamanos, rapeles guiados y auto-rescate en seco reduce el tiempo de reacción cuando surge un contratiempo real.'
    ]
  },
  {
    heading: 'Plan de comunicación y emergencias',
    body: [
      'Comparte la hora estimada de salida y retorno con una persona de confianza y acuerda un protocolo: a qué hora avisar al 112 si no hay noticias y qué información debe facilitar. Lleva anotadas las coordenadas de puntos clave, los teléfonos de rescate autonómicos y el parte sanitario básico por si surge un incidente.',
      'En el interior del barranco utilizad señales claras (voz, silbato y gestual) y evitad gritar innecesariamente para no confundir mensajes. Estableced paradas regulares para valorar energía, temperatura y motivación del grupo.'
    ]
  },
  {
    heading: 'Respeto ambiental y sostenibilidad',
    body: [
      'Reduce el tamaño de los grupos para minimizar impactos sobre flora, fauna y suelos en las aproximaciones. Evita el contacto innecesario con la roca y no dejes residuos: todo sale contigo, incluidos restos de comida o cinta vieja.',
      'Opta por empresas locales para transporte, alojamiento y guías cuando necesites apoyo profesional. Es la mejor manera de redistribuir el beneficio del turismo activo y de encontrar información fresca sobre restricciones medioambientales.'
    ]
  }
];

const ARTICLE_CHECKLIST = [
  'Verifica permisos, aforos y alternativas antes de salir de casa.',
  'Confirma caudal y meteorología la víspera y una última vez en el punto de acceso.',
  'Distribuye material colectivo y cuerdas de forma redundante.',
  'Acuerda señales de comunicación, tiempos de control y protocolo de emergencia.',
  'Recoge todo rastro al terminar y comparte un parte del estado del barranco con la comunidad.'
];

const ARTICLE_RESOURCES = [
  {
    label: 'Principales medidas de seguridad en el descenso de barrancos (El Periódico Digital)',
    url: 'https://www.elperiodico.digital/turismo/descenso-de-barrancos-principales-medidas-de-seguridad-a-tener-en-cuenta-24725.html'
  },
  {
    label: 'Guías y avisos de seguridad en barrancos de Aragón (Montaña Segura)',
    url: 'https://montanasegura.com/barrancos-2/'
  },
  {
    label: 'Consejos para un barranquismo seguro y respetuoso (Go Aragón)',
    url: 'https://www.goaragon.es/consejos-barraquismo-seguro-descenso-de-barrancos-4-pasos-para-una-actividad-segura-y-respetuosa-con-el-medio-ambiente/'
  }
];

function BlogArticlePlanificacion() {
  return (
    <section className="page blog">
      <header className="page-heading">
        <h1 className="page-title">Planificación segura de un descenso de barranco</h1>
        <p className="page-subtitle">
          Cómo preparar cada detalle para disfrutar del barranquismo con seguridad, desde la meteo
          hasta el material colectivo.
        </p>
      </header>
      <article className="info-card">
        <p className="card-description">
          Antes de encordarse y saltar a la primera poza conviene dedicar tiempo a planificar. Un
          descenso fluido empieza mucho antes de llegar al parking: analizar normativa, estudiar el
          caudal, preparar el equipo y alinear al grupo son la mejor inversión en seguridad.
        </p>
        <figure className="article-figure">
          <img src={HERO_IMAGE.src} alt={HERO_IMAGE.alt} loading="lazy" />
          <figcaption>{HERO_IMAGE.caption}</figcaption>
        </figure>
        {ARTICLE_SECTIONS.map((section) => (
          <section key={section.heading} className="article-section">
            <h2>{section.heading}</h2>
            {section.body.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </section>
        ))}
        <section className="article-section">
          <h2>Checklist rápido</h2>
          <ul>
            {ARTICLE_CHECKLIST.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="article-section">
          <h2>Para profundizar</h2>
          <p>
            Estos recursos amplían los protocolos de seguridad y ofrecen actualizaciones regulares
            sobre normativa y buenas prácticas:
          </p>
          <ul>
            {ARTICLE_RESOURCES.map((resource) => (
              <li key={resource.url}>
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  {resource.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </article>
      <Link to="/blog" className="canyon-link ghost">
        Regresar al blog
      </Link>
    </section>
  );
}

export default BlogArticlePlanificacion;
