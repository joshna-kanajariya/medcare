# MedCare Authentication System

## Overview

MedCare implements a comprehensive, hospital-grade authentication system with role-based access control, two-factor authentication, and full audit logging. The system is designed to meet HIPAA compliance requirements and industry security standards.

## Features

### 🔐 Authentication Methods
- **Email/Password**: Traditional credentials with hospital-grade password policies
- **Google OAuth**: Single sign-on integration for streamlined access
- **Phone OTP**: SMS-based authentication using Twilio
- **Two-Factor Authentication**: Additional security layer with SMS verification

### 👥 Role-Based Access Control (RBAC)
- **ADMIN**: Full system access and administration
- **DOCTOR**: Patient care, medical records, appointments
- **NURSE**: Patient care support, medical records access
- **STAFF**: General hospital operations, billing
- **PATIENT**: Self-service portal for appointments and records
- **PHARMACIST**: Prescription management and pharmacy operations

### 🛡️ Security Features
- **Password Policies**: Minimum 12 characters, complexity requirements
- **JWT Tokens**: Secure session management with refresh token rotation
- **Session Management**: Automatic logout and session expiration
- **Rate Limiting**: Protection against brute force attacks
- **Account Lockout**: Security measures for failed login attempts

### 📊 Audit & Compliance
- **Comprehensive Logging**: All authentication events tracked
- **HIPAA Compliance**: Patient data access logging
- **Audit Reports**: Detailed activity summaries
- **Data Retention**: Configurable log retention policies

## Quick Start

### 1. Environment Setup

Copy and configure your environment variables:

```bash
# Authentication
NEXTAUTH_SECRET=your-super-secure-secret-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=mysql://user:password@localhost:3306/medcare

# JWT Secrets
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Twilio SMS (Optional)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Security Settings
BCRYPT_ROUNDS=12
SESSION_MAX_AGE=86400
REFRESH_TOKEN_MAX_AGE=604800
```

### 2. Database Setup

Run Prisma migrations:

```bash
npm run db:push
npm run db:generate
```

### 3. Start Development Server

```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication
- `POST /api/register` - User registration
- `PUT /api/register?token=xxx` - Email verification

### Password Management
- `POST /api/password-reset` - Request password reset
- `PUT /api/password-reset` - Reset password with token
- `GET /api/password-reset?token=xxx` - Verify reset token

### OTP/SMS
- `POST /api/otp` - Send OTP via SMS
- `PUT /api/otp` - Verify OTP code

## User Registration Flow

1. **Registration**: User submits registration form with role and profile information
2. **Validation**: System validates password strength and user data
3. **Email Verification**: Verification email sent to user
4. **Account Activation**: User clicks verification link to activate account
5. **Login**: User can now sign in with verified credentials

## Permission System

### Permission Structure
```typescript
interface Permission {
  resource: string;  // e.g., 'patients', 'medical_records'
  action: string;    // e.g., 'read', 'write', 'delete'
  conditions?: Record<string, any>;
}
```

### Role Permissions

#### ADMIN
- Full system access including user management and audit logs

#### DOCTOR
- Read/Write: Patients, Medical Records, Appointments
- Read: Staff, Departments, Reports

#### NURSE
- Read/Write: Patients, Medical Records, Appointments
- Read: Staff, Departments

#### STAFF
- Read/Write: Patients, Appointments, Billing
- Read: Departments

#### PATIENT
- Read: Own medical records and appointments
- Write: Own appointments (booking)

#### PHARMACIST
- Read: Patients, Medical Records
- Read/Write: Pharmacy operations

### Usage Example
```typescript
import { hasPermission, PERMISSIONS } from '@/lib/auth/permissions';

// Check if user can read medical records
const canRead = hasPermission(
  userRole, 
  PERMISSIONS.MEDICAL_RECORDS_READ,
  { userId: user.id, resourceOwnerId: record.patientId }
);
```

## Password Security

### Password Policy
- Minimum 12 characters
- Must contain uppercase and lowercase letters
- Must contain numbers and special characters
- Forbidden patterns (common passwords, repeated characters)
- Password strength indicator in UI

### Password Hashing
```typescript
import { hashPassword, verifyPassword } from '@/lib/auth/password';

// Hash password for storage
const hash = await hashPassword(plainPassword);

// Verify password during login
const isValid = await verifyPassword(plainPassword, hash);
```

## Two-Factor Authentication

### Setup Process
1. User enables 2FA in security settings
2. System generates TOTP secret
3. User scans QR code with authenticator app
4. Backup codes generated for recovery

### SMS Verification
```typescript
import { sendOTPSMS, generateOTP } from '@/lib/auth/sms';

// Send OTP
const otp = generateOTP();
await sendOTPSMS(phoneNumber, otp, 'login');

// Verify OTP in login flow
```

## Audit Logging

### Logged Events
- Authentication events (login, logout, password changes)
- Patient data access (HIPAA requirement)
- Permission changes
- Account security events
- Data exports

### Usage Example
```typescript
import { AuditLogger } from '@/lib/auth/audit';

// Log patient data access
await AuditLogger.logPatientAccess(
  'READ',
  patientId,
  { userId, userRole, ipAddress, userAgent }
);

// Log authentication event
await AuditLogger.logAuth('LOGIN', userId, context);
```

### Audit Reports
Generate compliance reports:
```typescript
const summary = await AuditLogger.getAuditSummary(
  startDate,
  endDate,
  'patients' // optional resource filter
);
```

## Middleware Protection

Routes are automatically protected based on permissions:

```typescript
// middleware.ts automatically checks:
// 1. User authentication
// 2. Account verification status
// 3. Route-specific permissions
// 4. Role-based access
```

## Session Management

### JWT Configuration
- Access tokens: 24-hour expiration
- Refresh tokens: 7-day expiration
- Automatic token rotation
- Secure HTTP-only cookies

### Session Security
- CSRF protection
- Secure cookie flags in production
- Session invalidation on password change
- Concurrent session limits

## Error Handling

### Authentication Errors
- Invalid credentials
- Account locked/inactive
- Email not verified
- Insufficient permissions

### Error Pages
- `/auth/error` - Generic authentication errors
- `/auth/signin` - Login page with error states
- `/unauthorized` - Insufficient permissions

## Testing

### Unit Tests
```bash
npm test -- auth
```

### Integration Tests
```bash
npm run test:integration
```

### Security Testing
- Password policy validation
- Rate limiting verification
- Permission boundary testing
- Session security testing

## Security Best Practices

### Development
1. Never commit secrets to version control
2. Use environment variables for all configuration
3. Test with realistic user roles and permissions
4. Validate all user inputs
5. Log security events for monitoring

### Production
1. Use HTTPS everywhere
2. Configure secure headers
3. Enable rate limiting
4. Monitor audit logs
5. Regular security updates
6. Backup verification tokens

## Troubleshooting

### Common Issues

**"User not found" during login**
- Check if user exists in database
- Verify email/password combination
- Ensure account is active

**"Insufficient permissions" error**
- Check user role assignments
- Verify route permission mappings
- Review middleware configuration

**OTP not received**
- Verify Twilio configuration
- Check phone number format
- Review rate limiting settings

**Session expired repeatedly**
- Check JWT secret configuration
- Verify token expiration settings
- Clear browser cookies

### Debug Mode
Enable detailed logging in development:
```bash
LOG_LEVEL=debug npm run dev
```

## Architecture

### Database Schema
- `users` - Core user accounts
- `user_profiles` - Extended user information
- `accounts` - OAuth provider links
- `sessions` - Active user sessions
- `verification_tokens` - Email/phone verification
- `two_factor_auth` - 2FA settings
- `audit_logs` - Security event logging
- `permissions` & `role_permissions` - Access control

### Security Layers
1. **Network Level**: HTTPS, secure headers
2. **Application Level**: Authentication, authorization
3. **Data Level**: Encryption, audit logging
4. **User Level**: Strong passwords, 2FA

## Contributing

When adding new features:
1. Follow existing patterns for authentication
2. Add appropriate audit logging
3. Update permission mappings if needed
4. Add tests for new functionality
5. Update this documentation

## License

This authentication system is part of the MedCare platform and is licensed under the MIT License.