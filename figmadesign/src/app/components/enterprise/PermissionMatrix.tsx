import { Check, X } from 'lucide-react';

interface Permission {
  id: string;
  label: string;
  critical?: boolean;
}

interface Role {
  id: string;
  label: string;
  color: string;
}

interface PermissionMatrixProps {
  roles: Role[];
  permissions: Permission[];
  matrix: Record<string, Record<string, boolean>>;
  onToggle?: (roleId: string, permissionId: string) => void;
  readonly?: boolean;
}

export function PermissionMatrix({
  roles,
  permissions,
  matrix,
  onToggle,
  readonly = false
}: PermissionMatrixProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="sticky left-0 z-10 bg-gray-50 px-4 lg:px-6 py-3 text-left">
                <div className="text-xs font-semibold text-gray-600 uppercase">Rol / Yetki</div>
              </th>
              {permissions.map((permission) => (
                <th key={permission.id} className="px-3 lg:px-4 py-3 text-center min-w-[100px]">
                  <div className="text-xs font-semibold text-gray-900">{permission.label}</div>
                  {permission.critical && (
                    <div className="text-[10px] text-red-600 font-medium mt-1">Kritik</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="sticky left-0 z-10 bg-white px-4 lg:px-6 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full`}
                      style={{ backgroundColor: role.color }}
                    />
                    <div className="font-semibold text-gray-900 text-sm">{role.label}</div>
                  </div>
                </td>
                {permissions.map((permission) => (
                  <td key={permission.id} className="px-3 lg:px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      {readonly ? (
                        matrix[role.id]?.[permission.id] ? (
                          <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">
                            <X className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                        )
                      ) : (
                        <button
                          onClick={() => onToggle?.(role.id, permission.id)}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                            matrix[role.id]?.[permission.id]
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          {matrix[role.id]?.[permission.id] && (
                            <Check className="w-3.5 h-3.5 text-white" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
