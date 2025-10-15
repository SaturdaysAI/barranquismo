import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import BarrancoDetail from './pages/BarrancoDetail.jsx';
import Checklist from './pages/Checklist.jsx';

// Application shell with simple navigation bar and routed pages.
function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          Canyoning Guide
        </Link>
        <nav className="main-nav">
          <Link to="/" className="nav-link">
            Inicio
          </Link>
          <Link to="/checklist" className="nav-link">
            Checklist
          </Link>
        </nav>
      </header>
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/barranco/:id" element={<BarrancoDetail />} />
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
