# Smart Address & Phone Form Components

Professional-grade address and phone input components with smart autocomplete, validation, and formatting for USA and Canada.

## Features

### 📍 AddressInput Component
- **Google Places Autocomplete** - Professional address suggestions (optional)
- **Smart Formatting** - Auto-formats postal codes
- **Multi-Country** - USA and Canada support with region-specific validation
- **Postal Code Validation**:
  - USA: 5-digit (12345) or ZIP+4 (12345-6789)
  - Canada: A1A 1A1 format
- **State/Province Validation** - Validates against valid codes
- **Fallback Mode** - Works without Google API (manual entry only)
- **Real-time Validation** - Shows errors on blur

### 📞 PhoneInput Component
- **Auto-Formatting** - Formats as user types: (555) 123-4567
- **Smart Input** - Only accepts digits, no manual punctuation needed
- **Validation** - USA/Canada (10-digit) phone numbers
- **Accessibility** - ARIA attributes, proper error messaging
- **Real-time Feedback** - Validates on input and blur

## Installation & Setup

### 1. Utilities (No Installation Needed)
Utilities are in:
- `/lib/address.ts` - Address validation & formatting
- `/lib/phone.ts` - Phone validation & formatting

### 2. Optional: Google Places API Setup

For smart address autocomplete, add your Google Places API key:

```bash
# .env.local or Vercel environment variables
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_api_key_here
```

**Without the API key**: AddressInput still works with manual entry - users can type addresses directly.

**Get an API key**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project
3. Enable "Places API"
4. Create an API key (Restricted to Places API)
5. Copy the key to `.env.local`

## Usage Examples

### Basic PhoneInput

```tsx
import { PhoneInput } from '@/components/ui/phone-input';
import { useState } from 'react';

export function ContactForm() {
  const [phone, setPhone] = useState('');
  const [isValid, setIsValid] = useState(false);

  return (
    <form>
      <label>Phone Number *</label>
      <PhoneInput
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        onValidChange={setIsValid}
        country="US" // 'US' or 'CA'
        placeholder="(555) 123-4567"
        showError
      />
      <button disabled={!isValid}>Submit</button>
    </form>
  );
}
```

### Basic AddressInput

```tsx
import { AddressInput } from '@/components/ui/address-input';
import { useState } from 'react';
import type { AddressData } from '@/lib/address';

export function DeliveryForm() {
  const [address, setAddress] = useState<Partial<AddressData>>({});
  const [isValid, setIsValid] = useState(false);

  return (
    <form>
      <AddressInput
        country="US"
        value={address}
        onAddressChange={(addr, valid) => {
          setAddress(addr);
          setIsValid(valid);
        }}
        showError
      />
      <button disabled={!isValid}>Deliver Here</button>
    </form>
  );
}
```

### Complete Address Form (Using Included Component)

```tsx
import { AddressForm } from '@/components/forms/address-form';

export function MyPage() {
  return (
    <AddressForm
      submitLabel="Save Address"
      onSubmit={async (data) => {
        console.log('Submitting:', data);
        // Save to database
      }}
      onSuccess={() => {
        // Redirect or show success message
      }}
    />
  );
}
```

### Using Utilities Directly

```tsx
import {
  formatPhoneNumber,
  isValidPhone,
  processPhoneInput,
} from '@/lib/phone';
import {
  formatPostalCode,
  isValidPostalCode,
  validateAddress,
  type AddressData,
} from '@/lib/address';

// Phone examples
const formatted = formatPhoneNumber('5551234567'); // "(555) 123-4567"
const isValid = isValidPhone('(555) 123-4567', 'US'); // true

const { valid, error } = processPhoneInput('5551234567', 'US');
console.log(valid); // true

// Address examples
const zipFormatted = formatPostalCode('12345', 'US'); // "12345"
const caPostalFormatted = formatPostalCode('a1a1a1', 'CA'); // "A1A 1A1"

const isValidZip = isValidPostalCode('12345', 'US'); // true
const isValidPostal = isValidPostalCode('M5V 3A8', 'CA'); // true

// Validate full address
const address: AddressData = {
  line1: '123 Main St',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  country: 'US',
};

const { valid, errors } = validateAddress(address);
console.log(valid); // true
console.log(errors); // {}
```

## Component Props

### PhoneInput Props

```typescript
interface PhoneInputProps {
  // Country for validation rules
  country?: 'US' | 'CA'; // default: 'US'

  // Callback when validity changes
  onValidChange?: (valid: boolean) => void;

  // Show/hide error messages
  showError?: boolean; // default: true

  // External error message
  error?: string;

  // All standard HTML input props (value, onChange, disabled, etc.)
  // value: string (raw digits)
  // onChange: triggered with raw digits
  // display shows formatted (555) 123-4567
}
```

### AddressInput Props

```typescript
interface AddressInputProps {
  // Country selector
  country?: 'US' | 'CA'; // default: 'US'

  // Callback with address and validity
  onAddressChange?: (address: Partial<AddressData>, valid: boolean) => void;

  // Pre-fill with values
  value?: Partial<AddressData>;

  // Show/hide error messages
  showError?: boolean; // default: true

  // Disable all fields
  disabled?: boolean;

  // Compact layout (single column)
  compact?: boolean;

  // CSS class
  className?: string;
}
```

## Validation Details

### Phone Numbers

- **USA/Canada**: 10-digit numbers (uses North American Numbering Plan)
- **Formats accepted**: 
  - `5551234567`
  - `(555) 123-4567`
  - `555-123-4567`
  - `+1 555 123 4567`
- **Output**: Formatted as `(555) 123-4567`
- **Stored as**: Raw digits (5551234567)

### Addresses - USA

| Field | Rules | Example |
|-------|-------|---------|
| **Street** | Required, max 160 chars | 123 Main Street |
| **City** | Required, 2-80 chars | New York |
| **State** | 2-char code (AL-WY, DC) | NY |
| **ZIP Code** | 5-digit or 5+4 | 10001 or 10001-1234 |

Valid state codes: AL, AK, AZ, ... WY, DC (see `US_STATE_CODES` in code)

### Addresses - Canada

| Field | Rules | Example |
|-------|-------|---------|
| **Street** | Required, max 160 chars | 123 Main Street |
| **City** | Required, 2-80 chars | Toronto |
| **Province** | 2-char code (AB-YT) | ON |
| **Postal Code** | A1A 1A1 format | M5V 3A8 |

Valid province codes: AB, BC, MB, NB, NL, NS, NT, NU, ON, PE, QC, SK, YT

## Advanced: Custom Styling

All components use Tailwind CSS and the existing UI component styles from your project.

### Customize PhoneInput

```tsx
<PhoneInput
  className="custom-class"
  // All standard input className props work
/>
```

### Customize AddressInput

```tsx
<AddressInput
  className="space-y-6" // Override spacing
  compact // Single-column layout
/>
```

## Testing Validation

### Test Phone Validation

```javascript
// In your tests
import { isValidPhone, formatPhoneNumber } from '@/lib/phone';

test('formats phone correctly', () => {
  expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
});

test('validates phone', () => {
  expect(isValidPhone('(555) 123-4567')).toBe(true);
  expect(isValidPhone('555')).toBe(false);
});
```

### Test Address Validation

```javascript
import { validateAddress } from '@/lib/address';

test('validates complete address', () => {
  const result = validateAddress({
    line1: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
  });

  expect(result.valid).toBe(true);
  expect(result.errors).toEqual({});
});

test('catches missing fields', () => {
  const result = validateAddress({
    city: 'New York',
    // missing line1, state, postalCode
    country: 'US',
  });

  expect(result.valid).toBe(false);
  expect(result.errors).toMatchObject({
    line1: expect.any(String),
    state: expect.any(String),
    postalCode: expect.any(String),
  });
});
```

## FAQ

### How do I store the data?

Phone and address data are validated before sending. Store in your database:

```typescript
// Phone - store as formatted string or raw digits
await supabase.from('profiles').update({
  phone: '(555) 123-4567', // or '5551234567'
});

// Address - store each field separately
await supabase.from('addresses').insert({
  line1: '123 Main St',
  line2: 'Apt 101',
  city: 'New York',
  state: 'NY',
  postal_code: '10001',
  country: 'US',
});
```

### Can I use without Google Places API?

Yes! AddressInput works perfectly without the API key. Users will manually type addresses instead of getting autocomplete suggestions. Both components function identically.

### How do I handle different countries?

Both components accept a `country` prop (`'US'` or `'CA'`). The components automatically:
- Format postal codes correctly
- Validate state/province codes
- Show appropriate field labels
- Accept country from a selector

```tsx
<AddressInput
  country={selectedCountry} // Toggle between 'US' and 'CA'
  // Rest of props...
/>
```

### Can I pre-fill with existing data?

Yes, both components accept `value` prop:

```tsx
<PhoneInput value={user.phone} />
<AddressInput value={user.address} />
```

### How do I customize error styles?

Error styling uses Tailwind and integrates with your design system. Edit the component classes or override with CSS:

```tsx
<PhoneInput className="my-custom-input" />
```

## Performance Notes

- **PhoneInput**: Lightweight, O(1) formatting
- **AddressInput**: 
  - Without API key: Very fast (manual input only)
  - With API key: Google Places API calls are debounced (~300ms delay)
  - Suggestions cached per user session

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- iOS/Android native inputs supported
- PhoneInput uses `inputMode="numeric"` for better mobile UX

## Accessibility

- Full ARIA support (`aria-invalid`, `aria-describedby`)
- Proper labels and error messaging
- Keyboard navigation for suggestions
- Screen reader friendly

## Related Files

- **Components**: 
  - `/components/ui/phone-input.tsx`
  - `/components/ui/address-input.tsx`
  - `/components/forms/address-form.tsx` (complete example)
- **Utilities**:
  - `/lib/phone.ts`
  - `/lib/address.ts`
- **Documentation**: This file

---

**Need help?** Check the examples in `/components/forms/address-form.tsx` or review the inline documentation in the component files.
