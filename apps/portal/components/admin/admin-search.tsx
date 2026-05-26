"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Users, Wallet, MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

type SearchResultType = "merchant" | "wallet" | "lead";

interface SearchResult {
  id: string;
  type: SearchResultType;
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
        void performSearch(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/search?q=${encodeURIComponent(searchQuery)}`,
      );
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

  const getIcon = (type: SearchResultType) => {
    switch (type) {
      case "merchant":
        return <Users className="h-4 w-4 text-emerald-600" />;
      case "wallet":
        return <Wallet className="h-4 w-4 text-amber-600" />;
      case "lead":
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTypeName = (type: SearchResultType) => {
    switch (type) {
      case "merchant":
        return "Merchant";
      case "wallet":
        return "Wallet";
      case "lead":
        return "Lead";
    }
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() =>
            query.trim().length >= 2 && results.length > 0 && setIsOpen(true)
          }
          placeholder="Search merchants, wallets, leads…"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-10 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        {query && !loading ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        {loading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
          </div>
        ) : null}
      </div>

      {isOpen && results.length > 0 ? (
        <div
          ref={dropdownRef}
          className="absolute top-full z-[200] mt-2 max-h-96 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="py-2">
            {results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                type="button"
                onClick={() => handleResultClick(result)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  {getIcon(result.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {result.title}
                    </p>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {getTypeName(result.type)}
                    </span>
                  </div>
                  {result.subtitle ? (
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {result.subtitle}
                    </p>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {isOpen && query.trim().length >= 2 && results.length === 0 && !loading ? (
        <div
          ref={dropdownRef}
          className="absolute top-full z-[200] mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
            <Search className="mb-2 h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-900">No results found</p>
            <p className="text-xs text-slate-500">
              Try a merchant email, wallet address, or lead name
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
