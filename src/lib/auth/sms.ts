import { Twilio } from 'twilio';
import { env } from '../env';
import { logger } from '../logger';

let twilioClient: Twilio | null = null;

function getTwilioClient(): Twilio | null {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    logger.warn('Twilio credentials not configured. SMS functionality disabled.');
    return null;
  }

  if (!twilioClient) {
    twilioClient = new Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  }

  return twilioClient;
}

/**
 * Generates a 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Sends SMS with OTP code
 */
export async function sendOTPSMS(
  phoneNumber: string,
  code: string,
  purpose: 'login' | 'verification' | '2fa' = 'verification'
): Promise<boolean> {
  const client = getTwilioClient();
  
  if (!client || !env.TWILIO_PHONE_NUMBER) {
    logger.error('Twilio not configured properly');
    return false;
  }

  try {
    const message = getOTPMessage(code, purpose);
    
    await client.messages.create({
      body: message,
      from: env.TWILIO_PHONE_NUMBER,
      to: formatPhoneNumber(phoneNumber),
    });

    logger.info({ phoneNumber: maskPhoneNumber(phoneNumber), purpose }, 'OTP SMS sent');
    return true;
  } catch (error) {
    logger.error({ error, phoneNumber: maskPhoneNumber(phoneNumber) }, 'Failed to send OTP SMS');
    return false;
  }
}

/**
 * Sends SMS notification
 */
export async function sendNotificationSMS(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  const client = getTwilioClient();
  
  if (!client || !env.TWILIO_PHONE_NUMBER) {
    logger.error('Twilio not configured properly');
    return false;
  }

  try {
    await client.messages.create({
      body: message,
      from: env.TWILIO_PHONE_NUMBER,
      to: formatPhoneNumber(phoneNumber),
    });

    logger.info({ phoneNumber: maskPhoneNumber(phoneNumber) }, 'Notification SMS sent');
    return true;
  } catch (error) {
    logger.error({ error, phoneNumber: maskPhoneNumber(phoneNumber) }, 'Failed to send notification SMS');
    return false;
  }
}

/**
 * Validates phone number format
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic validation for international format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber.replace(/\D/g, ''));
}

/**
 * Formats phone number to E.164 format
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Add country code if missing (assume US for now)
  if (cleaned.length === 10) {
    cleaned = '1' + cleaned;
  }
  
  return '+' + cleaned;
}

/**
 * Masks phone number for logging (privacy)
 */
export function maskPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length < 4) return '****';
  
  return cleaned.substring(0, 3) + '*'.repeat(cleaned.length - 6) + cleaned.substring(cleaned.length - 3);
}

/**
 * Gets appropriate OTP message based on purpose
 */
function getOTPMessage(code: string, purpose: 'login' | 'verification' | '2fa'): string {
  const messages = {
    login: `Your MedCare login code is: ${code}. This code expires in 10 minutes. Do not share this code.`,
    verification: `Your MedCare verification code is: ${code}. This code expires in 10 minutes. Do not share this code.`,
    '2fa': `Your MedCare 2FA code is: ${code}. This code expires in 5 minutes. Do not share this code.`,
  };

  return messages[purpose];
}

/**
 * Rate limiting for SMS sending (per phone number)
 */
const smsRateLimit = new Map<string, { count: number; resetTime: number }>();

export function isRateLimited(phoneNumber: string, maxAttempts: number = 5, windowMinutes: number = 60): boolean {
  const key = maskPhoneNumber(phoneNumber);
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  
  const record = smsRateLimit.get(key);
  
  if (!record || now > record.resetTime) {
    // Reset or initialize
    smsRateLimit.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  if (record.count >= maxAttempts) {
    return true;
  }
  
  record.count++;
  return false;
}

/**
 * Cleans up expired rate limit records
 */
export function cleanupRateLimit(): void {
  const now = Date.now();
  
  for (const [key, record] of smsRateLimit.entries()) {
    if (now > record.resetTime) {
      smsRateLimit.delete(key);
    }
  }
}

// Cleanup expired records every hour
setInterval(cleanupRateLimit, 60 * 60 * 1000);