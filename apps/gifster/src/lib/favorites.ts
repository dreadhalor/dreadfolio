import { IGif } from '@giphy/js-types';
import { useSyncExternalStore } from 'react';

/* Favorites persist the full gif objects in localStorage so the Favorites tab
 * renders without refetching. A few hundred favorites stays well under quota. */

const STORAGE_KEY = 'gifster:favorites:v1';

let favorites: IGif[] = load();
const listeners = new Set<() => void>();

function load(): IGif[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as IGif[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Quota exceeded or private mode — favorites stay in-memory for the session.
  }
}

function emit() {
  for (const listener of listeners) listener();
}

export const isFavorite = (id: IGif['id']): boolean =>
  favorites.some((gif) => gif.id === id);

export const toggleFavorite = (gif: IGif): boolean => {
  const wasFavorite = isFavorite(gif.id);
  favorites = wasFavorite
    ? favorites.filter((entry) => entry.id !== gif.id)
    : [gif, ...favorites];
  persist();
  emit();
  return !wasFavorite;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useFavorites = (): IGif[] =>
  useSyncExternalStore(subscribe, () => favorites);
