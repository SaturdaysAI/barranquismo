import { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';

const CATEGORY_TRANSLATIONS = {
  'Personal gear': 'Equipo personal',
  'Technical gear': 'Equipo técnico',
  Logistics: 'Logística'
};

const LABEL_TRANSLATIONS = {
  'Neoprene suit': 'Traje de neopreno',
  Helmet: 'Casco',
  'Harness and descender': 'Arnés y descensor',
  'Rope (2x length of longest rappel)': 'Cuerda (2x longitud del rápel más largo)',
  'Dry bag with essentials': 'Saco estanco con esenciales'
};

const DEFAULT_ITEMS = [
  { label: LABEL_TRANSLATIONS['Neoprene suit'], checked: false, category: CATEGORY_TRANSLATIONS['Personal gear'] },
  { label: LABEL_TRANSLATIONS.Helmet, checked: false, category: CATEGORY_TRANSLATIONS['Personal gear'] },
  { label: LABEL_TRANSLATIONS['Harness and descender'], checked: false, category: CATEGORY_TRANSLATIONS['Technical gear'] },
  {
    label: LABEL_TRANSLATIONS['Rope (2x length of longest rappel)'],
    checked: false,
    category: CATEGORY_TRANSLATIONS['Technical gear']
  },
  { label: LABEL_TRANSLATIONS['Dry bag with essentials'], checked: false, category: CATEGORY_TRANSLATIONS.Logistics }
];

const translateToSpanish = (item) => {
  const translatedCategory = CATEGORY_TRANSLATIONS[item.category] || item.category || 'Otros';
  const translatedLabel = LABEL_TRANSLATIONS[item.label] || item.label;
  return { ...item, category: translatedCategory, label: translatedLabel };
};

// Checklist allows users to tick essential gear and persists the selection locally.
function Checklist() {
  const [savedItems, setSavedItems] = useLocalStorage('gear-checklist', DEFAULT_ITEMS);
  const [items, setItems] = useState(() => savedItems.map(translateToSpanish));
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORY_TRANSLATIONS['Personal gear']);

  useEffect(() => {
    setItems(savedItems.map(translateToSpanish));
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

  const categories = Array.from(new Set(items.map((item) => item.category || 'Otros')));

  const addItem = () => {
    if (!newItem.trim()) {
      return;
    }
    const item = { label: newItem.trim(), checked: false, category: newCategory };
    setItems((prev) => [...prev, item]);
    setNewItem('');
  };

  const resetCategory = (category) => {
    setItems((prev) =>
      prev.map((item) =>
        item.category === category ? { ...item, checked: false } : item
      )
    );
  };

  return (
    <section className="checklist">
      <h1 className="page-title">Checklist de material</h1>
      <p className="page-subtitle">Marca lo ya revisado, añade tus notas y guarda tu progreso offline.</p>

      <div className="checklist-add">
        <label className="sr-only" htmlFor="new-item">
          Nuevo elemento
        </label>
        <input
          id="new-item"
          type="text"
          value={newItem}
          onChange={(event) => setNewItem(event.target.value)}
          placeholder="Añadir pieza de material"
        />
        <select value={newCategory} onChange={(event) => setNewCategory(event.target.value)}>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <button type="button" className="primary" onClick={addItem}>
          Añadir
        </button>
      </div>

      {categories.map((category) => (
        <div key={category} className="checklist-group">
          <div className="group-header">
            <h2>{category}</h2>
            <button type="button" className="secondary" onClick={() => resetCategory(category)}>
              Reiniciar
            </button>
          </div>
          <ul className="checklist-items">
            {items
              .filter((item) => item.category === category)
              .map((item) => (
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
        </div>
      ))}

      <div className="checklist-actions">
        <button type="button" className="primary" onClick={handleSave}>
          Guardar cambios
        </button>
        <button type="button" className="secondary" onClick={handleReset}>
          Restablecer todo
        </button>
      </div>
    </section>
  );
}

export default Checklist;
