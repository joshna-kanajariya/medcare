import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  generateOTP,
  sendOTPSMS,
  isValidPhoneNumber,
  isRateLimited,
} from "@/lib/auth/sms";
import { respondWithError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const sendOTPSchema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  purpose: z.enum(["login", "verification", "2fa"]).default("verification"),
});

const verifyOTPSchema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  purpose: z.enum(["login", "verification", "2fa"]).default("verification"),
});

// In-memory OTP store (in production, use Redis or database)
const otpStore = new Map<string, { code: string; expires: number; attempts: number }>();

/**
 * Send OTP via SMS
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, purpose } = sendOTPSchema.parse(body);

    // Validate phone number format
    if (!isValidPhoneNumber(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Check rate limiting
    if (isRateLimited(phone, 5, 60)) { // 5 attempts per hour
      return NextResponse.json(
        { error: "Too many OTP requests. Please try again later." },
        { status: 429 }
      );
    }

    // For login purpose, verify user exists
    if (purpose === "login") {
      const user = await prisma.user.findUnique({
        where: { phone },
      });

      if (!user || !user.isActive) {
        return NextResponse.json(
          { error: "Phone number not registered or account inactive" },
          { status: 404 }
        );
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const expires = Date.now() + (purpose === '2fa' ? 5 * 60 * 1000 : 10 * 60 * 1000); // 5 or 10 minutes

    // Store OTP
    const otpKey = `${phone}:${purpose}`;
    otpStore.set(otpKey, {
      code: otp,
      expires,
      attempts: 0,
    });

    // Send SMS
    const smsSent = await sendOTPSMS(phone, otp, purpose);

    if (!smsSent) {
      return NextResponse.json(
        { error: "Failed to send OTP. Please try again." },
        { status: 500 }
      );
    }

    logger.info(
      {
        phone: phone.substring(0, 3) + "****" + phone.substring(phone.length - 3),
        purpose,
      },
      "OTP sent successfully"
    );

    return NextResponse.json({
      message: "OTP sent successfully",
      expiresIn: purpose === '2fa' ? 300 : 600, // seconds
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return respondWithError(error);
  }
}

/**
 * Verify OTP
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp, purpose } = verifyOTPSchema.parse(body);

    const otpKey = `${phone}:${purpose}`;
    const storedOTP = otpStore.get(otpKey);

    if (!storedOTP) {
      return NextResponse.json(
        { error: "No OTP found. Please request a new one." },
        { status: 404 }
      );
    }

    // Check if expired
    if (Date.now() > storedOTP.expires) {
      otpStore.delete(otpKey);
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check attempts
    storedOTP.attempts++;
    if (storedOTP.attempts > 3) {
      otpStore.delete(otpKey);
      return NextResponse.json(
        { error: "Too many invalid attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    // Verify OTP
    if (storedOTP.code !== otp) {
      return NextResponse.json(
        { 
          error: "Invalid OTP",
          attemptsRemaining: 4 - storedOTP.attempts,
        },
        { status: 400 }
      );
    }

    // OTP verified successfully
    otpStore.delete(otpKey);

    // For login purpose, return user info
    if (purpose === "login") {
      const user = await prisma.user.findUnique({
        where: { phone },
        include: {
          userProfiles: true,
        },
      });

      if (user) {
        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      }

      return NextResponse.json({
        message: "OTP verified successfully",
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.userProfiles,
        } : null,
      });
    }

    // For 2FA purpose, mark as verified
    if (purpose === "2fa") {
      // Update 2FA last used timestamp
      await prisma.twoFactorAuth.updateMany({
        where: {
          user: {
            phone: phone,
          },
        },
        data: {
          lastUsedAt: new Date(),
        },
      });
    }

    logger.info(
      {
        phone: phone.substring(0, 3) + "****" + phone.substring(phone.length - 3),
        purpose,
      },
      "OTP verified successfully"
    );

    return NextResponse.json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return respondWithError(error);
  }
}

// Cleanup expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, otp] of otpStore.entries()) {
    if (now > otp.expires) {
      otpStore.delete(key);
    }
  }
}, 5 * 60 * 1000);