import { Link } from 'react-router-dom';

const HERO_IMAGE = {
  src: `${import.meta.env.BASE_URL}images/pirineos-canyon-2024-poster.jpg`,
  alt: 'Cartel oficial del encuentro Pirineos Canyon 2024 con un barranquista en una cascada.',
  caption: 'Cartel oficial del evento · Pirineos Canyon 2024.'
};

const PROGRAM = [
  {
    day: 'Viernes 7 de junio',
    highlights: [
      'Apertura del Palacio de Congresos a mediodía y entrega de credenciales en varios turnos.',
      'Exposición de camisetas históricas de encuentros y muestra de material técnico de fabricantes colaboradores.',
      'Presentación oficial de Pirineos Canyon 2024 y recordatorio del código de buenas prácticas ambientales para el descenso de barrancos.',
      'Cierre de la jornada a las 21:00 con el recinto preparado para el sábado.'
    ]
  },
  {
    day: 'Sábado 8 de junio',
    highlights: [
      'Inicio temprano con talleres técnicos impartidos por Barrankisme (instalaciones en cabecera, auto-socorro y técnicas de equipamiento).',
      'Charla de primeros auxilios para barranquistas a media mañana y gymkana con premios en la Gorga de Boltaña.',
      'Reapertura vespertina para presentaciones, incluida la nueva guía "Cañones y barrancos de la Bal de Chistau".',
      'Charla sobre seguridad jurídica y operativa en barrancos, cena de participantes en el Polideportivo Teresa Palacios, sorteo de material y concierto de Koartada.'
    ]
  },
  {
    day: 'Domingo 9 de junio',
    highlights: [
      'Continuación de los talleres técnicos en el polideportivo desde primera hora.',
      'Apertura del punto informativo del Palacio de Congresos con datos actualizados de caudales y reseñas.',
      'Clausura oficial a las 13:30 con foto de familia y cierre de instalaciones.'
    ]
  }
];

const LOCATIONS = [
  {
    name: 'Palacio de Congresos de Boltaña',
    address: 'Avda. Luis Fatás 26, 22340 Boltaña (Huesca)'
  },
  {
    name: 'Polideportivo Teresa Palacios',
    address: 'Calle Samper 19, 22340 Boltaña (Huesca)'
  },
  {
    name: 'La Gorga de Boltaña',
    address: 'Avenida Ordesa, 22340 Boltaña (Huesca)'
  }
];

const CONTACTS = [
  'Belén Lozano · +34 660 506 021',
  'Mauricio Robledo · +34 648 294 110',
  'pirineoscanyon@gmail.com'
];

const RESOURCES = [
  {
    label: 'Programa completo en PDF',
    url: 'https://drive.google.com/file/d/1u0mFQBvuK2dH6LBUHRgtAdVWdjAtMM8b/view'
  },
  {
    label: 'Inscripciones (Club Atlético Sobrarbe)',
    url: 'https://clubcas.com/pirineos-canyon-2024-7-8-y-9-de-junio-de-2024/'
  },
  {
    label: 'Cursos complementarios de Barrankisme',
    url: 'https://barrankisme.com/formacion-pirineos-canyons/'
  }
];

function ConcentracionPirineos() {
  return (
    <section className="page meetups">
      <header className="page-heading">
        <h1 className="page-title">Pirineos Canyon 2024</h1>
        <p className="page-subtitle">
          Encuentro de barranquismo en Boltaña con más de 300 participantes, talleres técnicos,
          charlas especializadas y actividades sociales durante tres días.
        </p>
      </header>
      <article className="info-card">
        <figure className="article-figure">
          <img src={HERO_IMAGE.src} alt={HERO_IMAGE.alt} loading="lazy" />
          <figcaption>{HERO_IMAGE.caption}</figcaption>
        </figure>
        <section className="article-section">
          <h2>Qué esperar del evento</h2>
          <p>
            El encuentro, organizado por el Club de Montaña Nabaín y el Club Atlético Sobrarbe, reúne
            a deportistas de toda la península para compartir descensos, formación y convivencia. El
            Palacio de Congresos acogerá la zona expositiva, el punto de información de caudales y las
            charlas, mientras que el polideportivo y la Gorga de Boltaña serán escenarios de talleres y
            actividades lúdicas.
          </p>
          <p>
            Durante los tres días se fomentará un barranquismo responsable: se repasará el código de
            buenas prácticas ambientales, se ofrecerán consejos actualizados de seguridad y se
            facilitará información sobre los caudales de la comarca para que cada grupo diseñe sus
            salidas con criterio.
          </p>
        </section>
        <section className="article-section">
          <h2>Programa resumido</h2>
          {PROGRAM.map((slot) => (
            <div key={slot.day} className="article-subsection">
              <h3>{slot.day}</h3>
              <ul>
                {slot.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
        <section className="article-section">
          <h2>Servicios y talleres</h2>
          <p>
            Además de los talleres técnicos impartidos por Barrankisme, el evento incluye una
            exposición permanente de material, asesoramiento sobre caudales, descuentos en Tirolina
            Ordesa Pirineo y cursos complementarios para quienes deseen profundizar en las maniobras de
            rescate. La cena oficial del sábado sirve como punto de encuentro para el sorteo de material
            y el concierto de Koartada.
          </p>
          <p>
            Los asistentes pueden organizar descensos libres durante el día. El punto informativo del
            Palacio detallará qué cañones están en mejor estado y recordará las recomendaciones de
            seguridad antes de cada salida.
          </p>
        </section>
        <section className="article-section">
          <h2>Inscripciones y políticas</h2>
          <p>
            Las plazas se gestionan en la web del Club Atlético Sobrarbe. A partir del 24 de mayo no se
            realizan devoluciones, aunque se guardará la bolsa del participante para recogida
            autorizada. Las cancelaciones anteriores a esa fecha recuperan el 50% del importe (menos 1€
            de gestión) y los cambios de talla de camiseta quedan sujetos al stock disponible.
          </p>
          <p>
            No se aceptan traspasos de plaza sin autorización expresa de la organización. Recuerda
            revisar la guía de normas de conducta: el evento se reserva el derecho de admisión ante
            comportamientos inadecuados.
          </p>
        </section>
        <section className="article-section">
          <h2>Ubicaciones clave</h2>
          <ul>
            {LOCATIONS.map((location) => (
              <li key={location.name}>
                <strong>{location.name}:</strong> {location.address}
              </li>
            ))}
          </ul>
        </section>
        <section className="article-section">
          <h2>Contacto</h2>
          <ul>
            {CONTACTS.map((contact) => (
              <li key={contact}>{contact}</li>
            ))}
          </ul>
        </section>
        <section className="article-section">
          <h2>Enlaces útiles</h2>
          <ul>
            {RESOURCES.map((resource) => (
              <li key={resource.url}>
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  {resource.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </article>
      <Link to="/concentraciones" className="canyon-link ghost">
        Volver a concentraciones
      </Link>
    </section>
  );
}

export default ConcentracionPirineos;
