'use client';

import * as React from 'react';
import { formatPhoneNumber, isValidPhone, processPhoneInput } from '@/lib/phone';
import { cn } from '@/lib/utils';

interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  country?: 'US' | 'CA';
  onValidChange?: (valid: boolean) => void;
  showError?: boolean;
  error?: string;
}

/**
 * Smart phone number input component
 * - Auto-formats as user types: (555) 123-4567
 * - Validates USA/Canada phone numbers
 * - Provides feedback on validity
 */
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      country = 'US',
      onValidChange,
      showError = true,
      error: externalError,
      onChange,
      value,
      disabled,
      className,
      placeholder = '(555) 123-4567',
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState<string>(
      typeof value === 'string' ? value : ''
    );
    const [error, setError] = React.useState<string>('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Sync external value changes
    React.useEffect(() => {
      if (typeof value === 'string' && value !== displayValue) {
        setDisplayValue(value);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;

      // Allow typing in progress
      if (input.length === 0) {
        setDisplayValue('');
        setError('');
        onValidChange?.(false);
        onChange?.(e);
        return;
      }

      // Extract digits and format
      const digits = input.replace(/\D/g, '');

      // Allow progressive typing up to 11 digits
      if (digits.length > 11) {
        return; // Prevent over-typing
      }

      // Format for display
      const formatted = formatPhoneNumber(digits);
      setDisplayValue(formatted);

      // Validate and provide feedback
      const { valid, error: validationError } = processPhoneInput(input, country);

      if (!valid && digits.length > 0) {
        setError(validationError || '');
        onValidChange?.(false);
      } else {
        setError('');
        onValidChange?.(valid);
      }

      // Pass raw digits to onChange (not formatted)
      const changeEvent = {
        ...e,
        target: {
          ...e.target,
          value: digits,
        },
      };
      onChange?.(changeEvent as React.ChangeEvent<HTMLInputElement>);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value && !isValidPhone(value, country)) {
        setError(`Invalid phone number. Use format: (555) 123-4567`);
        onValidChange?.(false);
      } else {
        setError('');
        onValidChange?.(true);
      }
      props.onBlur?.(e);
    };

    const isInvalid = !!(externalError || (error && displayValue));

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

    return (
      <div className="w-full">
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          disabled={disabled}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          {...(isInvalid && { 'aria-invalid': 'true' })}
          aria-describedby={isInvalid ? 'phone-error' : undefined}
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            isInvalid && 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            className
          )}
          {...props}
        />
        {showError && (externalError || error) && (
          <p id="phone-error" className="mt-1 text-xs text-destructive">
            {externalError || error}
          </p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
