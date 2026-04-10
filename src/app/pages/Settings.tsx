import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { AccessDeniedState } from '../components/enterprise/AccessDeniedState';
import { EmptyState } from '../components/enterprise/EmptyState';
import { LoadingSkeleton } from '../components/enterprise/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { rolePermissionsApi, settingsApi, terminalsApi, usersApi } from '../lib/api';
import { getErrorMessage, isForbiddenError } from '../lib/error-utils';
import { localizeText, toUiPermissionLabel, toUiTerminalStatus } from '../lib/mappers';
import type {
  AppSettingDto,
  BranchSummaryDto,
  PosTerminalDto,
  PrinterSettingDto,
  RolePermissionMatrixDto,
  UserSummaryDto,
} from '../types/api';
import {
  Building2,
  CreditCard,
  Users,
  Shield,
  Printer,
  Plug,
  Palette,
  Save,
} from 'lucide-react';

interface BusinessFormState {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  taxNumber: string;
  merchantNumber: string;
  isActive: boolean;
}

interface PrinterFormState {
  printerName: string;
  ipAddress: string;
  autoPrintReceipt: boolean;
  printKitchenCopy: boolean;
  printLogo: boolean;
  isActive: boolean;
}

const defaultPrinterState: PrinterFormState = {
  printerName: '',
  ipAddress: '',
  autoPrintReceipt: true,
  printKitchenCopy: false,
  printLogo: true,
  isActive: true,
};

export default function Settings() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [business, setBusiness] = useState<BranchSummaryDto | null>(null);
  const [businessForm, setBusinessForm] = useState<BusinessFormState | null>(null);
  const [terminals, setTerminals] = useState<PosTerminalDto[]>([]);
  const [users, setUsers] = useState<UserSummaryDto[]>([]);
  const [roleMatrix, setRoleMatrix] = useState<RolePermissionMatrixDto[]>([]);
  const [printers, setPrinters] = useState<PrinterSettingDto[]>([]);
  const [printerForm, setPrinterForm] = useState<PrinterFormState>(defaultPrinterState);
  const [appSettings, setAppSettings] = useState<AppSettingDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);
  const [isSavingPrinter, setIsSavingPrinter] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForbidden, setIsForbidden] = useState(false);

  const branchId = session?.branch.id;

  const hydrateBusinessForm = (branch: BranchSummaryDto) => {
    setBusinessForm({
      name: localizeText(branch.name),
      code: branch.code,
      address: localizeText(branch.address),
      phone: branch.phone,
      email: branch.email,
      taxNumber: branch.taxNumber,
      merchantNumber: branch.merchantNumber,
      isActive: branch.isActive,
    });
  };

  const hydratePrinterForm = (printer?: PrinterSettingDto | null) => {
    if (!printer) {
      setPrinterForm(defaultPrinterState);
      return;
    }

    setPrinterForm({
      printerName: printer.printerName,
      ipAddress: printer.ipAddress,
      autoPrintReceipt: printer.autoPrintReceipt,
      printKitchenCopy: printer.printKitchenCopy,
      printLogo: printer.printLogo,
      isActive: printer.isActive,
    });
  };

  const loadSettings = useCallback(async () => {
    if (!branchId) {
      return;
    }

    setIsLoading(true);
    setIsForbidden(false);
    setErrorMessage('');

    try {
      const [businessResponse, terminalsResponse, usersResponse, roleMatrixResponse, printersResponse, appSettingsResponse] =
        await Promise.all([
          settingsApi.getBusiness(branchId),
          terminalsApi.getByBranch(branchId),
          usersApi.getAll(),
          rolePermissionsApi.getAll(),
          settingsApi.getPrinters(branchId),
          settingsApi.getAppSettings(branchId),
        ]);

      setBusiness(businessResponse);
      hydrateBusinessForm(businessResponse);
      setTerminals(terminalsResponse);
      setUsers(usersResponse);
      setRoleMatrix(roleMatrixResponse);
      setPrinters(printersResponse);
      hydratePrinterForm(printersResponse[0]);
      setAppSettings(appSettingsResponse);
    } catch (error) {
      if (isForbiddenError(error)) {
        setIsForbidden(true);
        setErrorMessage('Ayarlar ekranına erişim yetkiniz bulunmuyor.');
      } else {
        setErrorMessage(getErrorMessage(error, 'Ayar verileri alınamadı.'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveBusiness = async () => {
    if (!branchId || !businessForm) {
      return;
    }

    setIsSavingBusiness(true);
    try {
      const updated = await settingsApi.updateBusiness(branchId, businessForm);
      setBusiness(updated);
      hydrateBusinessForm(updated);
      toast.success('İş yeri bilgileri güncellendi.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'İş yeri bilgileri güncellenemedi.'));
    } finally {
      setIsSavingBusiness(false);
    }
  };

  const handleSavePrinter = async () => {
    if (!branchId) {
      return;
    }

    setIsSavingPrinter(true);
    try {
      const currentPrinter = printers[0];
      const payload = {
        branchId,
        ...printerForm,
      };

      if (currentPrinter) {
        await settingsApi.updatePrinter(currentPrinter.id, payload);
      } else {
        await settingsApi.createPrinter(payload);
      }

      toast.success('Yazıcı ayarları güncellendi.');
      await loadSettings();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Yazıcı ayarları kaydedilemedi.'));
    } finally {
      setIsSavingPrinter(false);
    }
  };

  const appearanceSettings = useMemo(
    () => appSettings.filter((setting) => setting.group === 'appearance'),
    [appSettings],
  );

  const generalSettings = useMemo(
    () => appSettings.filter((setting) => setting.group !== 'appearance'),
    [appSettings],
  );

  const activeTheme = appearanceSettings.find((setting) => setting.key === 'theme')?.value ?? 'vakifbank-light';

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <div className="px-4 pb-6 pt-20 lg:px-6 lg:pb-8">
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">Ayarlar</h1>
            <p className="mt-1 text-xs text-gray-600 lg:text-sm">Sistem ve iş yeri ayarlarını yönetin</p>
          </div>

          {errorMessage && !isLoading && !isForbidden ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {errorMessage}
            </div>
          ) : null}

          {isLoading ? (
            <div className="space-y-6">
              <LoadingSkeleton type="card" count={2} />
              <LoadingSkeleton type="list" count={5} />
            </div>
          ) : isForbidden ? (
            <div className="mx-auto max-w-4xl">
              <AccessDeniedState onBack={() => navigate(-1)} onHome={() => navigate('/dashboard')} />
            </div>
          ) : errorMessage ? (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <EmptyState
                type="error"
                title="Ayarlar yüklenemedi"
                description={errorMessage}
                action={{ label: 'Tekrar Dene', onClick: loadSettings }}
              />
            </div>
          ) : (
            <div className="max-w-5xl">
              <Tabs defaultValue="business" className="space-y-4 lg:space-y-6">
                <TabsList className="flex w-full justify-start overflow-x-auto border border-gray-200 bg-white p-1">
                  <TabsTrigger value="business" className="gap-1.5 whitespace-nowrap text-xs lg:gap-2 lg:text-sm">
                    <Building2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    İş Yeri
                  </TabsTrigger>
                  <TabsTrigger value="terminals" className="gap-1.5 whitespace-nowrap text-xs lg:gap-2 lg:text-sm">
                    <CreditCard className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    Terminaller
                  </TabsTrigger>
                  <TabsTrigger value="users" className="gap-1.5 whitespace-nowrap text-xs lg:gap-2 lg:text-sm">
                    <Users className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    Kullanıcılar
                  </TabsTrigger>
                  <TabsTrigger value="permissions" className="gap-1.5 whitespace-nowrap text-xs lg:gap-2 lg:text-sm">
                    <Shield className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    Yetkiler
                  </TabsTrigger>
                  <TabsTrigger value="printer" className="gap-1.5 whitespace-nowrap text-xs lg:gap-2 lg:text-sm">
                    <Printer className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    Yazıcı
                  </TabsTrigger>
                  <TabsTrigger value="integration" className="gap-1.5 whitespace-nowrap text-xs lg:gap-2 lg:text-sm">
                    <Plug className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    Entegrasyon
                  </TabsTrigger>
                  <TabsTrigger value="appearance" className="gap-1.5 whitespace-nowrap text-xs lg:gap-2 lg:text-sm">
                    <Palette className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    Görünüm
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="business">
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                    <h2 className="mb-4 text-base font-semibold text-gray-900 lg:mb-6 lg:text-lg">İş Yeri Bilgileri</h2>
                    {businessForm ? (
                      <div className="max-w-2xl space-y-3 lg:space-y-4">
                        <div>
                          <Label htmlFor="business-name" className="text-sm">İş Yeri Adı</Label>
                          <Input id="business-name" value={businessForm.name} onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })} className="mt-2 h-10 lg:h-auto" />
                        </div>
                        <div>
                          <Label htmlFor="business-code" className="text-sm">İş Yeri Kodu</Label>
                          <Input id="business-code" value={businessForm.code} onChange={(e) => setBusinessForm({ ...businessForm, code: e.target.value })} className="mt-2 h-10 lg:h-auto" />
                        </div>
                        <div>
                          <Label htmlFor="merchant-no" className="text-sm">Üye İşyeri No</Label>
                          <Input id="merchant-no" value={businessForm.merchantNumber} onChange={(e) => setBusinessForm({ ...businessForm, merchantNumber: e.target.value })} className="mt-2 h-10 lg:h-auto" />
                        </div>
                        <div>
                          <Label htmlFor="tax-number" className="text-sm">Vergi Numarası</Label>
                          <Input id="tax-number" value={businessForm.taxNumber} onChange={(e) => setBusinessForm({ ...businessForm, taxNumber: e.target.value })} className="mt-2 h-10 lg:h-auto" />
                        </div>
                        <div>
                          <Label htmlFor="address" className="text-sm">Adres</Label>
                          <Input id="address" value={businessForm.address} onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })} className="mt-2 h-10 lg:h-auto" />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-sm">Telefon</Label>
                          <Input id="phone" value={businessForm.phone} onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })} className="mt-2 h-10 lg:h-auto" />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-sm">E-posta</Label>
                          <Input id="email" type="email" value={businessForm.email} onChange={(e) => setBusinessForm({ ...businessForm, email: e.target.value })} className="mt-2 h-10 lg:h-auto" />
                        </div>

                        <Button onClick={handleSaveBusiness} disabled={isSavingBusiness} className="bg-[#d4a017] hover:bg-[#c49316] h-10 lg:h-auto">
                          <Save className="mr-2 h-4 w-4" />
                          {isSavingBusiness ? 'Kaydediliyor...' : 'Kaydet'}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </TabsContent>

                <TabsContent value="terminals">
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                    <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center lg:mb-6">
                      <h2 className="text-base font-semibold text-gray-900 lg:text-lg">Terminal Eşleştirme</h2>
                      <Button variant="outline" size="sm" className="text-xs lg:text-sm" onClick={() => navigate('/terminal-management')}>
                        Terminal Yönetimine Git
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {terminals.map((terminal) => (
                        <div key={terminal.id} className="flex flex-col items-start justify-between gap-3 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center lg:p-4">
                          <div className="flex items-center gap-3 lg:gap-4">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 lg:h-12 lg:w-12">
                              <CreditCard className="h-5 w-5 text-blue-600 lg:h-6 lg:w-6" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 lg:text-base">
                                {terminal.terminalNo} - {localizeText(terminal.deviceName)}
                              </div>
                              <div className="text-xs text-gray-600 lg:text-sm">
                                Kasa: {localizeText(terminal.cashRegisterName)} • {toUiTerminalStatus(terminal.status)}
                              </div>
                            </div>
                          </div>
                          <div className="self-end sm:self-auto">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                              terminal.status === 'Bagli' ? 'bg-green-100 text-green-700' :
                              terminal.status === 'Cevrimdisi' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {toUiTerminalStatus(terminal.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="users">
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                    <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center lg:mb-6">
                      <h2 className="text-base font-semibold text-gray-900 lg:text-lg">Kullanıcı Yönetimi</h2>
                      <div className="text-xs text-gray-500 lg:text-sm">{users.length} kayıt</div>
                    </div>
                    <div className="space-y-3">
                      {users.map((user) => (
                        <div key={user.id} className="flex flex-col items-start justify-between gap-3 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center lg:p-4">
                          <div className="flex items-center gap-3 lg:gap-4">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700 lg:h-12 lg:w-12 lg:text-base">
                              {localizeText(user.fullName).split(' ').map((part) => part[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 lg:text-base">{localizeText(user.fullName)}</div>
                              <div className="text-xs text-gray-600 lg:text-sm">
                                {user.email} • {localizeText(user.roleName)}
                              </div>
                            </div>
                          </div>
                          <div className="self-end sm:self-auto">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {user.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="permissions">
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                    <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center lg:mb-6">
                      <h2 className="text-base font-semibold text-gray-900 lg:text-lg">Rol ve Yetki Ayarları</h2>
                      <Button onClick={() => navigate('/role-permissions')} className="bg-[#d4a017] hover:bg-[#c49316]">
                        Yetki Matrisini Aç
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {roleMatrix.map((role) => (
                        <div key={role.roleId} className="rounded-lg border border-gray-200 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">{localizeText(role.roleName)}</div>
                              <div className="text-xs text-gray-600">{role.userCount} kullanıcı</div>
                            </div>
                            <div className="text-sm font-semibold text-[#d4a017]">
                              {role.permissions.filter((permission) => permission.isEnabled).length}/{role.permissions.length} yetki aktif
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {role.permissions.filter((permission) => permission.isEnabled).map((permission) => (
                              <span key={permission.permissionId} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                                {toUiPermissionLabel(permission)}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="printer">
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                    <h2 className="mb-4 text-base font-semibold text-gray-900 lg:mb-6 lg:text-lg">Yazıcı Ayarları</h2>
                    <div className="max-w-2xl space-y-3 lg:space-y-4">
                      <div>
                        <Label htmlFor="printer-name" className="text-sm">Yazıcı</Label>
                        <Input id="printer-name" value={printerForm.printerName} onChange={(e) => setPrinterForm({ ...printerForm, printerName: e.target.value })} className="mt-2 h-10 lg:h-auto" />
                      </div>
                      <div>
                        <Label htmlFor="printer-ip" className="text-sm">Yazıcı IP Adresi</Label>
                        <Input id="printer-ip" value={printerForm.ipAddress} onChange={(e) => setPrinterForm({ ...printerForm, ipAddress: e.target.value })} className="mt-2 h-10 lg:h-auto" />
                      </div>

                      <div className="space-y-3 pt-3 lg:space-y-4 lg:pt-4">
                        <div className="flex items-center justify-between">
                          <div className="pr-3">
                            <div className="text-sm font-medium text-gray-900 lg:text-base">Otomatik Yazdırma</div>
                            <div className="text-xs text-gray-600 lg:text-sm">Ödeme sonrası otomatik fiş yazdır</div>
                          </div>
                          <Switch checked={printerForm.autoPrintReceipt} onCheckedChange={(checked) => setPrinterForm({ ...printerForm, autoPrintReceipt: checked })} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="pr-3">
                            <div className="text-sm font-medium text-gray-900 lg:text-base">İkili Yazdırma</div>
                            <div className="text-xs text-gray-600 lg:text-sm">Müşteri ve mutfak için ayrı fiş</div>
                          </div>
                          <Switch checked={printerForm.printKitchenCopy} onCheckedChange={(checked) => setPrinterForm({ ...printerForm, printKitchenCopy: checked })} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="pr-3">
                            <div className="text-sm font-medium text-gray-900 lg:text-base">Logo Yazdır</div>
                            <div className="text-xs text-gray-600 lg:text-sm">Fişte iş yeri logosu göster</div>
                          </div>
                          <Switch checked={printerForm.printLogo} onCheckedChange={(checked) => setPrinterForm({ ...printerForm, printLogo: checked })} />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 lg:gap-3 lg:pt-4">
                        <Button onClick={handleSavePrinter} disabled={isSavingPrinter} className="bg-[#d4a017] hover:bg-[#c49316] h-10 lg:h-auto">
                          <Save className="mr-2 h-4 w-4" />
                          {isSavingPrinter ? 'Kaydediliyor...' : 'Kaydet'}
                        </Button>
                        <Button variant="outline" className="h-10 lg:h-auto">Test Yazdır</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="integration">
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                    <h2 className="mb-4 text-base font-semibold text-gray-900 lg:mb-6 lg:text-lg">Entegrasyon Ayarları</h2>
                    {generalSettings.length === 0 ? (
                      <EmptyState
                        type="no-data"
                        title="Entegrasyon ayarı bulunmadı"
                        description="Bu sekme için kayıtlı uygulama ayarı bulunmuyor."
                      />
                    ) : (
                      <div className="space-y-4">
                        {generalSettings.map((setting) => (
                          <div key={setting.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                            <div className="pr-3">
                              <div className="text-sm font-medium text-gray-900">{setting.key}</div>
                              <div className="mt-1 text-xs text-gray-600">{setting.description || `${setting.group} ayarı`}</div>
                            </div>
                            <div className="text-sm font-semibold text-gray-900">{setting.value}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="appearance">
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                    <h2 className="mb-4 text-base font-semibold text-gray-900 lg:mb-6 lg:text-lg">Tema ve Görünüm</h2>
                    <div className="max-w-2xl space-y-4 lg:space-y-6">
                      <div>
                        <Label className="mb-2 block text-sm lg:mb-3">Renk Teması</Label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:gap-3">
                          {[
                            { name: 'VakıfBank Gold', primary: '#d4a017', secondary: '#2a2d35', value: 'vakifbank-light' },
                            { name: 'Koyu Mavi', primary: '#2563eb', secondary: '#1e293b', value: 'blue-dark' },
                            { name: 'Mor', primary: '#8b5cf6', secondary: '#1e1b4b', value: 'purple-dark' },
                          ].map((theme) => (
                            <button
                              key={theme.value}
                              className={`rounded-lg border-2 p-3 transition-colors lg:p-4 ${activeTheme === theme.value ? 'border-[#d4a017]' : 'border-gray-200 hover:border-[#d4a017]'}`}
                            >
                              <div className="mb-2 flex gap-1.5 lg:gap-2">
                                <div className="h-7 w-7 rounded lg:h-8 lg:w-8" style={{ backgroundColor: theme.primary }} />
                                <div className="h-7 w-7 rounded lg:h-8 lg:w-8" style={{ backgroundColor: theme.secondary }} />
                              </div>
                              <div className="text-xs font-medium text-gray-900 lg:text-sm">{theme.name}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 lg:space-y-4">
                        {appearanceSettings.map((setting) => (
                          <div key={setting.id} className="flex items-center justify-between">
                            <div className="pr-3">
                              <div className="text-sm font-medium text-gray-900 lg:text-base">{setting.key}</div>
                              <div className="text-xs text-gray-600 lg:text-sm">{setting.description || 'Görünüm ayarı'}</div>
                            </div>
                            <div className="text-sm font-semibold text-gray-900">{setting.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
