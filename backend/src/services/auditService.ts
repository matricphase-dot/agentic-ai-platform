import { prisma } from '../lib/prisma';

interface AuditLogData {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(data: AuditLogData) {
  try {
    await prisma.audit_logs.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        oldData: data.oldData ? JSON.parse(JSON.stringify(data.oldData)) : undefined,
        newData: data.newData ? JSON.parse(JSON.stringify(data.newData)) : undefined,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw – audit logging should not break the main flow
  }
}


