import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import BarrancoDetail from './pages/BarrancoDetail.jsx';
import Checklist from './pages/Checklist.jsx';
import Cursos from './pages/Cursos.jsx';
import Concentraciones from './pages/Concentraciones.jsx';
import Blog from './pages/Blog.jsx';
import BlogArticlePlanificacion from './pages/BlogArticlePlanificacion.jsx';
import ConcentracionPirineos from './pages/ConcentracionPirineos.jsx';
import useLocalStorage from './hooks/useLocalStorage.js';

// Application shell with simple navigation bar and routed pages.
function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useLocalStorage('canyon-search', '');

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen((open) => !open);
  };

  useEffect(() => {
    const syncFromEvent = (event) => {
      if (typeof event.detail === 'string') {
        setGlobalSearch(event.detail);
      }
    };
    window.addEventListener('canyon-search-update', syncFromEvent);
    return () => {
      window.removeEventListener('canyon-search-update', syncFromEvent);
    };
  }, [setGlobalSearch]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand" onClick={closeMenu}>
          Barranquismo
        </Link>
        <button type="button" className="menu-toggle" onClick={toggleMenu} aria-expanded={isMenuOpen}>
          <span className="sr-only">Abrir menú</span>
          <span className="menu-bar" />
          <span className="menu-bar" />
          <span className="menu-bar" />
        </button>
        <nav className={`main-nav${isMenuOpen ? ' is-open' : ''}`}>
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={closeMenu}
          >
            Barrancos
          </NavLink>
          <NavLink
            to="/cursos"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={closeMenu}
          >
            Cursos
          </NavLink>
          <NavLink
            to="/concentraciones"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={closeMenu}
          >
            Concentraciones
          </NavLink>
          <NavLink
            to="/blog"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={closeMenu}
          >
            Blog
          </NavLink>
          <NavLink
            to="/checklist"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={closeMenu}
          >
            Checklist
          </NavLink>
        </nav>
      </header>
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Explora barrancos, forma tu equipo y planifica el descenso</h1>
          <p className="hero-subtitle">
            Recursos para barranquistas: reseñas actualizadas, cursos, concentraciones y material necesario.
          </p>
        </div>
        <div className="hero-search">
          <label htmlFor="global-search" className="sr-only">
            Buscar barrancos o contenidos
          </label>
          <input
            id="global-search"
            type="search"
            value={globalSearch}
            onChange={(event) => {
              const value = event.target.value;
              setGlobalSearch(value);
              window.dispatchEvent(new CustomEvent('canyon-search-update', { detail: value }));
            }}
            placeholder="Busca barrancos, cursos o artículos..."
            className="hero-input"
          />
        </div>
      </section>
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/barranco/:id" element={<BarrancoDetail />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/concentraciones" element={<Concentraciones />} />
          <Route path="/concentraciones/pirineos-canyon-2024" element={<ConcentracionPirineos />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/planificacion-segura" element={<BlogArticlePlanificacion />} />
          <Route path="/checklist" element={<Checklist />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <small>Modo offline disponible tras la primera visita.</small>
      </footer>
    </div>
  );
}

export default App;
