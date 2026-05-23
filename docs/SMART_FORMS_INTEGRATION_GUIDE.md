/**
 * Example: Integration with Existing Signup Form
 * 
 * Shows how to replace existing address/phone inputs with smart components
 * Minimal changes needed to integrate
 */

// Before: Your current signup form pattern
// ==========================================

// This is what you probably have now:
function OldSignupForm() {
  const [formData, setFormData] = useState({
    phone: '',
    address_line1: '',
    city: '',
    state: '',
    postal_code: '',
  });

  return (
    <form>
      {/* Old phone input - no formatting */}
      <input
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        placeholder="+1 (555) 123-4567"
      />

      {/* Old address inputs - no validation */}
      <input
        type="text"
        value={formData.address_line1}
        onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
        placeholder="123 Main St"
      />
      {/* ... more manual fields ... */}
    </form>
  );
}

// After: Using Smart Components
// ===============================

import { PhoneInput } from '@/components/ui/phone-input';
import { AddressInput } from '@/components/ui/address-input';
import type { AddressData } from '@/lib/address';

function NewSignupForm() {
  const [formData, setFormData] = useState({
    phone: '',
    address: {} as Partial<AddressData>,
    country: 'US' as const,
  });

  const [isValid, setIsValid] = useState({
    phone: false,
    address: false,
  });

  return (
    <form>
      {/* New phone input - auto-formats + validates */}
      <div>
        <label>Phone Number *</label>
        <PhoneInput
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          onValidChange={(valid) => setIsValid(prev => ({ ...prev, phone: valid }))}
          country={formData.country}
          showError
        />
      </div>

      {/* New address input - smart autocomplete + validation */}
      <div>
        <label>Delivery Address *</label>
        <AddressInput
          country={formData.country}
          value={formData.address}
          onAddressChange={(address, valid) => {
            setFormData(prev => ({ ...prev, address }));
            setIsValid(prev => ({ ...prev, address: valid }));
          }}
          showError
        />
      </div>

      <button
        type="submit"
        disabled={!isValid.phone || !isValid.address}
      >
        Continue
      </button>
    </form>
  );
}

// Minimal Changes Example
// ========================
// If you want to keep using the same form structure, here's how:

function PartialMigration() {
  const [formData, setFormData] = useState({
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  });

  // Just replace phone input
  return (
    <form>
      <PhoneInput
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        country={formData.country as 'US' | 'CA'}
      />

      {/* Keep your existing address fields, but add autocomplete */}
      <AddressInput
        country={formData.country as 'US' | 'CA'}
        onAddressChange={(address) => {
          setFormData(prev => ({
            ...prev,
            address_line1: address.line1 || prev.address_line1,
            address_line2: address.line2 || prev.address_line2,
            city: address.city || prev.city,
            state: address.state || prev.state,
            postal_code: address.postalCode || prev.postal_code,
          }));
        }}
      />
    </form>
  );
}

// Using with Existing ProfileForm Component
// ============================================

import { formatPhoneNumber } from '@/lib/phone';
import { formatPostalCode } from '@/lib/address';

export function ProfileForm({ user, profile }: ProfileFormProps) {
  // ... existing state setup ...

  return (
    <form>
      {/* Replace your current phone input */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
          <Phone className="inline h-4 w-4 mr-1" />
          Phone Number
        </label>
        {/* OLD: just a dumb input */}
        {/* <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="..."
          placeholder="+1 (555) 000-0000"
        /> */}

        {/* NEW: Smart phone input */}
        <PhoneInput
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          country={formData.country as 'US' | 'CA'}
          onValidChange={(valid) => {
            // Optional: use this to disable submit button
            console.log('Phone valid:', valid);
          }}
          showError
        />
      </div>

      {/* Replace address inputs section */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 mt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-slate-600" />
          Primary Address
        </h3>

        {/* OLD: Manual address fields
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="address_line1" className="block text-sm font-medium text-slate-700 mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              id="address_line1"
              value={formData.address_line1}
              onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
              className="..."
              placeholder="Street address"
            />
          </div>
          {/* ... more fields ... */}
        // </div> */}

        {/* NEW: Smart address input */}
        <AddressInput
          country={formData.country as 'US' | 'CA'}
          value={{
            line1: formData.address_line1,
            line2: formData.address_line2,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postal_code,
            country: formData.country as 'US' | 'CA',
          }}
          onAddressChange={(address) => {
            setFormData(prev => ({
              ...prev,
              address_line1: address.line1 || '',
              address_line2: address.line2 || '',
              city: address.city || '',
              state: address.state || '',
              postal_code: address.postalCode || '',
            }));
          }}
          showError
        />
      </div>

      {/* Rest of your form... */}
    </form>
  );
}

// API Endpoint Example
// ====================
// When submitting the form, you might have validation on the backend

export async function POST(req: Request) {
  const body = await req.json();
  const { phone, address } = body;

  // Validate on server side too
  const { valid: phoneValid } = processPhoneInput(phone, address.country);
  const { valid: addressValid } = validateAddress(address);

  if (!phoneValid || !addressValid) {
    return Response.json(
      { error: 'Invalid phone or address' },
      { status: 400 }
    );
  }

  // Store formatted data
  const formattedPhone = formatPhoneNumber(phone);
  const formattedPostalCode = formatPostalCode(address.postalCode, address.country);

  // Save to database
  // ...

  return Response.json({ success: true });
}

// Step-by-Step Migration Checklist
// ==================================
// 1. [ ] Copy /lib/phone.ts to your project (or create it)
// 2. [ ] Copy /lib/address.ts to your project (or create it)
// 3. [ ] Copy /components/ui/phone-input.tsx
// 4. [ ] Copy /components/ui/address-input.tsx
// 5. [ ] Add NEXT_PUBLIC_GOOGLE_PLACES_API_KEY to .env.local (optional)
// 6. [ ] Replace phone inputs with <PhoneInput />
// 7. [ ] Replace address field groups with <AddressInput />
// 8. [ ] Test form submission and validation
// 9. [ ] Update form state to handle address object
// 10. [ ] Test on mobile for better UX
