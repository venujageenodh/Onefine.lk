const AuditLog = require('../models/AuditLog');

const logAction = async ({ action, admin, resourceType, resourceId, details, metadata }) => {
    try {
        await AuditLog.create({
            action,
            adminId: admin?._id,
            adminName: admin?.name,
            resourceType,
            resourceId,
            details,
            metadata
        });
    } catch (err) {
        console.error('Failed to create audit log:', err);
    }
};

module.exports = { logAction };
