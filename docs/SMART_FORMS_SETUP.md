// Quick setup example for using AddressInput and PhoneInput

// 1. Import the components
import { AddressInput } from '@/components/ui/address-input';
import { PhoneInput } from '@/components/ui/phone-input';

// 2. Use in your form
export function MyForm() {
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState<Partial<AddressData>>({});

  return (
    <form>
      {/* Phone Input - Auto-formats as user types */}
      <PhoneInput
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="(555) 123-4567"
        country="US" // or "CA"
        onValidChange={(valid) => console.log('Phone valid:', valid)}
        showError
      />

      {/* Address Input - Smart autocomplete + validation */}
      <AddressInput
        country="US" // or "CA"
        value={address}
        onAddressChange={(addr, valid) => {
          setAddress(addr);
          console.log('Address valid:', valid);
        }}
        showError
      />
    </form>
  );
}

// 3. Use utility functions directly
import {
  formatPhoneNumber,
  isValidPhone,
  formatPostalCode,
  isValidPostalCode,
  validateAddress,
} from '@/lib/address';
import { formatPhoneNumber, isValidPhone } from '@/lib/phone';

// Format phone as user types
const formatted = formatPhoneNumber('5551234567'); // (555) 123-4567

// Validate input
const isValid = isValidPhone('(555) 123-4567'); // true

// Validate address
const validation = validateAddress({
  line1: '123 Main St',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  country: 'US',
});
console.log(validation.valid, validation.errors);

// 4. Google Places API Setup (Optional)
// Add to your .env.local or Vercel environment:
// NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_api_key_here
//
// Without this key, AddressInput still works with manual entry
// With it, users get smart autocomplete suggestions
