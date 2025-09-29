import bcrypt from "bcryptjs";
import { env } from "../env";

/**
 * Password security utilities with hospital-grade security requirements
 */

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbiddenPatterns: RegExp[];
}

// Hospital-grade password policy
export const PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbiddenPatterns: [
    /password/i,
    /admin/i,
    /hospital/i,
    /medcare/i,
    /123456/,
    /qwerty/i,
    /(.)\1{3,}/, // Repeated characters
  ],
};

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

/**
 * Validates password against hospital security policy
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  
  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters long`);
  }
  
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (PASSWORD_POLICY.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (PASSWORD_POLICY.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  for (const pattern of PASSWORD_POLICY.forbiddenPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains forbidden patterns or common words');
      break;
    }
  }
  
  const strength = calculatePasswordStrength(password);
  
  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Calculates password strength score
 */
function calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  let score = 0;
  
  // Length bonus
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  
  // Entropy check
  const uniqueChars = new Set(password.split('')).size;
  if (uniqueChars >= password.length * 0.8) score += 1;
  
  if (score >= 6) return 'strong';
  if (score >= 4) return 'medium';
  return 'weak';
}

/**
 * Hashes password using bcrypt with configurable rounds
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = env.BCRYPT_ROUNDS;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verifies password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generates a secure random password that meets policy requirements
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*(),.?":{}|<>';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  
  // Ensure at least one character from each required set
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}