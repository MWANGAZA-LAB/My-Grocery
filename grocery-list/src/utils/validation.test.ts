import { describe, it, expect } from 'vitest';
import { 
  validateListName, 
  validateItemText, 
  validateQuantity, 
  validateEmail,
  sanitizeInput 
} from './validation';

describe('validateListName', () => {
  it('should return valid for a normal list name', () => {
    const result = validateListName('My Grocery List');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return invalid for empty string', () => {
    const result = validateListName('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('List name is required');
  });

  it('should return invalid for whitespace only', () => {
    const result = validateListName('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('List name is required');
  });

  it('should return invalid for list name over 100 characters', () => {
    const longName = 'a'.repeat(101);
    const result = validateListName(longName);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('List name must be less than 100 characters');
  });

  it('should return valid for list name exactly 100 characters', () => {
    const name = 'a'.repeat(100);
    const result = validateListName(name);
    expect(result.isValid).toBe(true);
  });

  it('should return invalid for list name containing HTML tags', () => {
    const result = validateListName('<script>alert("xss")</script>');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('List name cannot contain HTML tags');
  });

  it('should return valid for list name with special characters', () => {
    const result = validateListName("Mom's Shopping List! @Home");
    expect(result.isValid).toBe(true);
  });
});

describe('validateItemText', () => {
  it('should return valid for a normal item text', () => {
    const result = validateItemText('Milk');
    expect(result.isValid).toBe(true);
  });

  it('should return invalid for empty string', () => {
    const result = validateItemText('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Item name is required');
  });

  it('should return invalid for item text over 200 characters', () => {
    const longText = 'a'.repeat(201);
    const result = validateItemText(longText);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Item name must be less than 200 characters');
  });

  it('should return invalid for item text containing HTML', () => {
    const result = validateItemText('<b>Bold Item</b>');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Item name cannot contain HTML tags');
  });
});

describe('validateQuantity', () => {
  it('should return valid for empty quantity (optional)', () => {
    const result = validateQuantity('');
    expect(result.isValid).toBe(true);
  });

  it('should return valid for a normal quantity', () => {
    const result = validateQuantity('2 lbs');
    expect(result.isValid).toBe(true);
  });

  it('should return invalid for quantity over 50 characters', () => {
    const longQty = 'a'.repeat(51);
    const result = validateQuantity(longQty);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Quantity must be less than 50 characters');
  });
});

describe('validateEmail', () => {
  it('should return valid for a valid email', () => {
    const result = validateEmail('test@example.com');
    expect(result.isValid).toBe(true);
  });

  it('should return invalid for empty email', () => {
    const result = validateEmail('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Email is required');
  });

  it('should return invalid for email without @', () => {
    const result = validateEmail('testexample.com');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a valid email address');
  });

  it('should return invalid for email without domain', () => {
    const result = validateEmail('test@');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a valid email address');
  });

  it('should return invalid for email without TLD', () => {
    const result = validateEmail('test@example');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a valid email address');
  });

  it('should return valid for email with subdomain', () => {
    const result = validateEmail('user@mail.example.com');
    expect(result.isValid).toBe(true);
  });
});

describe('sanitizeInput', () => {
  it('should escape HTML characters', () => {
    const result = sanitizeInput('<script>alert("xss")</script>');
    expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('should trim whitespace', () => {
    const result = sanitizeInput('  hello world  ');
    expect(result).toBe('hello world');
  });

  it('should escape quotes', () => {
    const result = sanitizeInput("It's a \"test\"");
    expect(result).toBe("It&#039;s a &quot;test&quot;");
  });

  it('should handle normal text without changes except trimming', () => {
    const result = sanitizeInput('Normal text here');
    expect(result).toBe('Normal text here');
  });
});
