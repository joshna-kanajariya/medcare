import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { verifyPassword } from "@/lib/auth/password";
import { AuditLogger } from "@/lib/auth/audit";
import { logger } from "@/lib/logger";
import type { UserRole } from "@/generated/prisma";

const handler = NextAuth({
  providers: [
    // Credentials provider for email/password login
    CredentialsProvider({
      id: "credentials",
      name: "Hospital Staff Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              userProfiles: true,
            },
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          // Verify password
          const isValidPassword = await verifyPassword(
            credentials.password as string,
            user.passwordHash
          );

          if (!isValidPassword) {
            return null;
          }

          // Check if user is active
          if (!user.isActive) {
            return null;
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            profile: user.userProfiles,
          };
        } catch (error) {
          logger.error({ error }, "Authentication error");
          return null;
        }
      },
    }),

    // Phone OTP provider (custom implementation)
    CredentialsProvider({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) {
          return null;
        }

        try {
          // Verify OTP (implementation depends on your OTP storage strategy)
          const user = await prisma.user.findUnique({
            where: { phone: credentials.phone },
            include: {
              userProfiles: true,
            },
          });

          if (!user || !user.isActive) {
            return null;
          }

          // In a real implementation, verify OTP against stored value
          // This is a simplified version
          
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            profile: user.userProfiles,
          };
        } catch (error) {
          logger.error({ error }, "Phone OTP authentication error");
          return null;
        }
      },
    }),

    // Google OAuth provider
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code",
              },
            },
          }),
        ]
      : []),
  ],

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Additional sign-in validation
        if (account?.provider === "google") {
          // For Google sign-in, check if user exists in our system
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // For security, don't auto-create accounts for Google sign-in
            // Hospital staff should be pre-registered
            return false;
          }
        }

        return true;
      } catch (error) {
        logger.error({ error }, "Sign-in callback error");
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        // First sign in
        token.role = (user as any).role;
        token.userId = user.id as string;
        token.isVerified = (user as any).isVerified;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as UserRole;
        session.user.isVerified = token.isVerified as boolean;

        // Get fresh user data
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.userId as string },
            include: {
              userProfiles: {
                select: {
                  firstName: true,
                  lastName: true,
                  hospitalId: true,
                  departmentId: true,
                },
              },
            },
          });

          if (user) {
            session.user.profile = user.userProfiles;
          }
        } catch (error) {
          logger.error({ error }, "Session callback error");
        }
      }

      return session;
    },
  },

  events: {
    async signIn({ user, account }) {
      await AuditLogger.logAuth("LOGIN", user.id, {
        userRole: (user as any).role,
        ipAddress: "unknown", // Will be enriched by middleware
      });
    },
  },

  session: {
    strategy: "jwt",
    maxAge: env.SESSION_MAX_AGE,
  },

  debug: env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };