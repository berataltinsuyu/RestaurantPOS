import { useState } from 'react';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { 
  Shield,
  Save,
  RotateCcw,
  Info,
  Search,
  Eye,
  Edit,
  Tag,
  RotateCcw as RefundIcon,
  XCircle,
  BarChart3,
  Settings,
  MonitorCheck,
  CalendarCheck,
  AlertTriangle,
  ChevronRight,
  User,
  Users,
  Crown,
  Lock
} from 'lucide-react';

type PermissionKey = 
  | 'view'
  | 'edit'
  | 'discount'
  | 'refund'
  | 'cancel'
  | 'reports'
  | 'settings'
  | 'terminal'
  | 'endOfDay';

type RoleKey = 'waiter' | 'cashier' | 'manager' | 'admin';

interface Permission {
  key: PermissionKey;
  label: string;
  icon: any;
  description: string;
  critical: boolean;
}

interface Role {
  key: RoleKey;
  label: string;
  icon: any;
  description: string;
  color: string;
  userCount: number;
}

const permissions: Permission[] = [
  { key: 'view', label: 'Görüntüle', icon: Eye, description: 'Masa ve adisyon bilgilerini görüntüleme yetkisi', critical: false },
  { key: 'edit', label: 'Düzenle', icon: Edit, description: 'Adisyon üzerinde değişiklik yapma yetkisi', critical: false },
  { key: 'discount', label: 'İndirim', icon: Tag, description: 'Fiyat indirimi uygulama yetkisi', critical: true },
  { key: 'refund', label: 'İade', icon: RefundIcon, description: 'İade işlemi gerçekleştirme yetkisi', critical: true },
  { key: 'cancel', label: 'İptal', icon: XCircle, description: 'İşlem iptal etme yetkisi', critical: true },
  { key: 'reports', label: 'Raporlar', icon: BarChart3, description: 'Finansal raporlara erişim yetkisi', critical: false },
  { key: 'settings', label: 'Ayarlar', icon: Settings, description: 'Sistem ayarlarını düzenleme yetkisi', critical: true },
  { key: 'terminal', label: 'Terminal Yönetimi', icon: MonitorCheck, description: 'POS terminal yapılandırma yetkisi', critical: true },
  { key: 'endOfDay', label: 'Gün Sonu', icon: CalendarCheck, description: 'Gün sonu mutabakat yapma yetkisi', critical: true },
];

const roles: Role[] = [
  { 
    key: 'waiter', 
    label: 'Garson', 
    icon: User, 
    description: 'Masa servisi ve sipariş yönetimi yetkisi', 
    color: 'blue',
    userCount: 8
  },
  { 
    key: 'cashier', 
    label: 'Kasiyer', 
    icon: Users, 
    description: 'Ödeme işlemleri ve kasa yönetimi yetkisi', 
    color: 'purple',
    userCount: 3
  },
  { 
    key: 'manager', 
    label: 'Şube Müdürü', 
    icon: Crown, 
    description: 'Şube operasyonları ve personel yönetimi yetkisi', 
    color: 'amber',
    userCount: 2
  },
  { 
    key: 'admin', 
    label: 'Sistem Yöneticisi', 
    icon: Shield, 
    description: 'Tam sistem erişimi ve yapılandırma yetkisi', 
    color: 'red',
    userCount: 1
  },
];

const defaultPermissions: Record<RoleKey, Record<PermissionKey, boolean>> = {
  waiter: {
    view: true,
    edit: true,
    discount: false,
    refund: false,
    cancel: false,
    reports: false,
    settings: false,
    terminal: false,
    endOfDay: false,
  },
  cashier: {
    view: true,
    edit: true,
    discount: true,
    refund: true,
    cancel: true,
    reports: true,
    settings: false,
    terminal: false,
    endOfDay: false,
  },
  manager: {
    view: true,
    edit: true,
    discount: true,
    refund: true,
    cancel: true,
    reports: true,
    settings: true,
    terminal: true,
    endOfDay: true,
  },
  admin: {
    view: true,
    edit: true,
    discount: true,
    refund: true,
    cancel: true,
    reports: true,
    settings: true,
    terminal: true,
    endOfDay: true,
  },
};

export default function RolePermissionMatrix() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rolePermissions, setRolePermissions] = useState(defaultPermissions);
  const [selectedRole, setSelectedRole] = useState<RoleKey | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPermission, setHoveredPermission] = useState<PermissionKey | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const togglePermission = (roleKey: RoleKey, permissionKey: PermissionKey) => {
    setRolePermissions(prev => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        [permissionKey]: !prev[roleKey][permissionKey]
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving permissions:', rolePermissions);
    alert('Yetki matrisi başarıyla kaydedildi!');
    setHasChanges(false);
  };

  const handleReset = () => {
    if (confirm('Tüm değişiklikler iptal edilecek. Devam etmek istiyor musunuz?')) {
      setRolePermissions(defaultPermissions);
      setHasChanges(false);
    }
  };

  const filteredRoles = roles.filter(role => 
    role.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEnabledCount = (roleKey: RoleKey) => {
    return Object.values(rolePermissions[roleKey]).filter(v => v).length;
  };

  const getRoleColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      amber: 'bg-amber-100 text-amber-700 border-amber-200',
      red: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="pt-16 p-4 lg:p-6 pb-24">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 lg:mb-6">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-6 h-6 lg:w-7 lg:h-7 text-[#d4a017]" />
                Rol ve Yetki Matrisi
              </h1>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">Kullanıcı rollerine özel erişim yetkilerini yönetin</p>
            </div>
            <div className="flex items-center gap-2 mt-3 lg:mt-0">
              <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasChanges}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Sıfırla
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={!hasChanges}
                className="bg-[#d4a017] hover:bg-[#b8860b] text-white disabled:bg-gray-300"
              >
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </Button>
            </div>
          </div>

          {/* Warning Banner */}
          {hasChanges && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4 lg:mb-6 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-900">Kaydedilmemiş Değişiklikler</h3>
                  <p className="text-xs text-amber-800 mt-1">
                    Yetki matrisinde yaptığınız değişiklikler henüz kaydedilmedi. Değişikliklerin uygulanması için "Kaydet" butonuna tıklayın.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 lg:mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rol ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a017] focus:border-transparent"
              />
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="sticky left-0 z-10 bg-gray-50 px-4 lg:px-6 py-4 text-left">
                      <div className="text-xs font-semibold text-gray-600 uppercase">Rol</div>
                    </th>
                    {permissions.map((permission) => {
                      const Icon = permission.icon;
                      return (
                        <th 
                          key={permission.key} 
                          className="px-3 lg:px-4 py-4 text-center min-w-[100px] lg:min-w-[120px] relative group"
                          onMouseEnter={() => setHoveredPermission(permission.key)}
                          onMouseLeave={() => setHoveredPermission(null)}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              permission.critical ? 'bg-red-100' : 'bg-blue-100'
                            }`}>
                              <Icon className={`w-4 h-4 ${
                                permission.critical ? 'text-red-600' : 'text-blue-600'
                              }`} />
                            </div>
                            <div className="text-xs font-semibold text-gray-900">{permission.label}</div>
                            {permission.critical && (
                              <div className="flex items-center gap-1">
                                <Lock className="w-3 h-3 text-red-600" />
                                <span className="text-[10px] text-red-600 font-medium">Kritik</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Tooltip */}
                          {hoveredPermission === permission.key && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-20">
                              <div className="flex items-start gap-2">
                                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <p>{permission.description}</p>
                              </div>
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                            </div>
                          )}
                        </th>
                      );
                    })}
                    <th className="px-4 lg:px-6 py-4 text-center min-w-[100px]">
                      <div className="text-xs font-semibold text-gray-600 uppercase">İşlemler</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((role) => {
                    const RoleIcon = role.icon;
                    const enabledCount = getEnabledCount(role.key);
                    
                    return (
                      <tr 
                        key={role.key}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="sticky left-0 z-10 bg-white px-4 lg:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getRoleColor(role.color)}`}>
                              <RoleIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{role.label}</div>
                              <div className="text-xs text-gray-600">{role.userCount} kullanıcı</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {enabledCount}/{permissions.length} yetki aktif
                              </div>
                            </div>
                          </div>
                        </td>
                        {permissions.map((permission) => (
                          <td key={permission.key} className="px-3 lg:px-4 py-4 text-center">
                            <div className="flex items-center justify-center">
                              <Checkbox
                                checked={rolePermissions[role.key][permission.key]}
                                onCheckedChange={() => togglePermission(role.key, permission.key)}
                                className={permission.critical ? 'border-red-400 data-[state=checked]:bg-red-600' : ''}
                              />
                            </div>
                          </td>
                        ))}
                        <td className="px-4 lg:px-6 py-4 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRole(role.key)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
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

          {/* Legend */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 mt-4 lg:mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Açıklamalar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Standart Yetkiler</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Normal operasyonel işlemler için gereken temel yetkiler
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Kritik Yetkiler</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Finansal ve sistem güvenliğini etkileyen hassas yetkiler. Dikkatli yönetilmelidir.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4 lg:mt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900">Güvenlik Uyarısı</h3>
                <p className="text-xs text-blue-800 mt-1">
                  Yetki değişiklikleri sistem güvenlik kaydına işlenir. Kritik yetkilerin verilmesi yönetici onayı gerektirebilir. 
                  Tüm işlemler denetim günlüğünde saklanır ve geri izlenebilir.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Bar */}
        {hasChanges && (
          <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t-2 border-gray-200 shadow-lg p-4 z-10">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1">
                <div className="text-xs text-gray-600">Kaydedilmemiş Değişiklikler</div>
                <div className="text-sm font-semibold text-gray-900">
                  Yetki matrisinde değişiklik yaptınız
                </div>
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={handleReset}
                className="sm:w-auto"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                İptal Et
              </Button>
              <Button
                size="lg"
                onClick={handleSave}
                className="sm:w-auto bg-[#d4a017] hover:bg-[#b8860b] text-white text-base font-semibold px-8"
              >
                <Save className="w-5 h-5 mr-2" />
                Değişiklikleri Kaydet
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Role Detail Modal */}
      {selectedRole && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const role = roles.find(r => r.key === selectedRole)!;
                    const RoleIcon = role.icon;
                    return (
                      <>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${getRoleColor(role.color)}`}>
                          <RoleIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">{role.label}</h2>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Aktif Yetkiler</h3>
              <div className="space-y-3">
                {permissions.map((permission) => {
                  const Icon = permission.icon;
                  const isEnabled = rolePermissions[selectedRole][permission.key];
                  
                  return (
                    <div
                      key={permission.key}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                        isEnabled 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200 opacity-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        permission.critical ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          permission.critical ? 'text-red-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900 text-sm">{permission.label}</div>
                          {permission.critical && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-medium rounded">
                              KRİTİK
                            </span>
                          )}
                          {isEnabled && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded">
                              AKTİF
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{permission.description}</div>
                      </div>
                      <Checkbox
                        checked={isEnabled}
                        onCheckedChange={() => togglePermission(selectedRole, permission.key)}
                        className={permission.critical ? 'border-red-400 data-[state=checked]:bg-red-600' : ''}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button
                  onClick={() => setSelectedRole(null)}
                  className="w-full"
                  variant="outline"
                >
                  Kapat
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
