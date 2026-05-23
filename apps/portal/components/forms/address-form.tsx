'use client';

import React from 'react';
import { AddressInput } from '@/components/ui/address-input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Button } from '@/components/ui/button';
import type { AddressData } from '@/lib/address';

interface AddressFormProps {
  onSubmit?: (data: FormData) => Promise<void> | void;
  initialValues?: {
    fullName?: string;
    phone?: string;
    address?: Partial<AddressData>;
    country?: 'US' | 'CA';
  };
  submitLabel?: string;
  isLoading?: boolean;
  onSuccess?: () => void;
}

interface FormData {
  fullName: string;
  phone: string;
  address: Partial<AddressData>;
}

/**
 * Example form component using AddressInput and PhoneInput
 * Demonstrates proper integration and validation patterns
 */
export function AddressForm({
  onSubmit,
  initialValues,
  submitLabel = 'Save Address',
  isLoading = false,
  onSuccess,
}: AddressFormProps) {
  const [formData, setFormData] = React.useState<FormData>({
    fullName: initialValues?.fullName || '',
    phone: initialValues?.phone || '',
    address: initialValues?.address || {
      country: initialValues?.country || 'US',
    },
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isValidPhone, setIsValidPhone] = React.useState(false);
  const [isValidAddress, setIsValidAddress] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!isValidPhone) {
      newErrors.phone = 'Valid phone number is required';
    }

    if (!isValidAddress) {
      newErrors.address = 'Complete valid address is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit?.(formData);
      onSuccess?.();
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({
        submit: 'Failed to submit form. Please try again.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
          Full Name *
        </label>
        <input
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={(e) =>
            setFormData(prev => ({ ...prev, fullName: e.target.value }))
          }
          placeholder="John Doe"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          required
        />
        {errors.fullName && (
          <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
          Phone Number *
        </label>
        <PhoneInput
          id="phone"
          value={formData.phone}
          onChange={(e) =>
            setFormData(prev => ({ ...prev, phone: e.target.value }))
          }
          onValidChange={setIsValidPhone}
          country={formData.address.country as 'US' | 'CA' || 'US'}
          error={errors.phone}
          showError
        />
      </div>

      {/* Address */}
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-4">
          Delivery Address
        </h3>
        <AddressInput
          country={formData.address.country as 'US' | 'CA' || 'US'}
          value={formData.address}
          onAddressChange={(address, valid) => {
            setFormData(prev => ({ ...prev, address }));
            setIsValidAddress(valid);
          }}
          showError
        />
        {errors.address && (
          <p className="mt-2 text-sm text-red-500">{errors.address}</p>
        )}
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-700">{errors.submit}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}

export default AddressForm;
