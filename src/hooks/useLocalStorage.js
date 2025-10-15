import { useState, useEffect } from 'react';

// useLocalStorage keeps state in sync with localStorage without external dependencies.
function useLocalStorage(key, initialValue) {
  const readValue = () => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue);
      }
      return JSON.parse(JSON.stringify(initialValue));
    } catch (error) {
      console.warn(`LocalStorage read failed for key "${key}":`, error);
      return initialValue;
    }
  };

  const [value, setValue] = useState(readValue);

  useEffect(() => {
    setValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`LocalStorage write failed for key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
