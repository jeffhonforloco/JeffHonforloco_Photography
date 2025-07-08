// Input validation and sanitization utilities for security

interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  errors: string[];
}

class InputValidator {
  // Common dangerous patterns to check for
  private readonly DANGEROUS_PATTERNS = [
    // Script injection
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    // Event handlers
    /on\w+\s*=/gi,
    // JavaScript protocol
    /javascript:/gi,
    // Eval and function constructors
    /\beval\s*\(/gi,
    /\bFunction\s*\(/gi,
    // Data URIs with JavaScript
    /data:(?:text\/html|application\/javascript)/gi,
    // Import statements
    /\bimport\s+/gi,
    // SQL injection patterns
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    // Command injection
    /[;&|`$(){}]/g,
  ];

  // Email validation regex
  private readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // URL validation regex
  private readonly URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

  // Phone number regex (international format)
  private readonly PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

  /**
   * Sanitize HTML content by removing dangerous elements and attributes
   */
  sanitizeHtml(input: string): string {
    // Remove script tags and their content
    let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove dangerous attributes
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // Remove potentially dangerous tags
    const dangerousTags = ['script', 'object', 'embed', 'link', 'style', 'meta', 'iframe', 'frame', 'frameset'];
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    
    return sanitized.trim();
  }

  /**
   * Validate and sanitize general text input
   */
  validateText(input: string, options: {
    maxLength?: number;
    minLength?: number;
    allowHtml?: boolean;
    required?: boolean;
  } = {}): ValidationResult {
    const errors: string[] = [];
    let sanitized = input;

    // Check if required
    if (options.required && (!input || input.trim().length === 0)) {
      errors.push('This field is required');
      return { isValid: false, sanitized: '', errors };
    }

    // Check length constraints
    if (options.maxLength && input.length > options.maxLength) {
      errors.push(`Maximum length is ${options.maxLength} characters`);
    }

    if (options.minLength && input.length < options.minLength) {
      errors.push(`Minimum length is ${options.minLength} characters`);
    }

    // Check for dangerous patterns
    const hasDangerousContent = this.DANGEROUS_PATTERNS.some(pattern => pattern.test(input));
    if (hasDangerousContent) {
      errors.push('Invalid characters or content detected');
    }

    // Sanitize HTML if not allowed
    if (!options.allowHtml) {
      sanitized = this.sanitizeHtml(input);
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  }

  /**
   * Validate email address
   */
  validateEmail(email: string, required: boolean = false): ValidationResult {
    const errors: string[] = [];
    const sanitized = email.trim().toLowerCase();

    if (required && !sanitized) {
      errors.push('Email address is required');
      return { isValid: false, sanitized: '', errors };
    }

    if (sanitized && !this.EMAIL_REGEX.test(sanitized)) {
      errors.push('Please enter a valid email address');
    }

    // Check for dangerous patterns
    const hasDangerousContent = this.DANGEROUS_PATTERNS.some(pattern => pattern.test(sanitized));
    if (hasDangerousContent) {
      errors.push('Invalid email format detected');
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  }

  /**
   * Validate URL
   */
  validateUrl(url: string, required: boolean = false): ValidationResult {
    const errors: string[] = [];
    let sanitized = url.trim();

    if (required && !sanitized) {
      errors.push('URL is required');
      return { isValid: false, sanitized: '', errors };
    }

    if (sanitized && !this.URL_REGEX.test(sanitized)) {
      errors.push('Please enter a valid URL (must start with http:// or https://)');
    }

    // Ensure HTTPS for security
    if (sanitized && sanitized.startsWith('http://')) {
      errors.push('Only HTTPS URLs are allowed for security');
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  }

  /**
   * Validate phone number
   */
  validatePhone(phone: string, required: boolean = false): ValidationResult {
    const errors: string[] = [];
    // Remove common phone number formatting characters
    const sanitized = phone.replace(/[\s\-\(\)\+]/g, '');

    if (required && !sanitized) {
      errors.push('Phone number is required');
      return { isValid: false, sanitized: '', errors };
    }

    if (sanitized && !this.PHONE_REGEX.test(sanitized)) {
      errors.push('Please enter a valid phone number');
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string, options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
    required?: boolean;
  } = {}): ValidationResult {
    const errors: string[] = [];
    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecialChars = true,
      required = true
    } = options;

    if (required && !password) {
      errors.push('Password is required');
      return { isValid: false, sanitized: '', errors };
    }

    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'admin', 'letmein', 'welcome', 'monkey'];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('This password is too common, please choose a stronger one');
    }

    return {
      isValid: errors.length === 0,
      sanitized: password, // Don't sanitize passwords
      errors
    };
  }

  /**
   * Rate limiting checker
   */
  checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const key = `rate_limit_${identifier}`;
    const now = Date.now();
    
    try {
      const attempts = JSON.parse(localStorage.getItem(key) || '[]');
      
      // Filter out old attempts outside the window
      const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
      
      // Check if limit exceeded
      if (recentAttempts.length >= maxAttempts) {
        return false; // Rate limit exceeded
      }
      
      // Add current attempt
      recentAttempts.push(now);
      localStorage.setItem(key, JSON.stringify(recentAttempts));
      
      return true; // Within rate limit
    } catch {
      return true; // Allow if storage fails
    }
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string, sessionToken: string): boolean {
    return token === sessionToken && token.length === 64;
  }
}

export const inputValidator = new InputValidator();

// Export validation result type for use in components
export type { ValidationResult };