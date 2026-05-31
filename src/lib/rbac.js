// src/lib/rbac.js

export const ROLES = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
};

export const ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage", // Special action for user management, etc.
};

export const RESOURCES = {
  PROPERTIES: "properties",
  USERS: "users",
  AUDIT_LOGS: "audit_logs",
  TESTIMONIALS: "testimonials",
  MESSAGES: "messages",
};

export const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", resource: RESOURCES.PROPERTIES, action: ACTIONS.READ },
  { id: "properti", label: "Daftar Properti", resource: RESOURCES.PROPERTIES, action: ACTIONS.READ },
  { id: "arsip", label: "Arsip Properti", resource: RESOURCES.PROPERTIES, action: ACTIONS.DELETE },
  { id: "testimonials", label: "Kelola Testimoni", resource: RESOURCES.TESTIMONIALS, action: ACTIONS.READ },
  { id: "messages", label: "Pesan Masuk", resource: RESOURCES.MESSAGES, action: ACTIONS.READ },
  { id: "audit", label: "Audit Log", resource: RESOURCES.AUDIT_LOGS, action: ACTIONS.READ },
  { id: "sesi", label: "Sesi Aktif", resource: RESOURCES.USERS, action: ACTIONS.MANAGE },
  { id: "admins", label: "Kelola Admin", resource: RESOURCES.USERS, action: ACTIONS.MANAGE },
  { id: "rbac", label: "Otorisasi (RBAC)", resource: RESOURCES.USERS, action: ACTIONS.MANAGE },
  { id: "docs", label: "Dokumentasi", resource: RESOURCES.PROPERTIES, action: ACTIONS.READ },
];

/**
 * Permission structure:
 * {
 *   [ROLE]: {
 *     [RESOURCE]: [ACTIONS]
 *   }
 * }
 */
export const PERMISSIONS = {
  [ROLES.SUPERADMIN]: {
    [RESOURCES.PROPERTIES]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
    [RESOURCES.USERS]: [ACTIONS.MANAGE, ACTIONS.READ],
    [RESOURCES.AUDIT_LOGS]: [ACTIONS.READ],
    [RESOURCES.TESTIMONIALS]: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
    [RESOURCES.MESSAGES]: [ACTIONS.READ, ACTIONS.DELETE],
  },
  [ROLES.ADMIN]: {
    [RESOURCES.PROPERTIES]: [ACTIONS.READ],
    [RESOURCES.TESTIMONIALS]: [ACTIONS.READ],
    [RESOURCES.MESSAGES]: [ACTIONS.READ],
    // Admin can read their own profile maybe, but for now we follow AC
  },
};

/**
 * Checks if a role has permission to perform an action on a resource
 * @param {string} role - User role
 * @param {string} resource - Target resource
 * @param {string} action - Action to perform
 * @param {Object} [customPermissions] - Optional dynamic permissions mapping
 * @returns {boolean}
 */
export function hasPermission(role, resource, action, customPermissions = null) {
  if (!role || !resource || !action) return false;

  const targetPermissions = customPermissions || PERMISSIONS;
  const rolePermissions = targetPermissions[role];
  if (!rolePermissions) return false;

  const resourceActions = rolePermissions[resource];
  if (!resourceActions) return false;

  return resourceActions.includes(action);
}

/**
 * Maps HTTP Method and Path to Resource and Action
 * @param {string} method - HTTP Method (GET, POST, etc.)
 * @param {string} pathname - Request pathname
 * @returns {{resource: string, action: string} | null}
 */
export function mapRequestToPermission(method, pathname) {
  // Property routes
  if (pathname.startsWith("/api/properties")) {
    if (method === "GET") return { resource: RESOURCES.PROPERTIES, action: ACTIONS.READ };
    if (method === "POST") return { resource: RESOURCES.PROPERTIES, action: ACTIONS.CREATE };
    if (method === "PUT" || method === "PATCH") return { resource: RESOURCES.PROPERTIES, action: ACTIONS.UPDATE };
    if (method === "DELETE") return { resource: RESOURCES.PROPERTIES, action: ACTIONS.DELETE };
  }

  // User/Session routes (Superadmin only for managing other users)
  if (pathname.startsWith("/api/auth/users") || pathname.startsWith("/api/sessions")) {
     // Note: /api/auth/login, logout, etc are handled separately in middleware as public or session-specific
     if (pathname.includes("/api/sessions") && method === "GET") return { resource: RESOURCES.USERS, action: ACTIONS.READ };
     return { resource: RESOURCES.USERS, action: ACTIONS.MANAGE };
  }

  // Audit Log routes
  if (pathname.startsWith("/api/audit-logs")) {
    return { resource: RESOURCES.AUDIT_LOGS, action: ACTIONS.READ };
  }

  // Testimonials routes
  if (pathname.startsWith("/api/testimonials")) {
    if (method === "GET") return { resource: RESOURCES.TESTIMONIALS, action: ACTIONS.READ };
    if (method === "POST") return { resource: RESOURCES.TESTIMONIALS, action: ACTIONS.CREATE };
    if (method === "PATCH") return { resource: RESOURCES.TESTIMONIALS, action: ACTIONS.UPDATE };
    if (method === "DELETE") return { resource: RESOURCES.TESTIMONIALS, action: ACTIONS.DELETE };
  }

  // Contact/Messages routes
  if (pathname.startsWith("/api/contact")) {
    if (method === "GET") return { resource: RESOURCES.MESSAGES, action: ACTIONS.READ };
    if (method === "POST") return { resource: RESOURCES.MESSAGES, action: ACTIONS.CREATE };
  }

  return null;
}
