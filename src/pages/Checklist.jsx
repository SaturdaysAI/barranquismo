import { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';

const DEFAULT_ITEMS = [
  { label: 'Neoprene suit', checked: false },
  { label: 'Helmet', checked: false },
  { label: 'Harness and descender', checked: false },
  { label: 'Rope (2x length of longest rappel)', checked: false },
  { label: 'Dry bag with essentials', checked: false }
];

// Checklist allows users to tick essential gear and persists the selection locally.
function Checklist() {
  const [savedItems, setSavedItems] = useLocalStorage('gear-checklist', DEFAULT_ITEMS);
  const [items, setItems] = useState(() => savedItems.map((item) => ({ ...item })));

  useEffect(() => {
    setItems(savedItems.map((item) => ({ ...item })));
  }, [savedItems]);

  const toggleItem = (label) => {
    setItems((prev) =>
      prev.map((entry) =>
        entry.label === label ? { ...entry, checked: !entry.checked } : entry
      )
    );
  };

  const handleSave = () => {
    setSavedItems(items);
  };

  const handleReset = () => {
    const resetItems = DEFAULT_ITEMS.map((item) => ({ ...item }));
    setItems(resetItems);
    setSavedItems(resetItems);
  };

  return (
    <section className="checklist">
      <h1 className="page-title">Checklist de material</h1>
      <p className="page-subtitle">Marca lo ya revisado y guarda tu progreso offline.</p>
      <ul className="checklist-items">
        {items.map((item) => (
          <li key={item.label}>
            <button
              type="button"
              className={`checklist-button${item.checked ? ' is-checked' : ''}`}
              onClick={() => toggleItem(item.label)}
            >
              {item.checked ? `✅ ${item.label}` : item.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="checklist-actions">
        <button type="button" className="primary" onClick={handleSave}>
          Guardar cambios
        </button>
        <button type="button" className="secondary" onClick={handleReset}>
          Restablecer
        </button>
      </div>
    </section>
  );
}

export default Checklist;
