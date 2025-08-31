import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) as T : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
        console.error(`Error saving to localStorage for key "${key}":`, state);
    }
  }, [key, state]);

  return [state, setState] as const;
}

export async function clearLocalStorage(): Promise<void> {
    localStorage.clear();

    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      } catch (err) {
        console.error('Error clearing caches', err);
      }
    }
    
    window.location.reload();
};

export function updateData<T>(
  oldData: Record<string, T>,
  newData: Record<string, T>,
): Record<string, T> {
  const updatedData = { ...oldData };
  for (const key in newData) {
    if (newData.hasOwnProperty(key)) {
      updatedData[key] = newData[key];
    }
  }
  return updatedData;
}