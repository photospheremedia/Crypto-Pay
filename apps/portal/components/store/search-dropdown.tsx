"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  X, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  Loader2, 
  Sparkles,
  ChevronRight,
  Package,
  Tag,
  Building2,
  Eye,
  Mic,
  MicOff
} from "lucide-react";

// ============================================================================
// DATA - In production, this would come from API/database
// ============================================================================

// Fallback image for broken product images
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1604756930505-1b1a0c1ed4a3?w=200&h=200&fit=crop&q=80";

const categoryFallbacks: Record<string, string> = {
  "packaging-takeout": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=200&fit=crop&q=80",
  "cutlery-utensils": "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=200&h=200&fit=crop&q=80",
  "beverages-cups": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&h=200&fit=crop&q=80",
  "labels-stickers": "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=200&h=200&fit=crop&q=80",
  "cleaning-safety": "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=200&h=200&fit=crop&q=80",
  "paper-products": "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=200&h=200&fit=crop&q=80",
};

const allProducts = [
  { id: "takeout-containers-001", name: "Premium Takeout Containers with Lids (200 ct)", category: "packaging-takeout", subcategory: "Takeout Containers", brand: "EcoPack", sku: "TC-001", priceCents: 11800, image: "https://images.unsplash.com/photo-1604756930505-1b1a0c1ed4a3?w=200&h=200&fit=crop&q=80", popularity: 95 },
  { id: "thermal-bags-001", name: "Insulated Thermal Delivery Bags (Set of 10)", category: "packaging-takeout", subcategory: "Delivery Bags", brand: "Restaurant Hub", sku: "TB-001", priceCents: 12900, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop&q=80", popularity: 88 },
  { id: "paper-bags-001", name: "Handled Paper Bags (250 ct)", category: "packaging-takeout", subcategory: "Paper Bags", brand: "GreenChoice", sku: "PB-001", priceCents: 10200, image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=200&h=200&fit=crop&q=80", popularity: 82 },
  { id: "compostable-cutlery-001", name: "Compostable Cutlery Kits (500 ct)", category: "cutlery-utensils", subcategory: "Compostable", brand: "GreenChoice", sku: "CC-001", priceCents: 5400, image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=200&h=200&fit=crop&q=80", popularity: 91 },
  { id: "hot-cups-001", name: "Double-Wall Hot Cups (500 ct)", category: "beverages-cups", subcategory: "Hot Cups", brand: "CupCo", sku: "HC-001", priceCents: 8900, image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop&q=80", popularity: 86 },
  { id: "food-labels-001", name: "Day-Dot Label Rolls (6 Pack)", category: "labels-stickers", subcategory: "Food Labels", brand: "LabelPro", sku: "FL-001", priceCents: 4200, image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=200&h=200&fit=crop&q=80", popularity: 79 },
  { id: "gloves-vinyl-001", name: "Vinyl Gloves (1,000 ct)", category: "cleaning-safety", subcategory: "Gloves", brand: "SafeHands", sku: "VG-001", priceCents: 8900, image: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=200&h=200&fit=crop&q=80", popularity: 94 },
  { id: "sanitizer-bulk-001", name: "Hand Sanitizer (Gallon Refill)", category: "cleaning-safety", subcategory: "Sanitizers", brand: "CleanPro", sku: "HS-001", priceCents: 2800, image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=200&h=200&fit=crop&q=80", popularity: 77 },
  { id: "napkins-001", name: "Premium Dinner Napkins (2000 ct)", category: "paper-products", subcategory: "Napkins", brand: "SoftTouch", sku: "DN-001", priceCents: 5600, image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=200&h=200&fit=crop&q=80", popularity: 85 },
  { id: "receipt-rolls-001", name: "Thermal Receipt Rolls (Case of 50)", category: "paper-products", subcategory: "Receipt Paper", brand: "PrintReady", sku: "TR-001", priceCents: 7600, image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop&q=80", popularity: 72 },
  { id: "tamper-seals-001", name: "Tamper-Evident Seals (1,000 ct)", category: "labels-stickers", subcategory: "Tamper Seals", brand: "SecureSeal", sku: "TS-001", priceCents: 3400, image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=200&h=200&fit=crop&q=80", popularity: 83 },
  { id: "cold-cups-001", name: "Clear Cold Cups (1000 ct)", category: "beverages-cups", subcategory: "Cold Cups", brand: "CupCo", sku: "CC-002", priceCents: 6700, image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&h=200&fit=crop&q=80", popularity: 89 },
];

// Categories for filtering
const categories = [
  { id: "all", name: "All Categories", icon: Package },
  { id: "packaging-takeout", name: "Packaging & Takeout", icon: Package },
  { id: "cutlery-utensils", name: "Cutlery & Utensils", icon: Package },
  { id: "beverages-cups", name: "Beverages & Cups", icon: Package },
  { id: "labels-stickers", name: "Labels & Stickers", icon: Tag },
  { id: "cleaning-safety", name: "Cleaning & Safety", icon: Package },
  { id: "paper-products", name: "Paper Products", icon: Package },
];

// Brands for suggestions
const brands = ["EcoPack", "GreenChoice", "Restaurant Hub", "CupCo", "SafeHands", "LabelPro", "CleanPro"];

// Autocomplete suggestions based on common searches
const autocompleteSuggestions = [
  "takeout containers",
  "takeout containers with lids",
  "thermal bags",
  "thermal delivery bags",
  "paper bags",
  "paper bags with handles",
  "cutlery kits",
  "compostable cutlery",
  "hot cups",
  "cold cups",
  "cups with lids",
  "food labels",
  "date labels",
  "gloves",
  "vinyl gloves",
  "nitrile gloves",
  "sanitizer",
  "hand sanitizer",
  "napkins",
  "dinner napkins",
];

// Common typos and corrections
const typoCorrections: Record<string, string> = {
  "contaners": "containers",
  "containrs": "containers",
  "contianers": "containers",
  "cutlry": "cutlery",
  "cuterly": "cutlery",
  "glovs": "gloves",
  "glvoes": "gloves",
  "napkns": "napkins",
  "napknis": "napkins",
  "sanitizr": "sanitizer",
  "sanitzer": "sanitizer",
  "themal": "thermal",
  "thermla": "thermal",
  "lables": "labels",
  "labls": "labels",
  "bgas": "bags",
};

const SEARCH_HISTORY_KEY = "rhs_search_history";
const RECENT_VIEWED_KEY = "rhs_recent_viewed";
const MAX_HISTORY = 8;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

// Check for typos and suggest corrections
function checkSpelling(query: string): string | null {
  const words = query.toLowerCase().split(/\s+/);
  let corrected = false;
  const correctedWords = words.map(word => {
    if (typoCorrections[word]) {
      corrected = true;
      return typoCorrections[word];
    }
    return word;
  });
  return corrected ? correctedWords.join(" ") : null;
}

// Highlight matching text
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) {
    // Try highlighting individual words
    const words = query.split(/\s+/).filter(w => w.length > 1);
    let result = text;
    for (const word of words) {
      const regex = new RegExp(`(${word})`, 'gi');
      result = result.replace(regex, '|||$1|||');
    }
    const parts = result.split('|||');
    return parts.map((part, i) => 
      words.some(w => part.toLowerCase() === w.toLowerCase()) 
        ? <mark key={i} className="bg-amber-100 text-amber-900 rounded px-0.5">{part}</mark>
        : part
    );
  }
  
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-amber-100 text-amber-900 rounded px-0.5">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

// Smart search scoring
function scoreMatch(product: typeof allProducts[0], query: string): number {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/).filter(w => w.length > 0);
  
  let score = 0;
  
  // SKU exact match - highest priority
  if (product.sku.toLowerCase() === lowerQuery) return 200;
  if (product.sku.toLowerCase().includes(lowerQuery)) score += 80;
  
  // Name matching
  const lowerName = product.name.toLowerCase();
  if (lowerName === lowerQuery) return 150;
  if (lowerName.startsWith(lowerQuery)) score += 60;
  if (lowerName.includes(lowerQuery)) score += 40;
  
  // Brand matching
  if (product.brand.toLowerCase().includes(lowerQuery)) score += 30;
  
  // Category/subcategory matching
  if (product.subcategory.toLowerCase().includes(lowerQuery)) score += 25;
  if (product.category.toLowerCase().includes(lowerQuery)) score += 20;
  
  // Word matching
  for (const word of words) {
    if (word.length < 2) continue;
    
    if (lowerName.includes(word)) {
      score += 15;
      if (lowerName.startsWith(word)) score += 5;
    }
    // Handle plurals
    else if (word.endsWith('s') && lowerName.includes(word.slice(0, -1))) {
      score += 12;
    }
    else if (!word.endsWith('s') && lowerName.includes(word + 's')) {
      score += 12;
    }
  }
  
  // Popularity boost
  score += (product.popularity || 0) * 0.1;
  
  return score;
}

// Get autocomplete suggestions
function getAutocompleteSuggestions(query: string): string[] {
  if (!query.trim() || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  return autocompleteSuggestions
    .filter(s => s.toLowerCase().startsWith(lowerQuery) || s.toLowerCase().includes(lowerQuery))
    .slice(0, 5);
}

// Get category suggestions based on query
function getCategorySuggestions(query: string, products: typeof allProducts): { category: string; count: number; id: string }[] {
  const categoryCount: Record<string, { count: number; id: string }> = {};
  
  products.forEach(p => {
    const cat = categories.find(c => c.id === p.category);
    if (cat) {
      if (!categoryCount[cat.name]) {
        categoryCount[cat.name] = { count: 0, id: cat.id };
      }
      categoryCount[cat.name].count++;
    }
  });
  
  return Object.entries(categoryCount)
    .map(([category, { count, id }]) => ({ category, count, id }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

// Get brand suggestions
function getBrandSuggestions(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  return brands.filter(b => b.toLowerCase().includes(lowerQuery)).slice(0, 3);
}

// ============================================================================
// COMPONENT
// ============================================================================

interface SearchDropdownProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function SearchDropdown({ isMobile, onClose }: SearchDropdownProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<typeof allProducts>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<typeof allProducts>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Computed values
  const spellingCorrection = useMemo(() => checkSpelling(query), [query]);
  const autocompletions = useMemo(() => getAutocompleteSuggestions(query), [query]);
  const categorySuggestions = useMemo(() => getCategorySuggestions(query, results), [query, results]);
  const brandSuggestions = useMemo(() => getBrandSuggestions(query), [query]);

  // Load search history and recently viewed
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const storedHistory = window.localStorage.getItem(SEARCH_HISTORY_KEY);
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory);
        if (Array.isArray(parsed)) setSearchHistory(parsed);
      } catch {}
    }
    
    const storedViewed = window.localStorage.getItem(RECENT_VIEWED_KEY);
    if (storedViewed) {
      try {
        const parsed = JSON.parse(storedViewed);
        if (Array.isArray(parsed)) {
          // Match with products
          const viewed = parsed.slice(0, 4).map((id: string) => 
            allProducts.find(p => p.id === id)
          ).filter(Boolean);
          setRecentlyViewed(viewed as typeof allProducts);
        }
      } catch {}
    }
  }, []);

  // Save to history
  const saveToHistory = useCallback((term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...searchHistory.filter(h => h !== term)].slice(0, MAX_HISTORY);
    setSearchHistory(updated);
    window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  }, [searchHistory]);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    window.localStorage.removeItem(SEARCH_HISTORY_KEY);
  }, []);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      let searchProducts = allProducts;
      
      // Filter by category if selected
      if (selectedCategory !== "all") {
        searchProducts = searchProducts.filter(p => p.category === selectedCategory);
      }
      
      // Score and sort
      const scored = searchProducts.map(product => ({
        ...product,
        score: scoreMatch(product, query)
      }));
      
      const filtered = scored
        .filter(p => p.score > 5)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);
      
      setResults(filtered);
      setIsLoading(false);
      setSelectedIndex(-1);
    }, 100);

    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowCategoryPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      const totalItems = results.length + autocompletions.length;
      
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % totalItems);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
          break;
        case "Enter":
          if (selectedIndex >= 0) {
            e.preventDefault();
            if (selectedIndex < autocompletions.length) {
              handleSuggestionClick(autocompletions[selectedIndex]);
            } else {
              const productIndex = selectedIndex - autocompletions.length;
              if (results[productIndex]) {
                handleProductClick(results[productIndex].id);
                router.push(`/shop/product/${results[productIndex].id}`);
              }
            }
          }
          break;
        case "Escape":
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, results, autocompletions, router]);

  // Voice search (Web Speech API) - Production-grade implementation
  const startVoiceSearch = useCallback(() => {
    if (typeof window === "undefined") return;

    // Browser compatibility check - all vendor prefixes
    const SpeechRecognitionAPI = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition || 
      (window as any).mozSpeechRecognition || 
      (window as any).msSpeechRecognition || 
      (window as any).oSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert("Voice search is not supported in your browser. Please use Chrome, Edge, or Firefox.");
      return;
    }

    setIsOpen(true);
    setShowCategoryPicker(false);

    const recognition = recognitionRef.current ?? new SpeechRecognitionAPI();
    recognitionRef.current = recognition;

    // Configuration for best results
    recognition.continuous = false;
    recognition.interimResults = true; // Show live transcription
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    let finalTranscript = "";
    let ignoreOnEnd = false;
    const recognitionStartTime = Date.now();

    // State tracking
    recognition.onstart = () => {
      setIsListening(true);
      finalTranscript = "";
    };

    // Process interim and final results separately
    recognition.onresult = (event: any) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      // Show interim results for live feedback
      if (interimTranscript) {
        setQuery(interimTranscript);
      }

      // When final result arrives, process and use it
      if (finalTranscript) {
        const processedTranscript = finalTranscript
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ") // Normalize whitespace
          .replace(/[.,!?;:]+$/g, ""); // Remove trailing punctuation
        
        // Capitalize first letter
        const capitalizedTranscript = 
          processedTranscript.charAt(0).toUpperCase() + processedTranscript.slice(1);
        
        setQuery(capitalizedTranscript);
        inputRef.current?.focus();
      }
    };

    // Comprehensive error handling
    recognition.onerror = (event: any) => {
      ignoreOnEnd = true;
      setIsListening(false);

      const errorMessages: Record<string, string> = {
        "no-speech": "No speech detected. Please try again.",
        "audio-capture": "No microphone found. Check your device settings.",
        "not-allowed": "Microphone permission was denied. Check browser settings.",
        "network": "Network error. Please check your connection.",
        "aborted": "Voice input was cancelled.",
        "service-not-allowed": "Voice service is not available.",
        "bad-grammar": "Speech grammar error. Please try again.",
        "not-supported": "Voice recognition is not supported.",
      };

      const message = errorMessages[event.error] || 
        `Voice error: ${event.error}. Please try again.`;
      
      // Timing heuristic: if "not-allowed" happens within 100ms, it's a browser/service issue,
      // not actual user denial. Only alert if it's a real denial (after 100ms).
      const elapsedTime = event.timeStamp - recognitionStartTime;
      const isRealDenial = elapsedTime > 100;
      
      // Only show alerts for critical errors that are clearly user actions
      if (event.error === "not-allowed" && isRealDenial) {
        alert(message);
      } else if (["audio-capture", "network"].includes(event.error)) {
        // Device/network errors get shown
        console.warn("Voice search error:", message);
      } else {
        // Other errors are logged silently
        console.debug("Voice search info:", message);
      }
    };

    // Clean lifecycle management
    recognition.onend = () => {
      if (!ignoreOnEnd) {
        setIsListening(false);
      }
    };

    // Prevent duplicate starts
    if (isListening) {
      recognition.stop();
      return;
    }

    try {
      recognition.start();
    } catch (error) {
      console.error("Failed to start voice recognition:", error);
      setIsListening(false);
    }
  }, [isListening]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveToHistory(query.trim());
    const categoryParam = selectedCategory !== "all" ? `&category=${selectedCategory}` : "";
    router.push(`/shop?search=${encodeURIComponent(query.trim())}${categoryParam}`);
    setIsOpen(false);
    onClose?.();
  };

  const handleSuggestionClick = (term: string) => {
    setQuery(term);
    saveToHistory(term);
    const categoryParam = selectedCategory !== "all" ? `&category=${selectedCategory}` : "";
    router.push(`/shop?search=${encodeURIComponent(term)}${categoryParam}`);
    setIsOpen(false);
    onClose?.();
  };

  const handleProductClick = (productId: string) => {
    if (query.trim()) saveToHistory(query.trim());
    // Save to recently viewed
    if (typeof window !== "undefined") {
      const viewed = [productId, ...(JSON.parse(localStorage.getItem(RECENT_VIEWED_KEY) || "[]") as string[]).filter(id => id !== productId)].slice(0, 10);
      localStorage.setItem(RECENT_VIEWED_KEY, JSON.stringify(viewed));
    }
    setIsOpen(false);
    onClose?.();
  };

  const handleCorrectionClick = () => {
    if (spellingCorrection) {
      setQuery(spellingCorrection);
    }
  };

  const selectedCategoryInfo = categories.find(c => c.id === selectedCategory);

  return (
    <div ref={containerRef} className={`relative w-full ${isMobile ? "" : ""}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className={`flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-sm shadow-sm transition-all ${
          isOpen 
            ? "border-orange-400 ring-2 ring-orange-100" 
            : "border-slate-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100"
        }`}>
          {/* Category Selector - Amazon style */}
          <button
            type="button"
            onClick={() => setShowCategoryPicker(!showCategoryPicker)}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 transition text-xs font-medium text-slate-600 whitespace-nowrap"
          >
            {selectedCategoryInfo?.name === "All Categories" ? "All" : selectedCategoryInfo?.name?.split(" ")[0]}
            <ChevronRight className={`h-3 w-3 transition-transform ${showCategoryPicker ? "rotate-90" : ""}`} />
          </button>
          
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          
          <Search className="h-4 w-4 text-orange-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="flex-1 min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder={selectedCategory === "all" ? "Search products, brands, SKUs..." : `Search in ${selectedCategoryInfo?.name}...`}
            aria-label="Search products"
            autoComplete="off"
          />
          
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full hover:bg-slate-100 transition"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
          
          {isLoading && <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />}
          
          {/* Voice Search Button */}
          <button
            type="button"
            onClick={startVoiceSearch}
            className={`p-1.5 rounded-full transition ${
              isListening 
                ? "bg-red-100 text-red-600" 
                : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            }`}
            title="Voice search"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        </div>
        
        {/* Category Picker Dropdown */}
        {showCategoryPicker && (
          <div className="absolute left-0 top-full mt-1 w-56 rounded-xl border border-slate-200 bg-white shadow-lg z-50 p-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setShowCategoryPicker(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition ${
                  selectedCategory === cat.id 
                    ? "bg-orange-50 text-orange-600" 
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <cat.icon className="h-4 w-4" />
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Main Dropdown - Smooth animation */}
      {isOpen && (
        <div 
          ref={listRef}
          className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Spelling Correction */}
          {spellingCorrection && query && (
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
              <p className="text-sm text-amber-800">
                Did you mean:{" "}
                <button 
                  onClick={handleCorrectionClick}
                  className="font-semibold text-amber-900 hover:underline"
                >
                  {spellingCorrection}
                </button>
                ?
              </p>
            </div>
          )}

          {/* Autocomplete Suggestions */}
          {query && autocompletions.length > 0 && (
            <div className="border-b border-slate-100">
              <div className="px-4 py-2">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Suggestions
                </p>
              </div>
              <div>
                {autocompletions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition ${
                      selectedIndex === index 
                        ? "bg-orange-50" 
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <Search className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700">
                      {highlightMatch(suggestion, query)}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-300 ml-auto" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Suggestions - "cups in Beverages" style */}
          {query && categorySuggestions.length > 0 && results.length > 0 && (
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Search in Category
              </p>
              <div className="flex flex-wrap gap-2">
                {categorySuggestions.map(({ category, count, id }) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(id);
                      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600 hover:bg-orange-100 hover:text-orange-600 transition"
                  >
                    &quot;{query}&quot; in {category}
                    <span className="text-slate-400">({count})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Brand Suggestions */}
          {query && brandSuggestions.length > 0 && (
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Brands
              </p>
              <div className="flex flex-wrap gap-2">
                {brandSuggestions.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => handleSuggestionClick(brand)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 transition"
                  >
                    <Building2 className="h-3 w-3" />
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Results */}
          {query && results.length > 0 && (
            <div className="p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                Products
              </p>
              <div className="space-y-1">
                {results.map((product, index) => {
                  const itemIndex = autocompletions.length + index;
                  return (
                    <Link
                      key={product.id}
                      href={`/shop/product/${product.id}`}
                      onClick={() => handleProductClick(product.id)}
                      className={`flex items-center gap-3 p-2 rounded-xl transition group ${
                        selectedIndex === itemIndex 
                          ? "bg-orange-50" 
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = categoryFallbacks[product.category] || FALLBACK_IMAGE;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 line-clamp-1 group-hover:text-orange-500 transition">
                          {highlightMatch(product.name, query)}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500">{product.brand}</span>
                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-xs text-slate-400">SKU: {product.sku}</span>
                        </div>
                        <span className="text-xs text-orange-500">{product.subcategory}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-slate-900">
                          {formatPrice(product.priceCents)}
                        </p>
                        <p className="text-[10px] text-orange-500 font-medium">In Stock</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <button
                onClick={handleSubmit}
                className="flex items-center justify-center gap-2 w-full mt-3 p-3 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition"
              >
                See all results for &quot;{query}&quot;
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* No Results */}
          {query && results.length === 0 && !isLoading && (
            <div className="p-8 text-center">
              <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">No products found for &quot;{query}&quot;</p>
              <p className="mt-1 text-xs text-slate-400">Try a different search term or browse categories</p>
              {spellingCorrection && (
                <button 
                  onClick={handleCorrectionClick}
                  className="mt-3 text-sm text-orange-500 font-medium hover:underline"
                >
                  Search for &quot;{spellingCorrection}&quot; instead
                </button>
              )}
            </div>
          )}

          {/* Default State */}
          {!query && (
            <div className="p-4">
              {/* Recently Viewed */}
              {recentlyViewed.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-4 w-4 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Recently Viewed
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {recentlyViewed.map((product) => (
                      <Link
                        key={product.id}
                        href={`/shop/product/${product.id}`}
                        onClick={() => handleProductClick(product.id)}
                        className="group"
                      >
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 mb-1">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = categoryFallbacks[product.category] || FALLBACK_IMAGE;
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-600 line-clamp-2 group-hover:text-orange-500 transition">
                          {product.name}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Searches */}
              {searchHistory.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Recent Searches
                      </p>
                    </div>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-slate-400 hover:text-slate-600 transition"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSuggestionClick(term)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-sm text-slate-600 hover:bg-orange-100 hover:text-orange-600 transition"
                      >
                        <Clock className="h-3 w-3 text-slate-400" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Trending Now
                  </p>
                  <Sparkles className="h-3 w-3 text-amber-500" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {["takeout containers", "vinyl gloves", "compostable cutlery", "thermal bags", "cold cups"].map((term, index) => (
                    <button
                      key={term}
                      onClick={() => handleSuggestionClick(term)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition ${
                        index === 0 
                          ? "bg-orange-100 text-orange-600 font-medium border border-orange-200" 
                          : "border border-slate-200 text-slate-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                      }`}
                    >
                      {index === 0 && <span>🔥</span>}
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Categories */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Popular Categories
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {categories.slice(1, 4).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        router.push(`/shop?category=${cat.id}`);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-xs font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition"
                    >
                      <cat.icon className="h-4 w-4" />
                      {cat.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Keyboard hint */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-3">
              <span><kbd className="px-1.5 py-0.5 bg-white rounded border text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white rounded border text-[10px]">↓</kbd> navigate</span>
              <span><kbd className="px-1.5 py-0.5 bg-white rounded border text-[10px]">Enter</kbd> select</span>
              <span><kbd className="px-1.5 py-0.5 bg-white rounded border text-[10px]">Esc</kbd> close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
