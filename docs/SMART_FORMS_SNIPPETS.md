/**
 * Quick Reference: Smart Forms Components
 * Copy-paste snippets for common use cases
 */

// ============================================
// 1. JUST PHONE INPUT
// ============================================

// Simplest usage
import { PhoneInput } from '@/components/ui/phone-input';

function SimplePhoneForm() {
  const [phone, setPhone] = useState('');

  return (
    <PhoneInput
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
      placeholder="(555) 123-4567"
    />
  );
}

// With validation callback
function PhoneFormWithValidation() {
  const [phone, setPhone] = useState('');
  const [isValid, setIsValid] = useState(false);

  return (
    <>
      <PhoneInput
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        onValidChange={setIsValid}
        showError
      />
      <button disabled={!isValid}>Submit</button>
    </>
  );
}

// ============================================
// 2. JUST ADDRESS INPUT
// ============================================

import { AddressInput } from '@/components/ui/address-input';
import type { AddressData } from '@/lib/address';

function SimpleAddressForm() {
  const [address, setAddress] = useState<Partial<AddressData>>({});

  return (
    <AddressInput
      country="US"
      value={address}
      onAddressChange={(addr) => setAddress(addr)}
    />
  );
}

// With validation
function AddressFormWithValidation() {
  const [address, setAddress] = useState<Partial<AddressData>>({});
  const [isValid, setIsValid] = useState(false);

  return (
    <>
      <AddressInput
        country="US"
        value={address}
        onAddressChange={(addr, valid) => {
          setAddress(addr);
          setIsValid(valid);
        }}
        showError
      />
      <button disabled={!isValid}>Continue</button>
    </>
  );
}

// ============================================
// 3. BOTH PHONE + ADDRESS
// ============================================

function CompleteForm() {
  const [data, setData] = useState({
    phone: '',
    address: {} as Partial<AddressData>,
  });
  const [isValid, setIsValid] = useState({ phone: false, address: false });

  const canSubmit = isValid.phone && isValid.address;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        // Submit data...
      }}
    >
      <h2>Contact Information</h2>

      <PhoneInput
        value={data.phone}
        onChange={(e) => setData(prev => ({ ...prev, phone: e.target.value }))}
        onValidChange={(valid) =>
          setIsValid(prev => ({ ...prev, phone: valid }))
        }
        showError
      />

      <h2>Delivery Address</h2>

      <AddressInput
        country="US"
        value={data.address}
        onAddressChange={(addr, valid) => {
          setData(prev => ({ ...prev, address: addr }));
          setIsValid(prev => ({ ...prev, address: valid }));
        }}
        showError
      />

      <button type="submit" disabled={!canSubmit}>
        Submit Order
      </button>
    </form>
  );
}

// ============================================
// 4. WITH COUNTRY TOGGLE
// ============================================

function InternationalForm() {
  const [country, setCountry] = useState<'US' | 'CA'>('US');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState<Partial<AddressData>>({});

  return (
    <>
      <select value={country} onChange={(e) => setCountry(e.target.value as 'US' | 'CA')}>
        <option value="US">United States</option>
        <option value="CA">Canada</option>
      </select>

      <PhoneInput
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        country={country}
      />

      <AddressInput
        country={country}
        value={address}
        onAddressChange={(addr) => setAddress(addr)}
      />
    </>
  );
}

// ============================================
// 5. UTILITY FUNCTIONS ONLY (No Components)
// ============================================

import { formatPhoneNumber, isValidPhone } from '@/lib/phone';
import { formatPostalCode, validateAddress } from '@/lib/address';

function UtilityExample() {
  // Format phone
  const formatted = formatPhoneNumber('5551234567');
  console.log(formatted); // "(555) 123-4567"

  // Validate phone
  const phoneOk = isValidPhone('(555) 123-4567');
  console.log(phoneOk); // true

  // Format postal code
  const zip = formatPostalCode('12345', 'US');
  const postal = formatPostalCode('a1a1a1', 'CA');
  console.log(zip, postal); // "12345", "A1A 1A1"

  // Validate address
  const { valid, errors } = validateAddress({
    line1: '123 Main',
    city: 'NYC',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
  });
  console.log(valid, errors); // true, {}
}

// ============================================
// 6. IN AN EXISTING FORM (Minimal Changes)
// ============================================

function UpdateExistingForm() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '', // Change: now accepts raw digits, displays formatted
    address_line1: '', // Change: can be populated from AddressInput
    city: '',
    state: '',
    postal_code: '', // Change: auto-formatted
    country: 'US',
  });

  return (
    <form>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />

      {/* CHANGED: Use PhoneInput instead of plain input */}
      <PhoneInput
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        country={formData.country as 'US' | 'CA'}
      />

      {/* CHANGED: Use AddressInput instead of 4 separate fields */}
      <AddressInput
        country={formData.country as 'US' | 'CA'}
        value={{
          line1: formData.address_line1,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postal_code,
          country: formData.country as 'US' | 'CA',
        }}
        onAddressChange={(addr) => {
          setFormData(prev => ({
            ...prev,
            address_line1: addr.line1 || '',
            city: addr.city || '',
            state: addr.state || '',
            postal_code: addr.postalCode || '',
          }));
        }}
      />

      <button type="submit">Save</button>
    </form>
  );
}

// ============================================
// 7. IN A MODAL/DIALOG
// ============================================

import { Dialog, DialogContent } from '@/components/ui/dialog';

function ModalWithAddressForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [address, setAddress] = useState<Partial<AddressData>>({});
  const [isValid, setIsValid] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Add Address</button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <h2>Add New Address</h2>

          <AddressInput
            country="US"
            value={address}
            onAddressChange={(addr, valid) => {
              setAddress(addr);
              setIsValid(valid);
            }}
            showError
          />

          <div className="flex gap-2">
            <button onClick={() => setIsOpen(false)}>Cancel</button>
            <button
              disabled={!isValid}
              onClick={() => {
                // Save address...
                setIsOpen(false);
              }}
            >
              Save Address
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================
// 8. WITH SERVER SUBMISSION
// ============================================

import { useTransition } from 'react';

function FormWithServerAction() {
  const [isPending, startTransition] = useTransition();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState<Partial<AddressData>>({});

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const res = await fetch('/api/save-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, address }),
      });

      if (!res.ok) {
        console.error('Failed to save');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <PhoneInput
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <AddressInput
        country="US"
        value={address}
        onAddressChange={(addr) => setAddress(addr)}
      />

      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}

// ============================================
// 9. TESTING EXAMPLES
// ============================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';

describe('PhoneInput', () => {
  it('formats phone as user types', () => {
    const { getByDisplayValue } = render(
      <PhoneInput value="" onChange={() => {}} />
    );
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '5551234567' } });

    await waitFor(() => {
      expect(input).toHaveValue('(555) 123-4567');
    });
  });
});

describe('AddressInput', () => {
  it('validates required fields', async () => {
    const handleChange = jest.fn();
    render(
      <AddressInput
        country="US"
        onAddressChange={handleChange}
        showError
      />
    );

    const submitBtn = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitBtn);

    // Expect validation errors
    expect(screen.getByText(/street address is required/i)).toBeInTheDocument();
  });
});

// ============================================
// 10. ENVIRONMENT SETUP
// ============================================

/*
Add to your .env.local:

# Required files (all should exist):
# /lib/phone.ts
# /lib/address.ts
# /components/ui/phone-input.tsx
# /components/ui/address-input.tsx

# Optional - for Google Places autocomplete:
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_key_here

# Without the API key, AddressInput still works (just no autocomplete)
*/
