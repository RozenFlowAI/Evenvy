'use client';

import { useSyncExternalStore } from 'react';

// Citire reactiva din localStorage fara setState-in-effect (cerinta React 19 / Next 16).
// localStorage devine "external store"; scrierile notifica abonatii printr-un event custom.

const EVENT = 'evenvy-ls';

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(EVENT, callback);
  };
}

export function useLocalStorageRaw(key: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(key),
    () => null,
  );
}

export function writeLocalStorage(key: string, value: string): void {
  localStorage.setItem(key, value);
  window.dispatchEvent(new Event(EVENT));
}

export function removeLocalStorage(key: string): void {
  localStorage.removeItem(key);
  window.dispatchEvent(new Event(EVENT));
}
