import React, { useState, useEffect } from 'react';
import { inputValidator, ValidationResult } from '../../lib/input-validation';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';

interface SecureFormProps {
  children: React.ReactNode;
  onSubmit: (data: Record<string, any>, csrfToken: string) => void;
  rateLimitKey?: string;
  className?: string;
}

interface FormErrors {
  [key: string]: string[];
}

export const SecureForm: React.FC<SecureFormProps> = ({
  children,
  onSubmit,
  rateLimitKey = 'default',
  className = ''
}) => {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);

  // Generate CSRF token on mount
  useEffect(() => {
    const token = inputValidator.generateCSRFToken();
    setCsrfToken(token);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check rate limit
    if (!inputValidator.checkRateLimit(rateLimitKey)) {
      setRateLimitExceeded(true);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data: Record<string, any> = {};
    const errors: FormErrors = {};

    // Validate each form field
    for (const [key, value] of formData.entries()) {
      if (key === 'csrf_token') continue; // Skip CSRF token validation here
      
      const stringValue = value.toString();
      let validation: ValidationResult;

      // Apply appropriate validation based on field name/type
      if (key.includes('email')) {
        validation = inputValidator.validateEmail(stringValue, true);
      } else if (key.includes('password')) {
        validation = inputValidator.validatePassword(stringValue);
      } else if (key.includes('url')) {
        validation = inputValidator.validateUrl(stringValue);
      } else if (key.includes('phone')) {
        validation = inputValidator.validatePhone(stringValue);
      } else {
        validation = inputValidator.validateText(stringValue, {
          maxLength: 1000,
          required: true
        });
      }

      if (!validation.isValid) {
        errors[key] = validation.errors;
      } else {
        data[key] = validation.sanitized;
      }
    }

    // Set form errors if any
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Clear previous errors
    setFormErrors({});
    setRateLimitExceeded(false);

    // Submit form with CSRF token
    onSubmit(data, csrfToken);
    
    // Generate new CSRF token for next submission
    setCsrfToken(inputValidator.generateCSRFToken());
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {/* CSRF Token */}
      <input type="hidden" name="csrf_token" value={csrfToken} />
      
      {/* Rate limit warning */}
      {rateLimitExceeded && (
        <Alert className="mb-4 border-red-600 bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            Too many attempts. Please wait 15 minutes before trying again.
          </AlertDescription>
        </Alert>
      )}

      {/* Form validation errors */}
      {Object.keys(formErrors).length > 0 && (
        <Alert className="mb-4 border-yellow-600 bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-300">
            <div className="space-y-1">
              <p className="font-medium">Please correct the following errors:</p>
              {Object.entries(formErrors).map(([field, errors]) => (
                <div key={field}>
                  <strong className="capitalize">{field.replace('_', ' ')}:</strong>
                  <ul className="ml-4 list-disc">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {children}
    </form>
  );
};