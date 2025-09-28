import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, validatePassword } from "@/lib/auth/password";
import { generatePasswordResetToken, verifyPasswordResetToken } from "@/lib/auth/jwt";
import { AuditLogger } from "@/lib/auth/audit";
import { respondWithError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const requestResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(12, "Password must be at least 12 characters"),
});

/**
 * Request password reset
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = requestResetSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent user enumeration
    // but only send email if user actually exists
    if (user && user.isActive) {
      // Generate password reset token
      const resetToken = generatePasswordResetToken(email);

      // Store reset token in database
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: resetToken,
          expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          type: "PASSWORD_RESET",
        },
      });

      // Log audit event
      await AuditLogger.log({
        action: "CREATE",
        resource: "password_reset",
        resourceId: user.id,
        context: {
          userId: user.id,
          ipAddress: request.ip,
          userAgent: request.headers.get("user-agent"),
        },
      });

      logger.info(
        { userId: user.id, email },
        "Password reset token generated"
      );
    }

    // Always return the same response to prevent user enumeration
    return NextResponse.json({
      message: "If an account with that email exists, a password reset link has been sent.",
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
 * Reset password with token
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = resetPasswordSchema.parse(body);

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: "Password validation failed",
          details: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Verify reset token
    const tokenPayload = verifyPasswordResetToken(token);
    if (!tokenPayload) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Find and verify token in database
    const verificationRecord = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (
      !verificationRecord ||
      verificationRecord.expires < new Date() ||
      verificationRecord.type !== "PASSWORD_RESET" ||
      verificationRecord.identifier !== tokenPayload.email
    ) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: tokenPayload.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and delete token
    await prisma.$transaction(async (tx) => {
      // Update user password
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
        },
      });

      // Delete used reset token
      await tx.verificationToken.delete({
        where: { id: verificationRecord.id },
      });

      // Invalidate all existing sessions by updating the user's updatedAt
      await tx.user.update({
        where: { id: user.id },
        data: {
          updatedAt: new Date(),
        },
      });
    });

    // Log audit event
    await AuditLogger.logAuth("PASSWORD_CHANGE", user.id, {
      userRole: user.role,
      ipAddress: request.ip,
      userAgent: request.headers.get("user-agent"),
    });

    logger.info(
      { userId: user.id, email: user.email },
      "Password reset successfully"
    );

    return NextResponse.json({
      message: "Password reset successful. Please sign in with your new password.",
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
 * Verify reset token (without resetting password)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Reset token is required" },
        { status: 400 }
      );
    }

    // Verify JWT token
    const tokenPayload = verifyPasswordResetToken(token);
    if (!tokenPayload) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Verify token exists in database and hasn't been used
    const verificationRecord = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (
      !verificationRecord ||
      verificationRecord.expires < new Date() ||
      verificationRecord.type !== "PASSWORD_RESET"
    ) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Token is valid",
      email: tokenPayload.email,
    });
  } catch (error) {
    return respondWithError(error);
  }
}