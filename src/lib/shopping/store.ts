"use client";

import { useSyncExternalStore, useCallback } from "react";

/**
 * Shopper tools persisted in localStorage (per browser).
 * Upgrade path: implement `ShopperStorage` against an accounts API and swap `storage` below —
 * the hooks and components stay the same.
 */
export interface SavedSearch {
  id: string;
  name: string;
  query: string; // serialized inventory filters (URL query string)
  createdAt: string;
}

interface ShopperState {
  favorites: string[];
  compare: string[];
  recent: string[];
  searches: SavedSearch[];
}

export interface ShopperStorage {
  read(): ShopperState;
  write(state: ShopperState): void;
}

const KEY = "as_shopper_v1";
const EMPTY: ShopperState = { favorites: [], compare: [], recent: [], searches: [] };
export const MAX_COMPARE = 3;
const MAX_RECENT = 12;

const localStorageAdapter: ShopperStorage = {
  read() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<ShopperState> | null;
      return { ...EMPTY, ...(parsed ?? {}) };
    } catch {
      return EMPTY;
    }
  },
  write(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked — tools keep working for this page view */
    }
  },
};

const storage: ShopperStorage = localStorageAdapter;

let cache: ShopperState | null = null;
const listeners = new Set<() => void>();

function getState(): ShopperState {
  if (typeof window === "undefined") return EMPTY;
  if (!cache) cache = storage.read();
  return cache;
}

function setState(update: (s: ShopperState) => ShopperState) {
  cache = update(getState());
  storage.write(cache);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

function useShopper<T>(select: (s: ShopperState) => T): T {
  return useSyncExternalStore(subscribe, () => select(getState()), () => select(EMPTY));
}

export function useFavorites() {
  const ids = useShopper((s) => s.favorites);
  const toggle = useCallback((id: string) => {
    setState((s) => ({ ...s, favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [id, ...s.favorites] }));
  }, []);
  return { ids, has: (id: string) => ids.includes(id), toggle };
}

export function useCompare() {
  const ids = useShopper((s) => s.compare);
  const toggle = useCallback((id: string): "added" | "removed" | "full" => {
    const cur = getState().compare;
    if (cur.includes(id)) {
      setState((s) => ({ ...s, compare: s.compare.filter((x) => x !== id) }));
      return "removed";
    }
    if (cur.length >= MAX_COMPARE) return "full";
    setState((s) => ({ ...s, compare: [...s.compare, id] }));
    return "added";
  }, []);
  const clear = useCallback(() => setState((s) => ({ ...s, compare: [] })), []);
  return { ids, has: (id: string) => ids.includes(id), toggle, clear, full: ids.length >= MAX_COMPARE };
}

export function useRecentlyViewed() {
  const ids = useShopper((s) => s.recent);
  const add = useCallback((id: string) => {
    setState((s) => ({ ...s, recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, MAX_RECENT) }));
  }, []);
  return { ids, add };
}

export function useSavedSearches() {
  const searches = useShopper((s) => s.searches);
  const save = useCallback((name: string, query: string) => {
    setState((s) => ({
      ...s,
      searches: [{ id: `s${Date.now().toString(36)}`, name: name.slice(0, 60) || "My search", query, createdAt: new Date().toISOString() }, ...s.searches.filter((x) => x.query !== query)].slice(0, 20),
    }));
  }, []);
  const remove = useCallback((id: string) => setState((s) => ({ ...s, searches: s.searches.filter((x) => x.id !== id) })), []);
  return { searches, save, remove };
}
