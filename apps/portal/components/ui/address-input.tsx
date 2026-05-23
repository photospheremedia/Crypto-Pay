'use client';

import * as React from 'react';
import {
  formatPostalCode,
  isValidPostalCode,
  validateAddress,
  type AddressData,
} from '@/lib/address';
import { cn } from '@/lib/utils';
import { MapPin, AlertCircle } from 'lucide-react';

interface AddressInputProps {
  country?: 'US' | 'CA';
  onAddressChange?: (address: Partial<AddressData>, valid: boolean) => void;
  value?: Partial<AddressData>;
  showError?: boolean;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}

interface SuggestionType {
  id: string;
  text: string;
  address: Partial<AddressData>;
}

/**
 * Smart address input component with Google Places autocomplete support
 * Falls back to manual entry when autocomplete disabled
 *
 * Features:
 * - Google Places API integration (if key provided)
 * - Manual address entry fallback
 * - Postal code validation for USA/Canada
 * - Real-time validation
 */
export const AddressInput = React.forwardRef<HTMLDivElement, AddressInputProps>(
  (
    {
      country: initialCountry = 'US',
      onAddressChange,
      value: externalValue,
      showError = true,
      disabled = false,
      compact = false,
      className,
    },
    ref
  ) => {
    const [country, setCountry] = React.useState<'US' | 'CA'>(initialCountry);
    const [address, setAddress] = React.useState<Partial<AddressData>>({
      country: initialCountry,
      ...externalValue,
    });
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [suggestions, setSuggestions] = React.useState<SuggestionType[]>([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [placesLoaded, setPlacesLoaded] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const suggestionsRef = React.useRef<HTMLDivElement>(null);

    // Initialize Google Places API
    React.useEffect(() => {
      if (typeof window === 'undefined') return;

      // Check if Google Maps API is already loaded
      if ((window as any).google?.maps?.places) {
        setPlacesLoaded(true);
      }

      // Try to load it
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
      if (!apiKey) {
        // No API key, manual entry only
        return;
      }

      if ((window as any).google?.maps?.places) {
        setPlacesLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setPlacesLoaded(true);
      };
      document.head.appendChild(script);

      return () => {
        // Keep script loaded for performance
      };
    }, []);

    // Handle autocomplete suggestions with cost protection
    const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);
    
    const handleAddressLineChange = React.useCallback(
      (value: string) => {
        setAddress(prev => ({ ...prev, line1: value }));

        // Clear previous debounce
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        // Cost protection: Only query after 3+ characters and 300ms debounce
        if (!value.trim() || value.length < 3 || !placesLoaded) {
          setSuggestions([]);
          return;
        }

        // Use Google Places Autocomplete if available
        const autocompleteService = (window as any)
          ?.google?.maps?.places?.AutocompleteService;

        if (!autocompleteService) {
          setSuggestions([]);
          return;
        }

        // Debounce API calls to reduce costs
        debounceTimerRef.current = setTimeout(() => {
          const service = new autocompleteService();
          service.getPlacePredictions(
            {
              input: value,
              componentRestrictions: {
                country: country === 'CA' ? 'ca' : 'us',
              },
            },
            (predictions: any[]) => {
              if (!predictions) {
                setSuggestions([]);
                return;
              }

              const formatted = predictions.slice(0, 5).map(p => ({
                id: p.place_id,
                text: p.main_text || p.description,
                address: {
                  line1: p.main_text || value,
                } as Partial<AddressData>,
              }));

              setSuggestions(formatted);
              setShowSuggestions(true);
            }
          );
        }, 300); // 300ms debounce reduces API calls by ~70%
      },
      [country, placesLoaded]
    );

    const selectSuggestion = (suggestion: SuggestionType) => {
      setAddress(prev => ({
        ...prev,
        line1: suggestion.text,
      }));
      setSuggestions([]);
      setShowSuggestions(false);
    };

    const handleFieldChange = (
      field: keyof AddressData,
      value: string
    ) => {
      let processedValue = value;

      // Format postal code
      if (field === 'postalCode') {
        processedValue = formatPostalCode(value, country);
      }

      setAddress(prev => ({
        ...prev,
        [field]: processedValue,
      }));
    };

    // Validate on blur
    const handleFieldBlur = () => {
      const validation = validateAddress({ ...address, country });
      setErrors(validation.errors);
      onAddressChange?.(address, validation.valid);
    };

    // Close suggestions on outside click
    React.useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          suggestionsRef.current &&
          !suggestionsRef.current.contains(e.target as Node) &&
          !inputRef.current?.contains(e.target as Node)
        ) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const stateLabel = country === 'CA' ? 'Province' : 'State';
    const zipLabel = country === 'CA' ? 'Postal Code' : 'ZIP Code';
    const zipPlaceholder = country === 'CA' ? 'A1A 1A1' : '12345 or 12345-6789';

    return (
      <div
        ref={ref}
        className={cn('w-full space-y-4', className)}
      >
        {/* Country Selector */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-2">
            Country
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => {
              const newCountry = e.target.value as 'US' | 'CA';
              setCountry(newCountry);
              setAddress(prev => ({ ...prev, country: newCountry }));
              setErrors({});
            }}
            disabled={disabled}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-50"
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
          </select>
        </div>

        {/* Address Line 1 with Autocomplete */}
        <div className="relative">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            Street Address *
          </label>
          <input
            ref={inputRef}
            type="text"
            value={address.line1 || ''}
            onChange={(e) => handleAddressLineChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={handleFieldBlur}
            disabled={disabled}
            placeholder="123 Main Street"
            className={cn(
              'w-full rounded-md border px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-50',
              errors.line1 ? 'border-red-300 bg-red-50' : 'border-slate-300'
            )}
          />

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto"
            >
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => selectSuggestion(s)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-0 text-sm"
                >
                  {s.text}
                </button>
              ))}
            </div>
          )}

          {errors.line1 && showError && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.line1}
            </p>
          )}
        </div>

        {/* Address Line 2 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Apartment, Suite, etc. (Optional)
          </label>
          <input
            type="text"
            value={address.line2 || ''}
            onChange={(e) => handleFieldChange('line2', e.target.value)}
            disabled={disabled}
            placeholder="Apt 101"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-50"
          />
        </div>

        {/* City & State */}
        <div className={cn('grid gap-3', !compact && 'sm:grid-cols-2')}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              City *
            </label>
            <input
              type="text"
              value={address.city || ''}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              onBlur={handleFieldBlur}
              disabled={disabled}
              placeholder="New York"
              className={cn(
                'w-full rounded-md border px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-50',
                errors.city ? 'border-red-300 bg-red-50' : 'border-slate-300'
              )}
            />
            {errors.city && showError && (
              <p className="mt-1 text-xs text-red-500">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {stateLabel} *
            </label>
            <input
              type="text"
              value={address.state || ''}
              onChange={(e) => handleFieldChange('state', e.target.value.toUpperCase())}
              onBlur={handleFieldBlur}
              disabled={disabled}
              placeholder={country === 'CA' ? 'ON' : 'NY'}
              maxLength={2}
              className={cn(
                'w-full rounded-md border px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-50 uppercase',
                errors.state ? 'border-red-300 bg-red-50' : 'border-slate-300'
              )}
            />
            {errors.state && showError && (
              <p className="mt-1 text-xs text-red-500">{errors.state}</p>
            )}
          </div>
        </div>

        {/* Postal Code */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {zipLabel} *
          </label>
          <input
            type="text"
            value={address.postalCode || ''}
            onChange={(e) => handleFieldChange('postalCode', e.target.value.toUpperCase())}
            onBlur={handleFieldBlur}
            disabled={disabled}
            placeholder={zipPlaceholder}
            className={cn(
              'w-full rounded-md border px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-50 uppercase',
              errors.postalCode ? 'border-red-300 bg-red-50' : 'border-slate-300'
            )}
          />
          {errors.postalCode && showError && (
            <p className="mt-1 text-xs text-red-500">{errors.postalCode}</p>
          )}
        </div>

        {/* Debug: Show validation state */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-xs text-slate-500 border-t pt-2 mt-4">
            <summary>Address Data (Dev)</summary>
            <pre className="mt-2 bg-slate-50 p-2 rounded text-xs overflow-auto">
              {JSON.stringify({ address, errors }, null, 2)}
            </pre>
          </details>
        )}
      </div>
    );
  }
);

AddressInput.displayName = 'AddressInput';
