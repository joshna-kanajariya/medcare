import type { UserRole } from "../../generated/prisma";

/**
 * Permission-based access control system for hospital operations
 */

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

// Define all possible permissions
export const PERMISSIONS = {
  // Patient Management
  PATIENTS_READ: { resource: 'patients', action: 'read' },
  PATIENTS_WRITE: { resource: 'patients', action: 'write' },
  PATIENTS_DELETE: { resource: 'patients', action: 'delete' },
  
  // Medical Records
  MEDICAL_RECORDS_READ: { resource: 'medical_records', action: 'read' },
  MEDICAL_RECORDS_WRITE: { resource: 'medical_records', action: 'write' },
  MEDICAL_RECORDS_DELETE: { resource: 'medical_records', action: 'delete' },
  
  // Appointments
  APPOINTMENTS_READ: { resource: 'appointments', action: 'read' },
  APPOINTMENTS_WRITE: { resource: 'appointments', action: 'write' },
  APPOINTMENTS_DELETE: { resource: 'appointments', action: 'delete' },
  
  // Staff Management
  STAFF_READ: { resource: 'staff', action: 'read' },
  STAFF_WRITE: { resource: 'staff', action: 'write' },
  STAFF_DELETE: { resource: 'staff', action: 'delete' },
  
  // Department Management
  DEPARTMENTS_READ: { resource: 'departments', action: 'read' },
  DEPARTMENTS_WRITE: { resource: 'departments', action: 'write' },
  DEPARTMENTS_DELETE: { resource: 'departments', action: 'delete' },
  
  // Hospital Management
  HOSPITAL_READ: { resource: 'hospital', action: 'read' },
  HOSPITAL_WRITE: { resource: 'hospital', action: 'write' },
  HOSPITAL_DELETE: { resource: 'hospital', action: 'delete' },
  
  // Pharmacy
  PHARMACY_READ: { resource: 'pharmacy', action: 'read' },
  PHARMACY_WRITE: { resource: 'pharmacy', action: 'write' },
  PHARMACY_DELETE: { resource: 'pharmacy', action: 'delete' },
  
  // Billing
  BILLING_READ: { resource: 'billing', action: 'read' },
  BILLING_WRITE: { resource: 'billing', action: 'write' },
  BILLING_DELETE: { resource: 'billing', action: 'delete' },
  
  // Reports & Analytics
  REPORTS_READ: { resource: 'reports', action: 'read' },
  REPORTS_WRITE: { resource: 'reports', action: 'write' },
  
  // Audit Logs
  AUDIT_LOGS_READ: { resource: 'audit_logs', action: 'read' },
  
  // System Administration
  SYSTEM_ADMIN: { resource: 'system', action: 'admin' },
} as const;

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    // Full system access
    ...Object.values(PERMISSIONS),
  ],
  
  DOCTOR: [
    // Patient care focused permissions
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.PATIENTS_WRITE,
    PERMISSIONS.MEDICAL_RECORDS_READ,
    PERMISSIONS.MEDICAL_RECORDS_WRITE,
    PERMISSIONS.APPOINTMENTS_READ,
    PERMISSIONS.APPOINTMENTS_WRITE,
    PERMISSIONS.DEPARTMENTS_READ,
    PERMISSIONS.STAFF_READ,
    PERMISSIONS.REPORTS_READ,
  ],
  
  NURSE: [
    // Nursing care permissions
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.PATIENTS_WRITE,
    PERMISSIONS.MEDICAL_RECORDS_READ,
    PERMISSIONS.MEDICAL_RECORDS_WRITE,
    PERMISSIONS.APPOINTMENTS_READ,
    PERMISSIONS.APPOINTMENTS_WRITE,
    PERMISSIONS.DEPARTMENTS_READ,
    PERMISSIONS.STAFF_READ,
  ],
  
  STAFF: [
    // General staff permissions
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.APPOINTMENTS_READ,
    PERMISSIONS.APPOINTMENTS_WRITE,
    PERMISSIONS.DEPARTMENTS_READ,
    PERMISSIONS.BILLING_READ,
    PERMISSIONS.BILLING_WRITE,
  ],
  
  PATIENT: [
    // Patient self-service permissions
    PERMISSIONS.APPOINTMENTS_READ,
    PERMISSIONS.APPOINTMENTS_WRITE, // Only for their own appointments
    PERMISSIONS.MEDICAL_RECORDS_READ, // Only their own records
  ],
  
  PHARMACIST: [
    // Pharmacy-focused permissions
    PERMISSIONS.PATIENTS_READ,
    PERMISSIONS.MEDICAL_RECORDS_READ,
    PERMISSIONS.PHARMACY_READ,
    PERMISSIONS.PHARMACY_WRITE,
    PERMISSIONS.APPOINTMENTS_READ,
  ],
};

/**
 * Checks if a user role has a specific permission
 */
export function hasPermission(
  userRole: UserRole,
  requiredPermission: Permission,
  context?: {
    userId?: string;
    resourceOwnerId?: string;
    hospitalId?: number;
    departmentId?: number;
  }
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  
  const hasBasicPermission = rolePermissions.some(
    (perm) =>
      perm.resource === requiredPermission.resource &&
      perm.action === requiredPermission.action
  );
  
  if (!hasBasicPermission) {
    return false;
  }
  
  // Additional context-based checks
  if (userRole === 'PATIENT' && context) {
    // Patients can only access their own data
    if (requiredPermission.resource === 'medical_records' || 
        requiredPermission.resource === 'appointments') {
      return context.userId === context.resourceOwnerId;
    }
  }
  
  return true;
}

/**
 * Checks multiple permissions at once
 */
export function hasPermissions(
  userRole: UserRole,
  requiredPermissions: Permission[],
  context?: {
    userId?: string;
    resourceOwnerId?: string;
    hospitalId?: number;
    departmentId?: number;
  }
): boolean {
  return requiredPermissions.every((perm) =>
    hasPermission(userRole, perm, context)
  );
}

/**
 * Gets all permissions for a user role
 */
export function getRolePermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole];
}

/**
 * Checks if user can access a specific hospital area/module
 */
export function canAccessModule(
  userRole: UserRole,
  module: 'patients' | 'appointments' | 'medical_records' | 'staff' | 'departments' | 'hospital' | 'pharmacy' | 'billing' | 'reports' | 'audit_logs' | 'system'
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  
  return rolePermissions.some((perm) => perm.resource === module);
}

/**
 * Creates a permission object
 */
export function createPermission(
  resource: string,
  action: string,
  conditions?: Record<string, any>
): Permission {
  return {
    resource,
    action,
    conditions,
  };
}

/**
 * Permission validation utilities
 */
export const PermissionUtils = {
  /**
   * Validates if a permission action is valid
   */
  isValidAction(action: string): boolean {
    const validActions = ['read', 'write', 'delete', 'admin'];
    return validActions.includes(action);
  },
  
  /**
   * Validates if a permission resource is valid
   */
  isValidResource(resource: string): boolean {
    const validResources = [
      'patients', 'medical_records', 'appointments', 'staff',
      'departments', 'hospital', 'pharmacy', 'billing', 'reports',
      'audit_logs', 'system'
    ];
    return validResources.includes(resource);
  },
  
  /**
   * Gets permission string representation
   */
  toString(permission: Permission): string {
    return `${permission.resource}:${permission.action}`;
  },
  
  /**
   * Parses permission from string
   */
  fromString(permissionStr: string): Permission | null {
    const [resource, action] = permissionStr.split(':');
    
    if (!this.isValidResource(resource) || !this.isValidAction(action)) {
      return null;
    }
    
    return { resource, action };
  },
};