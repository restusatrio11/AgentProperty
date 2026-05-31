import prisma from "@/lib/prisma";
import { hasPermission, PERMISSIONS } from "./rbac";

/**
 * Fetches all dynamic role permissions from the database.
 * Falls back to static configurations defined in rbac.js if not present or error occurs.
 * @returns {Promise<Object>} Permissions mapping
 */
export async function getDynamicPermissions() {
  try {
    const records = await prisma.rolePermission.findMany();
    const permissions = {};
    for (const record of records) {
      permissions[record.role] = JSON.parse(record.permissionsJson);
    }
    
    // Fallback default configurations
    if (!permissions.SUPERADMIN) {
      permissions.SUPERADMIN = PERMISSIONS.SUPERADMIN;
    }
    if (!permissions.ADMIN) {
      permissions.ADMIN = PERMISSIONS.ADMIN;
    }
    return permissions;
  } catch (e) {
    console.error("Error reading permissions from DB:", e);
    return PERMISSIONS;
  }
}

/**
 * Helper to check permissions on the backend using database configuration
 * @param {string} role 
 * @param {string} resource 
 * @param {string} action 
 * @returns {Promise<boolean>}
 */
export async function hasPermissionDb(role, resource, action) {
  try {
    const dynamicPerms = await getDynamicPermissions();
    return hasPermission(role, resource, action, dynamicPerms);
  } catch (e) {
    console.error("Error in hasPermissionDb:", e);
    return hasPermission(role, resource, action);
  }
}
