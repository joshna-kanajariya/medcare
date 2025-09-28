import { prisma } from "../prisma";
import { logger } from "../logger";
import type { AuditAction, UserRole } from "../../generated/prisma";

export interface AuditContext {
  userId?: string;
  userRole?: UserRole;
  ipAddress?: string | null;
  userAgent?: string | null;
  sessionId?: string;
}

export interface AuditLogData {
  action: AuditAction;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  context: AuditContext;
}

/**
 * Comprehensive audit logging system for HIPAA compliance
 */
export class AuditLogger {
  /**
   * Logs an audit event to the database
   */
  static async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.context.userId,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          oldValues: data.oldValues ? JSON.parse(JSON.stringify(data.oldValues)) : null,
          newValues: data.newValues ? JSON.parse(JSON.stringify(data.newValues)) : null,
          ipAddress: data.context.ipAddress,
          userAgent: data.context.userAgent,
          timestamp: new Date(),
        },
      });

      // Also log to application logger for real-time monitoring
      logger.info({
        audit: {
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          userId: data.context.userId,
          userRole: data.context.userRole,
          ipAddress: data.context.ipAddress,
          sessionId: data.context.sessionId,
        },
      }, `Audit: ${data.action} ${data.resource}`);
    } catch (error) {
      logger.error({ error, auditData: data }, 'Failed to write audit log');
    }
  }

  /**
   * Logs authentication events
   */
  static async logAuth(
    action: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE',
    userId?: string,
    context: Omit<AuditContext, 'userId'> = {}
  ): Promise<void> {
    await this.log({
      action,
      resource: 'authentication',
      resourceId: userId,
      context: { ...context, userId },
    });
  }

  /**
   * Logs patient data access (HIPAA requirement)
   */
  static async logPatientAccess(
    action: 'READ' | 'UPDATE' | 'CREATE' | 'DELETE',
    patientId: string,
    context: AuditContext,
    oldValues?: any,
    newValues?: any
  ): Promise<void> {
    await this.log({
      action: action as AuditAction,
      resource: 'patients',
      resourceId: patientId,
      oldValues,
      newValues,
      context,
    });
  }

  /**
   * Logs medical records access (Critical for HIPAA)
   */
  static async logMedicalRecordAccess(
    action: 'READ' | 'UPDATE' | 'CREATE' | 'DELETE',
    recordId: string,
    context: AuditContext,
    oldValues?: any,
    newValues?: any
  ): Promise<void> {
    await this.log({
      action: action as AuditAction,
      resource: 'medical_records',
      resourceId: recordId,
      oldValues,
      newValues,
      context,
    });
  }

  /**
   * Logs permission changes
   */
  static async logPermissionChange(
    action: 'PERMISSION_GRANT' | 'PERMISSION_REVOKE',
    targetUserId: string,
    permission: string,
    context: AuditContext
  ): Promise<void> {
    await this.log({
      action,
      resource: 'permissions',
      resourceId: targetUserId,
      newValues: { permission },
      context,
    });
  }

  /**
   * Logs account security events
   */
  static async logAccountSecurity(
    action: 'ACCOUNT_LOCK' | 'ACCOUNT_UNLOCK',
    targetUserId: string,
    context: AuditContext,
    reason?: string
  ): Promise<void> {
    await this.log({
      action,
      resource: 'accounts',
      resourceId: targetUserId,
      newValues: reason ? { reason } : undefined,
      context,
    });
  }

  /**
   * Logs data exports (Important for compliance)
   */
  static async logDataExport(
    resourceType: string,
    exportedRecords: number,
    context: AuditContext,
    exportFormat?: string
  ): Promise<void> {
    await this.log({
      action: 'READ',
      resource: 'data_export',
      newValues: {
        resourceType,
        recordCount: exportedRecords,
        exportFormat,
      },
      context,
    });
  }

  /**
   * Gets audit logs for a specific resource
   */
  static async getAuditLogs(
    resource: string,
    resourceId?: string,
    options: {
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
      userId?: string;
      actions?: AuditAction[];
    } = {}
  ) {
    const where: any = {
      resource,
    };

    if (resourceId) {
      where.resourceId = resourceId;
    }

    if (options.startDate || options.endDate) {
      where.timestamp = {};
      if (options.startDate) {
        where.timestamp.gte = options.startDate;
      }
      if (options.endDate) {
        where.timestamp.lte = options.endDate;
      }
    }

    if (options.userId) {
      where.userId = options.userId;
    }

    if (options.actions && options.actions.length > 0) {
      where.action = {
        in: options.actions,
      };
    }

    return prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            role: true,
            userProfiles: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: options.limit || 100,
      skip: options.offset || 0,
    });
  }

  /**
   * Gets audit summary for compliance reporting
   */
  static async getAuditSummary(
    startDate: Date,
    endDate: Date,
    resource?: string
  ) {
    const where: any = {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (resource) {
      where.resource = resource;
    }

    const summary = await prisma.auditLog.groupBy({
      by: ['action', 'resource'],
      where,
      _count: {
        id: true,
      },
    });

    const userActivity = await prisma.auditLog.groupBy({
      by: ['userId'],
      where,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    return {
      actionSummary: summary,
      topActiveUsers: userActivity,
      totalEvents: summary.reduce((sum: number, item: any) => sum + item._count.id, 0),
    };
  }

  /**
   * Cleans up old audit logs (for data retention policies)
   */
  static async cleanupOldLogs(retentionDays: number = 2555): Promise<number> { // 7 years default
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    logger.info(
      { deletedCount: result.count, cutoffDate },
      'Cleaned up old audit logs'
    );

    return result.count;
  }
}