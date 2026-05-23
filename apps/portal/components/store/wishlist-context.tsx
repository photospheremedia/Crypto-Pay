"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type WishlistItem = {
  id: string;
  name: string;
  priceCents: number;
  image?: string;
  addedAt: number;
};

type WishlistContextValue = {
  items: WishlistItem[];
  addItem: (item: Omit<WishlistItem, "addedAt">) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  toggleItem: (item: Omit<WishlistItem, "addedAt">) => void;
  clear: () => void;
  itemCount: number;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

const STORAGE_KEY = "rhs_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as WishlistItem[];
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

  const addItem = useCallback((item: Omit<WishlistItem, "addedAt">) => {
    setItems((prev) => {
      if (prev.find((entry) => entry.id === item.id)) {
        return prev;
      }
      return [...prev, { ...item, addedAt: Date.now() }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const isInWishlist = useCallback((id: string) => {
    return items.some((item) => item.id === id);
  }, [items]);

  const toggleItem = useCallback((item: Omit<WishlistItem, "addedAt">) => {
    setItems((prev) => {
      const exists = prev.find((entry) => entry.id === item.id);
      if (exists) {
        return prev.filter((entry) => entry.id !== item.id);
      }
      return [...prev, { ...item, addedAt: Date.now() }];
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInWishlist,
        toggleItem,
        clear,
        itemCount: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    // Return a no-op context for components outside WishlistProvider (guest users)
    // This allows the heart icon to show for everyone, not just logged-in users
    return {
      items: [],
      addItem: () => {},
      removeItem: () => {},
      isInWishlist: () => false,
      toggleItem: () => {},
      clear: () => {},
      itemCount: 0,
    };
  }
  return context;
}
