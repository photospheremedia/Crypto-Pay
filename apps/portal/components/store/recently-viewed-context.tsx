"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type RecentlyViewedItem = {
  id: string;
  name: string;
  priceCents: number;
  image?: string;
  viewedAt: number;
};

type RecentlyViewedContextValue = {
  items: RecentlyViewedItem[];
  addItem: (item: Omit<RecentlyViewedItem, "viewedAt">) => void;
  clearHistory: () => void;
};

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(null);

const STORAGE_KEY = "rhs_recently_viewed";
const MAX_ITEMS = 12;

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RecentlyViewedItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      } catch {
        // ignore corrupted storage
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (typeof window === "undefined" || !isLoaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isLoaded]);

  const addItem = useCallback((item: Omit<RecentlyViewedItem, "viewedAt">) => {
    setItems((prev) => {
      // Remove if already exists
      const filtered = prev.filter((entry) => entry.id !== item.id);
      // Add to front with current timestamp
      const updated = [{ ...item, viewedAt: Date.now() }, ...filtered];
      // Keep only MAX_ITEMS
      return updated.slice(0, MAX_ITEMS);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <RecentlyViewedContext.Provider
      value={{
        items,
        addItem,
        clearHistory,
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error("useRecentlyViewed must be used within a RecentlyViewedProvider");
  }
  return context;
}
