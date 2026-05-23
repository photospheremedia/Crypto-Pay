/**
 * Phone number formatting and validation utilities
 * Supports USA and Canadian phone numbers
 */

/**
 * Validates USA phone number (basic format check)
 * Accepts: 5551234567, 555-123-4567, (555) 123-4567, +1 555 123 4567
 */
export function isValidUSPhone(phone: string): boolean {
  // Extract only digits
  const digits = phone.replace(/\D/g, '');
  // Valid if 10 digits (area code + number) or 11 with leading 1
  if (digits.length === 10) return true;
  if (digits.length === 11 && digits[0] === '1') return true;
  return false;
}

/**
 * Validates Canadian phone number (same as USA, uses 1 country code)
 */
export function isValidCanadianPhone(phone: string): boolean {
  // Canadian phone numbers follow USA format (North American Numbering Plan)
  return isValidUSPhone(phone);
}

/**
 * Validates phone number for a given country
 */
export function isValidPhone(
  phone: string,
  country: 'US' | 'CA' = 'US'
): boolean {
  if (!phone.trim()) return false;
  return isValidUSPhone(phone); // Both US and CA use same format
}

/**
 * Formats phone number to (555) 123-4567 format
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  // Extract only digits
  const digits = phone.replace(/\D/g, '');

  // Remove leading 1 if present (North American format)
  const normalized = digits.length === 11 && digits[0] === '1'
    ? digits.slice(1)
    : digits;

  // Format as (555) 123-4567
  if (normalized.length === 10) {
    return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
  }

  // If not 10 digits, return cleaned input
  return digits;
}

/**
 * Extracts plain digits from phone number
 */
export function getPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Converts phone to international format
 * US/CA: +1 (555) 123-4567
 */
export function toInternationalFormat(phone: string): string {
  const digits = getPhoneDigits(phone);

  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return phone; // Return as-is if not valid format
}

/**
 * Detects country code from phone number
 */
export function detectCountryFromPhone(
  phone: string
): 'US' | 'CA' | null {
  // Both US and CA use +1 country code, so we can't distinguish
  // Typically you'd pass country separately or infer from address
  if (isValidPhone(phone)) return 'US'; // Default to US
  return null;
}

/**
 * Validates and formats phone input
 * Returns object with formatted value and validation result
 */
export function processPhoneInput(
  phone: string,
  country: 'US' | 'CA' = 'US'
): {
  formatted: string;
  valid: boolean;
  error?: string;
} {
  if (!phone.trim()) {
    return {
      formatted: '',
      valid: false,
      error: 'Phone number is required',
    };
  }

  if (!isValidPhone(phone, country)) {
    return {
      formatted: formatPhoneNumber(phone),
      valid: false,
      error: 'Phone number must be 10 digits (e.g., (555) 123-4567)',
    };
  }

  return {
    formatted: formatPhoneNumber(phone),
    valid: true,
  };
}

/**
 * Common area codes for validation context
 * Can use to provide hints/suggestions
 */
export const US_AREA_CODES = [
  // Major US area codes
  '201', '202', '203', '205', '206', '207', '208', '209',
  '212', '213', '214', '215', '216', '217', '218', '219',
  '301', '302', '303', '304', '305', '306', '307', '308', '309',
  '310', '312', '313', '314', '315', '316', '317', '318', '319',
  '401', '402', '403', '404', '405', '406', '407', '408', '409',
  '410', '412', '413', '414', '415', '416', '417', '418', '419',
  '501', '502', '503', '504', '505', '506', '507', '508', '509',
  '510', '512', '513', '514', '515', '516', '517', '518', '519',
  '601', '602', '603', '604', '605', '606', '607', '608', '609',
  '610', '612', '613', '614', '615', '616', '617', '618', '619',
  '701', '702', '703', '704', '705', '706', '707', '708', '709',
  '710', '712', '713', '714', '715', '716', '717', '718', '719',
  '801', '802', '803', '804', '805', '806', '807', '808', '809',
  '810', '812', '813', '814', '815', '816', '817', '818', '819',
  '901', '902', '903', '904', '905', '906', '907', '908', '909',
  '910', '912', '913', '914', '915', '916', '917', '918', '919',
];

/**
 * Validates area code (optional enhancement)
 */
export function isValidAreaCode(areaCode: string): boolean {
  return US_AREA_CODES.includes(areaCode.replace(/\D/g, ''));
}
