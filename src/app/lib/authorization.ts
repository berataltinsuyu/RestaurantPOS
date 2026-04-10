import type { AppSession } from '../types/api';

export const appRoles = {
  waiter: 'Garson',
  cashier: 'Kasiyer',
  branchManager: 'SubeMuduru',
  systemAdministrator: 'SistemYoneticisi',
} as const;

export const appPermissions = {
  menuManagement: 'MenuManagement',
} as const;

export type AppRole = (typeof appRoles)[keyof typeof appRoles];
export type AppPermission = (typeof appPermissions)[keyof typeof appPermissions];

export const hasAnyRole = (session: AppSession | null, allowedRoles: readonly AppRole[]) => {
  if (!session || allowedRoles.length === 0) {
    return false;
  }

  return allowedRoles.includes(session.user.roleName as AppRole);
};

export const hasAnyPermission = (session: AppSession | null, allowedPermissions: readonly AppPermission[]) => {
  if (!session || allowedPermissions.length === 0) {
    return false;
  }

  return allowedPermissions.some((permission) => session.permissions.includes(permission));
};
