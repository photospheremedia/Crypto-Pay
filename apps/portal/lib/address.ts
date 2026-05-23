/**
 * Address validation and formatting utilities
 * Supports USA and Canada addresses with region-specific postal codes
 */

export const US_STATE_CODES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC', 'AS', 'GU', 'MP', 'PR', 'VI'
];

export const CANADA_PROVINCE_CODES = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE',
  'QC', 'SK', 'YT'
];

/**
 * Validates USA ZIP code (5 or 5+4 format)
 */
export function isValidUSZip(zip: string): boolean {
  // 5 digit or 5+4 format: 12345 or 12345-6789
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip.trim());
}

/**
 * Validates Canadian postal code (A1A 1A1 format)
 */
export function isValidCanadianPostalCode(postalCode: string): boolean {
  // Format: A1A 1A1 (letter-digit-letter space digit-letter-digit)
  const postalRegex = /^[A-Za-z]\d[A-Za-z][\s\-]?\d[A-Za-z]\d$/;
  return postalRegex.test(postalCode.trim());
}

/**
 * Validates postal code for a given country
 */
export function isValidPostalCode(
  postalCode: string,
  country: 'US' | 'CA' = 'US'
): boolean {
  if (!postalCode.trim()) return false;
  if (country === 'CA') return isValidCanadianPostalCode(postalCode);
  return isValidUSZip(postalCode);
}

/**
 * Formats Canadian postal code to standard format (A1A 1A1)
 */
export function formatCanadianPostalCode(postalCode: string): string {
  // Remove spaces and hyphens, convert to uppercase
  const cleaned = postalCode.replace(/[\s\-]/g, '').toUpperCase();
  // Format as A1A 1A1
  if (cleaned.length >= 6) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)}`;
  }
  return cleaned;
}

/**
 * Formats USA ZIP code to 5 or 5+4 format
 */
export function formatUSZip(zip: string): string {
  // Remove all non-digits
  const cleaned = zip.replace(/\D/g, '');
  // Format: 12345 or 123456789 -> 12345-6789
  if (cleaned.length === 5) return cleaned;
  if (cleaned.length === 9) {
    return `${cleaned.substring(0, 5)}-${cleaned.substring(5)}`;
  }
  return cleaned;
}

/**
 * Formats postal code based on country
 */
export function formatPostalCode(
  postalCode: string,
  country: 'US' | 'CA' = 'US'
): string {
  if (!postalCode) return '';
  if (country === 'CA') return formatCanadianPostalCode(postalCode);
  return formatUSZip(postalCode);
}

/**
 * Detects country based on postal code format
 */
export function detectCountryFromPostalCode(
  postalCode: string
): 'US' | 'CA' | null {
  if (!postalCode.trim()) return null;
  if (isValidCanadianPostalCode(postalCode)) return 'CA';
  if (isValidUSZip(postalCode)) return 'US';
  return null;
}

/**
 * Validates full address object
 */
export interface AddressData {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: 'US' | 'CA';
}

export function validateAddress(address: Partial<AddressData>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!address.line1?.trim()) {
    errors.line1 = 'Street address is required';
  }

  if (!address.city?.trim()) {
    errors.city = 'City is required';
  }

  if (!address.state?.trim()) {
    errors.state = 'State/Province is required';
  } else if (address.country === 'US') {
    const stateCode = address.state.toUpperCase();
    if (!US_STATE_CODES.includes(stateCode)) {
      errors.state = 'Invalid US state code';
    }
  } else if (address.country === 'CA') {
    const provinceCode = address.state.toUpperCase();
    if (!CANADA_PROVINCE_CODES.includes(provinceCode)) {
      errors.state = 'Invalid Canadian province code';
    }
  }

  if (!address.postalCode?.trim()) {
    errors.postalCode = 'Postal/ZIP code is required';
  } else if (!isValidPostalCode(address.postalCode, address.country)) {
    const format = address.country === 'CA' ? 'A1A 1A1' : '12345 or 12345-6789';
    errors.postalCode = `Invalid postal code format. Expected: ${format}`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Parses a full address string into components (best effort)
 * Note: This is a simple parser. Google Places API is more reliable.
 */
export function parseAddressString(addressStr: string): Partial<AddressData> {
  // This is a placeholder for basic parsing
  // In real usage, rely on Google Places API or similar
  const parts = addressStr.split(',').map(p => p.trim());

  return {
    line1: parts[0] || '',
    city: parts[1] || '',
    state: parts[2]?.split(/\s+/)[0] || '',
    postalCode: parts[2]?.split(/\s+/).pop() || '',
  };
}

/**
 * Formats address object to readable string
 */
export function formatAddressToString(address: AddressData): string {
  const parts = [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.postalCode}`,
  ].filter(Boolean);
  return parts.join('\n');
}
