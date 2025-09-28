import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, validatePassword } from "@/lib/auth/password";
import { generateEmailVerificationToken } from "@/lib/auth/jwt";
import { AuditLogger } from "@/lib/auth/audit";
import { respondWithError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { UserRole } from "@/generated/prisma";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(12, "Password must be at least 12 characters"),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "DOCTOR", "NURSE", "STAFF", "PATIENT", "PHARMACIST"]),
  profile: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    address: z.string().optional(),
    emergencyContact: z.string().optional(),
    specialization: z.string().optional(),
    licenseNumber: z.string().optional(),
    departmentId: z.number().optional(),
    hospitalId: z.number().optional(),
  }),
});

/**
 * User registration endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Validate password strength
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: "Password validation failed",
          details: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.phone ? [{ phone: data.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or phone already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Start transaction to create user and profile
    const result = await prisma.$transaction(async (tx: any) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          phone: data.phone,
          passwordHash,
          role: data.role as UserRole,
          isActive: data.role === "PATIENT", // Auto-activate patients, staff needs approval
          isVerified: false,
        },
      });

      // Create user profile
      const profile = await tx.userProfile.create({
        data: {
          userId: user.id,
          firstName: data.profile.firstName,
          lastName: data.profile.lastName,
          dateOfBirth: data.profile.dateOfBirth
            ? new Date(data.profile.dateOfBirth)
            : null,
          gender: data.profile.gender,
          address: data.profile.address,
          emergencyContact: data.profile.emergencyContact,
          specialization: data.profile.specialization,
          licenseNumber: data.profile.licenseNumber,
          departmentId: data.profile.departmentId,
          hospitalId: data.profile.hospitalId,
        },
      });

      return { user, profile };
    });

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken(data.email);

    // Store verification token
    await prisma.verificationToken.create({
      data: {
        identifier: data.email,
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        type: "EMAIL_VERIFICATION",
      },
    });

    // Log audit event
    await AuditLogger.log({
      action: "CREATE",
      resource: "users",
      resourceId: result.user.id,
      newValues: {
        email: data.email,
        role: data.role,
      },
      context: {
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        userAgent: request.headers.get("user-agent") || undefined,
      },
    });

    logger.info(
      {
        userId: result.user.id,
        email: data.email,
        role: data.role,
      },
      "User registered successfully"
    );

    return NextResponse.json(
      {
        message: "Registration successful",
        userId: result.user.id,
        verificationRequired: true,
      },
      { status: 201 }
    );
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
 * Email verification endpoint
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find and validate token
    const verificationRecord = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (
      !verificationRecord ||
      verificationRecord.expires < new Date() ||
      verificationRecord.type !== "EMAIL_VERIFICATION"
    ) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Find user and update verification status
    const user = await prisma.user.findUnique({
      where: { email: verificationRecord.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user verification status
    await prisma.$transaction(async (tx: any) => {
      await tx.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });

      // Delete used verification token
      await tx.verificationToken.delete({
        where: { id: verificationRecord.id },
      });
    });

    // Log audit event
    await AuditLogger.log({
      action: "UPDATE",
      resource: "users",
      resourceId: user.id,
      newValues: { isVerified: true },
      context: {
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        userAgent: request.headers.get("user-agent") || undefined,
      },
    });

    logger.info(
      { userId: user.id, email: user.email },
      "Email verified successfully"
    );

    return NextResponse.json({
      message: "Email verification successful",
    });
  } catch (error) {
    return respondWithError(error);
  }
}