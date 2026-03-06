"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = createAuditLog;
const prisma_1 = require("../lib/prisma");
async function createAuditLog(data) {
    try {
        await prisma_1.prisma.auditLog.create({
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
    }
    catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw – audit logging should not break the main flow
    }
}
