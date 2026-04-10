import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { useAuth } from '../context/AuthContext';
import { AccessDeniedState } from '../components/enterprise/AccessDeniedState';
import { EmptyState } from '../components/enterprise/EmptyState';
import { LoadingSkeleton } from '../components/enterprise/LoadingSkeleton';
import { rolePermissionsApi } from '../lib/api';
import { getErrorMessage, isForbiddenError } from '../lib/error-utils';
import { localizeText, toUiPermissionLabel } from '../lib/mappers';
import type { PermissionToggleDto, RolePermissionMatrixDto } from '../types/api';
import {
  Shield,
  Save,
  RotateCcw,
  Info,
  Search,
  Eye,
  Tag,
  RotateCcw as RefundIcon,
  XCircle,
  BarChart3,
  Settings,
  MonitorCheck,
  CalendarCheck,
  AlertTriangle,
  User,
  Users,
  Crown,
  Lock,
  Edit,
  ShoppingBag,
} from 'lucide-react';

const permissionOrder = ['View', 'Edit', 'Discount', 'Refund', 'Cancel', 'Reports', 'Settings', 'Terminal', 'EndOfDay', 'MenuManagement'] as const;

const permissionIconMap = {
  View: Eye,
  Edit,
  Discount: Tag,
  Refund: RefundIcon,
  Cancel: XCircle,
  Reports: BarChart3,
  Settings,
  Terminal: MonitorCheck,
  EndOfDay: CalendarCheck,
  MenuManagement: ShoppingBag,
} as const;

const roleVisuals = {
  Garson: { icon: User, color: 'blue' },
  Kasiyer: { icon: Users, color: 'purple' },
  SubeMuduru: { icon: Crown, color: 'amber' },
  SistemYoneticisi: { icon: Shield, color: 'red' },
} as const;

const getRoleColor = (color: string) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  };

  return colors[color as keyof typeof colors] || colors.blue;
};

const normalizeRoleState = (roles: RolePermissionMatrixDto[]) =>
  roles.map((role) => ({
    ...role,
    permissions: [...role.permissions].sort(
      (left, right) => permissionOrder.indexOf(left.code) - permissionOrder.indexOf(right.code),
    ),
  }));

const getRoleSummary = (roleName: string) => roleVisuals[roleName as keyof typeof roleVisuals] || roleVisuals.Garson;

export default function RolePermissionMatrix() {
  const { session, updatePermissions } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roles, setRoles] = useState<RolePermissionMatrixDto[]>([]);
  const [initialRoles, setInitialRoles] = useState<RolePermissionMatrixDto[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPermission, setHoveredPermission] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForbidden, setIsForbidden] = useState(false);

  const loadRoleMatrix = useCallback(async () => {
    setIsLoading(true);
    setIsForbidden(false);
    setErrorMessage('');

    try {
      const response = normalizeRoleState(await rolePermissionsApi.getAll());
      setRoles(response);
      setInitialRoles(response);
    } catch (error) {
      if (isForbiddenError(error)) {
        setIsForbidden(true);
        setErrorMessage('Rol ve yetki matrisine erişim yetkiniz bulunmuyor.');
      } else {
        setErrorMessage(getErrorMessage(error, 'Yetki matrisi alınamadı.'));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoleMatrix();
  }, [loadRoleMatrix]);

  const permissionColumns = useMemo(() => {
    const firstRole = roles[0];
    return firstRole?.permissions ?? [];
  }, [roles]);

  const filteredRoles = useMemo(
    () => roles.filter((role) => localizeText(role.roleName).toLowerCase().includes(searchQuery.toLowerCase())),
    [roles, searchQuery],
  );

  const selectedRole = roles.find((role) => role.roleId === selectedRoleId) ?? null;

  const hasChanges = useMemo(() => JSON.stringify(roles) !== JSON.stringify(initialRoles), [initialRoles, roles]);

  const togglePermission = (roleId: number, permissionId: number) => {
    setRoles((prev) =>
      prev.map((role) =>
        role.roleId === roleId
          ? {
              ...role,
              permissions: role.permissions.map((permission) =>
                permission.permissionId === permissionId
                  ? { ...permission, isEnabled: !permission.isEnabled }
                  : permission,
              ),
            }
          : role,
      ),
    );
  };

  const handleReset = () => {
    setRoles(initialRoles);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const updates = roles.filter((role) => {
        const original = initialRoles.find((item) => item.roleId === role.roleId);
        return JSON.stringify(role.permissions) !== JSON.stringify(original?.permissions);
      });

      const updatedRoles = await Promise.all(
        updates.map((role) =>
          rolePermissionsApi.update(role.roleId, {
            permissions: role.permissions.map((permission) => ({
              permissionId: permission.permissionId,
              isEnabled: permission.isEnabled,
            })),
          }),
        ),
      );

      const currentRolePermissions = updatedRoles.find((role) => role.roleId === session?.user.roleId);
      if (currentRolePermissions) {
        updatePermissions(currentRolePermissions.permissions.filter((permission) => permission.isEnabled).map((permission) => permission.code));
      }

      toast.success('Yetki matrisi başarıyla kaydedildi.');
      await loadRoleMatrix();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Yetki matrisi kaydedilemedi.'));
    } finally {
      setIsSaving(false);
    }
  };

  const getEnabledCount = (role: RolePermissionMatrixDto) => role.permissions.filter((permission) => permission.isEnabled).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <div className="px-4 pb-24 pt-20 lg:px-6">
          <div className="mb-4 flex flex-col lg:mb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 lg:text-2xl">
                <Shield className="h-6 w-6 text-[#d4a017] lg:h-7 lg:w-7" />
                Rol ve Yetki Matrisi
              </h1>
              <p className="mt-1 text-xs text-gray-600 lg:text-sm">Kullanıcı rollerine özel erişim yetkilerini yönetin</p>
            </div>
            <div className="mt-3 flex items-center gap-2 lg:mt-0">
              <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasChanges || isSaving}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Sıfırla
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="bg-[#d4a017] text-white hover:bg-[#b8860b] disabled:bg-gray-300"
              >
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </Button>
            </div>
          </div>

          {hasChanges ? (
            <div className="mb-4 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4 lg:mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-900">Kaydedilmemiş Değişiklikler</h3>
                  <p className="mt-1 text-xs text-amber-800">
                    Yetki matrisinde yaptığınız değişiklikler henüz kaydedilmedi. Değişikliklerin uygulanması için "Kaydet" butonuna tıklayın.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rol ara..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#d4a017]"
              />
            </div>
          </div>

          {isLoading ? (
            <LoadingSkeleton type="table" count={5} />
          ) : isForbidden ? (
            <div className="mx-auto max-w-4xl">
              <AccessDeniedState
                onBack={() => window.history.length > 1 ? window.history.back() : undefined}
                onHome={() => window.location.assign('/dashboard')}
              />
            </div>
          ) : errorMessage ? (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <EmptyState
                type="error"
                title="Yetki matrisi yüklenemedi"
                description={errorMessage}
                action={{ label: 'Tekrar Dene', onClick: loadRoleMatrix }}
              />
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="sticky left-0 z-10 bg-gray-50 px-4 py-4 text-left lg:px-6">
                          <div className="text-xs font-semibold uppercase text-gray-600">Rol</div>
                        </th>
                        {permissionColumns.map((permission) => {
                          const Icon = permissionIconMap[permission.code];
                          return (
                            <th
                              key={permission.permissionId}
                              className="group relative min-w-[100px] px-3 py-4 text-center lg:min-w-[120px] lg:px-4"
                              onMouseEnter={() => setHoveredPermission(String(permission.permissionId))}
                              onMouseLeave={() => setHoveredPermission(null)}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                  permission.isCritical ? 'bg-red-100' : 'bg-blue-100'
                                }`}>
                                  <Icon className={`h-4 w-4 ${permission.isCritical ? 'text-red-600' : 'text-blue-600'}`} />
                                </div>
                                <div className="text-xs font-semibold text-gray-900">{toUiPermissionLabel(permission)}</div>
                                {permission.isCritical ? (
                                  <div className="flex items-center gap-1">
                                    <Lock className="h-3 w-3 text-red-600" />
                                    <span className="text-[10px] font-medium text-red-600">Kritik</span>
                                  </div>
                                ) : null}
                              </div>

                              {hoveredPermission === String(permission.permissionId) ? (
                                <div className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-lg bg-gray-900 p-3 text-xs text-white shadow-lg">
                                  <div className="flex items-start gap-2">
                                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <p>{localizeText(permission.description)}</p>
                                  </div>
                                  <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900" />
                                </div>
                              ) : null}
                            </th>
                          );
                        })}
                        <th className="min-w-[100px] px-4 py-4 text-center lg:px-6">
                          <div className="text-xs font-semibold uppercase text-gray-600">İşlemler</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRoles.map((role) => {
                        const roleConfig = getRoleSummary(role.roleName);
                        const RoleIcon = roleConfig.icon;
                        const enabledCount = getEnabledCount(role);

                        return (
                          <tr key={role.roleId} className="border-b border-gray-200 transition-colors hover:bg-gray-50">
                            <td className="sticky left-0 z-10 bg-white px-4 py-4 lg:px-6">
                              <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${getRoleColor(roleConfig.color)}`}>
                                  <RoleIcon className="h-5 w-5" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">{localizeText(role.roleName)}</div>
                                  <div className="text-xs text-gray-600">{role.userCount} kullanıcı</div>
                                  <div className="mt-1 text-xs text-gray-500">{enabledCount}/{role.permissions.length} yetki aktif</div>
                                </div>
                              </div>
                            </td>
                            {permissionColumns.map((columnPermission) => {
                              const rolePermission = role.permissions.find((permission) => permission.code === columnPermission.code);
                              if (!rolePermission) {
                                return <td key={`${role.roleId}-${columnPermission.permissionId}`} className="px-3 py-4 text-center lg:px-4">-</td>;
                              }

                              return (
                                <td key={`${role.roleId}-${rolePermission.permissionId}`} className="px-3 py-4 text-center lg:px-4">
                                  <div className="flex items-center justify-center">
                                    <Checkbox
                                      checked={rolePermission.isEnabled}
                                      onCheckedChange={() => togglePermission(role.roleId, rolePermission.permissionId)}
                                      className={rolePermission.isCritical ? 'border-red-400 data-[state=checked]:bg-red-600' : ''}
                                    />
                                  </div>
                                </td>
                              );
                            })}
                            <td className="px-4 py-4 text-center lg:px-6">
                              <Button variant="outline" size="sm" onClick={() => setSelectedRoleId(role.roleId)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Detay
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:mt-6 lg:p-6">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Açıklamalar</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                      <Info className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Standart Yetkiler</div>
                      <div className="mt-1 text-xs text-gray-600">Normal operasyonel işlemler için gereken temel yetkiler</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                      <Lock className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Kritik Yetkiler</div>
                      <div className="mt-1 text-xs text-gray-600">
                        Finansal ve sistem güvenliğini etkileyen hassas yetkiler. Dikkatli yönetilmelidir.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 lg:mt-6">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900">Güvenlik Uyarısı</h3>
                    <p className="mt-1 text-xs text-blue-800">
                      Yetki değişiklikleri sistem güvenlik kaydına işlenir. Kritik yetkilerin verilmesi yönetici onayı gerektirebilir.
                      Tüm işlemler denetim günlüğünde saklanır ve geri izlenebilir.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {hasChanges && !errorMessage ? (
          <div className="fixed bottom-0 left-0 right-0 z-10 border-t-2 border-gray-200 bg-white p-4 shadow-lg lg:left-64">
            <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="text-xs text-gray-600">Kaydedilmemiş Değişiklikler</div>
                <div className="text-sm font-semibold text-gray-900">Yetki matrisinde değişiklik yaptınız</div>
              </div>
              <Button variant="outline" size="lg" onClick={handleReset} className="sm:w-auto" disabled={isSaving}>
                <RotateCcw className="mr-2 h-5 w-5" />
                İptal Et
              </Button>
              <Button
                size="lg"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#d4a017] px-8 text-base font-semibold text-white hover:bg-[#b8860b] sm:w-auto"
              >
                <Save className="mr-2 h-5 w-5" />
                {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {selectedRole ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const roleConfig = getRoleSummary(selectedRole.roleName);
                    const RoleIcon = roleConfig.icon;
                    return (
                      <>
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${getRoleColor(roleConfig.color)}`}>
                          <RoleIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">{localizeText(selectedRole.roleName)}</h2>
                          <p className="text-sm text-gray-600">{selectedRole.userCount} kullanıcı atanmış</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <button onClick={() => setSelectedRoleId(null)} className="text-gray-400 transition-colors hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Aktif Yetkiler</h3>
              <div className="space-y-3">
                {selectedRole.permissions.map((permission) => {
                  const Icon = permissionIconMap[permission.code];

                  return (
                    <div
                      key={permission.permissionId}
                      className={`flex items-start gap-3 rounded-lg border-2 p-4 ${
                        permission.isEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        permission.isCritical ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        <Icon className={`h-5 w-5 ${permission.isCritical ? 'text-red-600' : 'text-blue-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold text-gray-900">{toUiPermissionLabel(permission)}</div>
                          {permission.isCritical ? <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">KRİTİK</span> : null}
                          {permission.isEnabled ? <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">AKTİF</span> : null}
                        </div>
                        <div className="mt-1 text-xs text-gray-600">{localizeText(permission.description)}</div>
                      </div>
                      <Checkbox
                        checked={permission.isEnabled}
                        onCheckedChange={() => togglePermission(selectedRole.roleId, permission.permissionId)}
                        className={permission.isCritical ? 'border-red-400 data-[state=checked]:bg-red-600' : ''}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
