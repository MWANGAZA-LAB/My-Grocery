/**
 * Input validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate list name
 */
export function validateListName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'List name is required' };
  }
  
  if (name.trim().length < 1) {
    return { isValid: false, error: 'List name must be at least 1 character' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: 'List name must be less than 100 characters' };
  }
  
  // Basic XSS prevention - no HTML tags
  if (/<[^>]*>/g.test(name)) {
    return { isValid: false, error: 'List name cannot contain HTML tags' };
  }
  
  return { isValid: true };
}

/**
 * Validate item text
 */
export function validateItemText(text: string): ValidationResult {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: 'Item name is required' };
  }
  
  if (text.length > 200) {
    return { isValid: false, error: 'Item name must be less than 200 characters' };
  }
  
  // Basic XSS prevention
  if (/<[^>]*>/g.test(text)) {
    return { isValid: false, error: 'Item name cannot contain HTML tags' };
  }
  
  return { isValid: true };
}

/**
 * Validate quantity
 */
export function validateQuantity(quantity: string): ValidationResult {
  if (!quantity) {
    return { isValid: true }; // Quantity is optional
  }
  
  if (quantity.length > 50) {
    return { isValid: false, error: 'Quantity must be less than 50 characters' };
  }
  
  return { isValid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
}

/**
 * Sanitize string input (removes potential XSS)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}
