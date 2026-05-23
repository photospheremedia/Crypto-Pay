# Smart Address & Phone Forms Implementation ✅

Your Restaurant Hub Solution now has professional-grade address and phone input components with smart autocomplete, validation, and formatting for USA and Canada.

## What You Got

### 📦 New Files Created

**Utility Libraries:**
- ✅ `/lib/phone.ts` - Phone number validation & formatting
- ✅ `/lib/address.ts` - Address validation & formatting with postal code rules

**React Components:**
- ✅ `/components/ui/phone-input.tsx` - Smart phone input (auto-formats, validates)
- ✅ `/components/ui/address-input.tsx` - Smart address input (Google Places autocomplete + manual entry)
- ✅ `/components/forms/address-form.tsx` - Complete example form using both

**Documentation:**
- ✅ `/docs/SMART_ADDRESS_PHONE_FORMS.md` - Comprehensive guide with examples
- ✅ `/docs/SMART_FORMS_SETUP.md` - Quick setup reference
- ✅ `/docs/SMART_FORMS_INTEGRATION_GUIDE.md` - Step-by-step integration with existing forms
- ✅ `/docs/SMART_FORMS_SNIPPETS.md` - Copy-paste code snippets for common use cases

## Key Features

### 📞 PhoneInput Component
```tsx
<PhoneInput
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  country="US" // or "CA"
  onValidChange={(valid) => setCanSubmit(valid)}
  showError
/>
```

**Features:**
- ✅ Auto-formats as user types: 5551234567 → (555) 123-4567
- ✅ USA/Canada phone validation (10-digit numbers)
- ✅ Real-time validation feedback
- ✅ Mobile-friendly (`inputMode="numeric"`)
- ✅ Accessible (ARIA attributes)

### 📍 AddressInput Component
```tsx
<AddressInput
  country="US" // or "CA"
  value={address}
  onAddressChange={(addr, valid) => handleAddressChange(addr, valid)}
  showError
/>
```

**Features:**
- ✅ Google Places API integration (optional autocomplete)
- ✅ Manual address entry fallback (works without API key)
- ✅ Smart postal code formatting:
  - USA: 12345 or 12345-6789
  - Canada: A1A 1A1
- ✅ State/Province validation
- ✅ Real-time error messages
- ✅ Country toggling (US ↔ Canada)

## Quick Start

### 1. Use in Your Forms (3 lines of code)

```tsx
import { PhoneInput } from '@/components/ui/phone-input';
import { AddressInput } from '@/components/ui/address-input';

function MyForm() {
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState({});

  return (
    <form>
      <PhoneInput value={phone} onChange={(e) => setPhone(e.target.value)} />
      <AddressInput value={address} onAddressChange={(a) => setAddress(a)} />
    </form>
  );
}
```

### 2. Optional: Enable Google Places Autocomplete

Add to `.env.local`:
```
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_api_key_here
```

Without this key, AddressInput still works perfectly—just with manual entry instead of autocomplete suggestions.

### 3. Use Utilities Directly (If You Want)

```tsx
import { formatPhoneNumber, isValidPhone } from '@/lib/phone';
import { formatPostalCode, validateAddress } from '@/lib/address';

// Format
formatPhoneNumber('5551234567'); // "(555) 123-4567"
formatPostalCode('a1a1a1', 'CA'); // "A1A 1A1"

// Validate
isValidPhone('(555) 123-4567'); // true
const { valid, errors } = validateAddress({...}); // Check address
```

## Integration with Existing Forms

Your existing forms need minimal changes. Here's an example:

### Before (Old Pattern)
```tsx
<input
  type="tel"
  value={formData.phone}
  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
  placeholder="+1 (555) 123-4567"
/>

<input type="text" placeholder="Street address" />
<input type="text" placeholder="City" />
<input type="text" placeholder="State" />
<input type="text" placeholder="ZIP" />
```

### After (Smart Components)
```tsx
<PhoneInput
  value={formData.phone}
  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
/>

<AddressInput
  value={formData.address}
  onAddressChange={(addr) => setFormData({ ...formData, address: addr })}
/>
```

That's it! You get validation, formatting, and autocomplete automatically.

## Supported Formats

### Phone Numbers
- **Both USA & Canada**: 10-digit numbers (North American Numbering Plan)
- **Input accepts**: 5551234567, (555) 123-4567, 555-123-4567, +1 555 123 4567
- **Auto-formats to**: (555) 123-4567
- **Stored as**: Raw digits (5551234567) or formatted—your choice

### Postal Codes

**USA:**
- Format: 5-digit (12345) or ZIP+4 (12345-6789)
- Example: 10001 or 10001-1234

**Canada:**
- Format: A1A 1A1 (alphanumeric)
- Example: M5V 3A8
- Auto-converts lowercase to uppercase

### States & Provinces

**USA:** 2-letter codes (AL, AK, AZ, ..., WY, DC)
**Canada:** 2-letter codes (AB, BC, MB, ..., YT)

## Validation Details

### What Gets Validated

**Phone:**
- Required field
- Must be 10 digits (mobile/landline)
- No validation on format (accepts any 10-digit combo)

**Address:**
- Street address required (max 160 chars)
- City required (2-80 chars)
- State/Province required (valid code check)
- Postal code required + format validation

**Postal Code:**
- USA: 5 or 5+4 digits only
- Canada: Must match A1A 1A1 pattern

## Best Practices

1. **Store Phone Smartly**
   ```typescript
   // Option A: Store formatted
   phone: "(555) 123-4567"
   
   // Option B: Store raw digits (recommended for API)
   phone: "5551234567"
   
   // Both work—choose what your API expects
   ```

2. **Store Address Smartly**
   ```typescript
   // Store each field separately (recommended)
   address_line1: "123 Main St"
   address_line2: "Apt 101"
   city: "New York"
   state: "NY"
   postal_code: "10001"
   country: "US"
   ```

3. **Validation Flow**
   ```
   User Input → Auto-format → Real-time Validation → Error Messages
   ```

4. **Mobile First**
   - PhoneInput uses `inputMode="numeric"` for better mobile keyboard
   - Both components fully touch-friendly
   - Suggestion dropdown works on all devices

## Files to Review

**For Implementation Details:**
- `/components/ui/phone-input.tsx` - Component implementation
- `/components/ui/address-input.tsx` - Component with Google Places integration
- `/lib/phone.ts` - All phone validation logic
- `/lib/address.ts` - All address validation logic

**For Usage Examples:**
- `/components/forms/address-form.tsx` - Complete working example
- `/docs/SMART_FORMS_SNIPPETS.md` - Copy-paste snippets
- `/docs/SMART_FORMS_INTEGRATION_GUIDE.md` - Step-by-step integration

## Testing Your Setup

### Quick Test 1: PhoneInput Formatting
```tsx
import { PhoneInput } from '@/components/ui/phone-input';

export default function TestPage() {
  const [phone, setPhone] = useState('');
  return (
    <div>
      <PhoneInput
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <p>Raw value: {phone}</p>
    </div>
  );
}
```

**Test:** Type 5551234567 → Should display (555) 123-4567

### Quick Test 2: AddressInput Validation
```tsx
import { AddressInput } from '@/components/ui/address-input';

export default function TestPage() {
  const [address, setAddress] = useState({});
  const [valid, setValid] = useState(false);

  return (
    <div>
      <AddressInput
        onAddressChange={(addr, v) => {
          setAddress(addr);
          setValid(v);
        }}
        showError
      />
      <p>Valid: {valid ? '✅' : '❌'}</p>
    </div>
  );
}
```

**Test:** Try incomplete address → Should show "required" errors

## Common Questions

**Q: Do I need Google Places API?**
A: No! It's optional. Without it, AddressInput works fine with manual entry. With it, users get smart autocomplete.

**Q: How do I change validation rules?**
A: Edit `/lib/address.ts` and `/lib/phone.ts`. Validation logic is all there, clearly commented.

**Q: Can I customize the styling?**
A: Yes! Components use Tailwind CSS. You can pass `className` to override styles or edit the components directly.

**Q: How do I store this in my database?**
A: Store each address field separately in your database. Store phone as either formatted string or raw digits—whatever your API expects.

**Q: What about international numbers?**
A: Currently supports USA and Canada only. To add more countries, extend `/lib/phone.ts` with additional validation patterns.

## Next Steps

1. ✅ **Review** `/docs/SMART_ADDRESS_PHONE_FORMS.md` for full documentation
2. ✅ **Try** `/components/forms/address-form.tsx` in your app
3. ✅ **Integrate** into your existing forms (see `/docs/SMART_FORMS_INTEGRATION_GUIDE.md`)
4. ✅ **Test** on mobile to verify UX
5. ✅ **Customize** styling/validation as needed

## Support

All components are:
- ✅ Fully typed with TypeScript
- ✅ Accessible (ARIA, keyboard nav)
- ✅ Mobile-friendly
- ✅ Production-ready
- ✅ Well-documented with inline comments

See the docs folder for detailed guides and examples!

---

**Components Status:** ✅ Ready to use
**Performance:** ✅ Optimized (lightweight formatting)
**Accessibility:** ✅ Full ARIA support
**Mobile:** ✅ Touch-optimized
**TypeScript:** ✅ Fully typed
