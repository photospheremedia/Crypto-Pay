"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Package, ShoppingCart, Users, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  type: "product" | "order" | "customer";
  title: string;
  subtitle?: string;
  href: string;
}

export function AdminSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.results || []);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.href);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "product":
        return <Package className="h-4 w-4 text-purple-500" />;
      case "order":
        return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case "customer":
        return <Users className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeName = (type: SearchResult["type"]) => {
    switch (type) {
      case "product":
        return "Product";
      case "order":
        return "Order";
      case "customer":
        return "Customer";
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder="Search products, orders, customers..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-10 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl animate-in slide-in-from-top-2 fade-in-0 z-50 max-h-96 overflow-y-auto"
        >
          <div className="py-2">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="flex items-start gap-3 w-full px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 shrink-0 mt-0.5">
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {result.title}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                      {getTypeName(result.type)}
                    </span>
                  </div>
                  {result.subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {result.subtitle}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.trim().length >= 2 && results.length === 0 && !loading && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl animate-in slide-in-from-top-2 fade-in-0 z-50"
        >
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Search className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-900 mb-1">
              No results found
            </p>
            <p className="text-xs text-slate-500">
              Try different keywords or check your spelling
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
