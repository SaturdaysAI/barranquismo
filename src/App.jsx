import { useState } from 'react';
import { Routes, Route, NavLink, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import BarrancoDetail from './pages/BarrancoDetail.jsx';
import Checklist from './pages/Checklist.jsx';
import Cursos from './pages/Cursos.jsx';
import Concentraciones from './pages/Concentraciones.jsx';
import Blog from './pages/Blog.jsx';

// Application shell with simple navigation bar and routed pages.
function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen((open) => !open);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand" onClick={closeMenu}>
          Canyoning Guide
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
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/barranco/:id" element={<BarrancoDetail />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/concentraciones" element={<Concentraciones />} />
          <Route path="/blog" element={<Blog />} />
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
