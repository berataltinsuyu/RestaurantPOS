import { useState } from 'react';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { 
  Building2, 
  CreditCard, 
  Users, 
  Shield, 
  Printer, 
  Plug,
  Palette,
  Save
} from 'lucide-react';

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="pt-16 p-4 lg:p-6">
          {/* Header */}
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Ayarlar</h1>
            <p className="text-xs lg:text-sm text-gray-600 mt-1">Sistem ve iş yeri ayarlarını yönetin</p>
          </div>

          <div className="max-w-5xl">
            <Tabs defaultValue="business" className="space-y-4 lg:space-y-6">
              <TabsList className="bg-white border border-gray-200 p-1 w-full overflow-x-auto flex-nowrap justify-start">
                <TabsTrigger value="business" className="gap-1.5 lg:gap-2 text-xs lg:text-sm whitespace-nowrap">
                  <Building2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  İş Yeri
                </TabsTrigger>
                <TabsTrigger value="terminals" className="gap-1.5 lg:gap-2 text-xs lg:text-sm whitespace-nowrap">
                  <CreditCard className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  Terminaller
                </TabsTrigger>
                <TabsTrigger value="users" className="gap-1.5 lg:gap-2 text-xs lg:text-sm whitespace-nowrap">
                  <Users className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  Kullanıcılar
                </TabsTrigger>
                <TabsTrigger value="permissions" className="gap-1.5 lg:gap-2 text-xs lg:text-sm whitespace-nowrap">
                  <Shield className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  Yetkiler
                </TabsTrigger>
                <TabsTrigger value="printer" className="gap-1.5 lg:gap-2 text-xs lg:text-sm whitespace-nowrap">
                  <Printer className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  Yazıcı
                </TabsTrigger>
                <TabsTrigger value="integration" className="gap-1.5 lg:gap-2 text-xs lg:text-sm whitespace-nowrap">
                  <Plug className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  Entegrasyon
                </TabsTrigger>
                <TabsTrigger value="appearance" className="gap-1.5 lg:gap-2 text-xs lg:text-sm whitespace-nowrap">
                  <Palette className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  Görünüm
                </TabsTrigger>
              </TabsList>

              {/* Business Info */}
              <TabsContent value="business">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 lg:mb-6">İş Yeri Bilgileri</h2>
                  
                  <div className="space-y-3 lg:space-y-4 max-w-2xl">
                    <div>
                      <Label htmlFor="business-name" className="text-sm">İş Yeri Adı</Label>
                      <Input id="business-name" defaultValue="Güneş Cafe & Restaurant" className="mt-2 h-10 lg:h-auto" />
                    </div>

                    <div>
                      <Label htmlFor="business-code" className="text-sm">İş Yeri Kodu</Label>
                      <Input id="business-code" defaultValue="8547293" disabled className="mt-2 h-10 lg:h-auto" />
                    </div>

                    <div>
                      <Label htmlFor="tax-number" className="text-sm">Vergi Numarası</Label>
                      <Input id="tax-number" defaultValue="1234567890" className="mt-2 h-10 lg:h-auto" />
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-sm">Adres</Label>
                      <Input id="address" defaultValue="Bağdat Cad. No: 45, Kadıköy/İstanbul" className="mt-2 h-10 lg:h-auto" />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm">Telefon</Label>
                      <Input id="phone" defaultValue="0216 555 0 123" className="mt-2 h-10 lg:h-auto" />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm">E-posta</Label>
                      <Input id="email" type="email" defaultValue="info@gunescafe.com" className="mt-2 h-10 lg:h-auto" />
                    </div>

                    <Button className="bg-[#d4a017] hover:bg-[#c49316] h-10 lg:h-auto">
                      <Save className="w-4 h-4 mr-2" />
                      Kaydet
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Terminals */}
              <TabsContent value="terminals">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 lg:mb-6">
                    <h2 className="text-base lg:text-lg font-semibold text-gray-900">Terminal Eşleştirme</h2>
                    <Button variant="outline" size="sm" className="text-xs lg:text-sm">Yeni Terminal Ekle</Button>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { id: 'T-001', name: 'Ana Kasa', status: 'Bağlı', ip: '192.168.1.100' },
                      { id: 'T-002', name: 'Arka Salon', status: 'Bağlı', ip: '192.168.1.101' },
                    ].map((terminal) => (
                      <div key={terminal.id} className="border border-gray-200 rounded-lg p-3 lg:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 lg:gap-4">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm lg:text-base text-gray-900">{terminal.id} - {terminal.name}</div>
                            <div className="text-xs lg:text-sm text-gray-600">IP: {terminal.ip}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-3 self-end sm:self-auto">
                          <span className="px-2 lg:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            {terminal.status}
                          </span>
                          <Button variant="outline" size="sm" className="text-xs lg:text-sm h-8 lg:h-auto">Düzenle</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Users */}
              <TabsContent value="users">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 lg:mb-6">
                    <h2 className="text-base lg:text-lg font-semibold text-gray-900">Kullanıcı Yönetimi</h2>
                    <Button variant="outline" size="sm" className="text-xs lg:text-sm">Yeni Kullanıcı Ekle</Button>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { name: 'Ahmet Yılmaz', role: 'Garson', email: 'ahmet@gunescafe.com', status: 'Aktif' },
                      { name: 'Ayşe Demir', role: 'Garson', email: 'ayse@gunescafe.com', status: 'Aktif' },
                      { name: 'Mehmet Kaya', role: 'Kasa Görevlisi', email: 'mehmet@gunescafe.com', status: 'Aktif' },
                    ].map((user, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 lg:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 lg:gap-4">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-full flex items-center justify-center font-semibold text-sm lg:text-base text-purple-700 flex-shrink-0">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-semibold text-sm lg:text-base text-gray-900">{user.name}</div>
                            <div className="text-xs lg:text-sm text-gray-600">{user.email} • {user.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-3 self-end sm:self-auto">
                          <span className="px-2 lg:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            {user.status}
                          </span>
                          <Button variant="outline" size="sm" className="text-xs lg:text-sm h-8 lg:h-auto">Düzenle</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Permissions */}
              <TabsContent value="permissions">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Rol ve Yetki Ayarları</h2>
                  
                  <div className="space-y-4 lg:space-y-6 max-w-2xl">
                    {[
                      { label: 'Masa İşlemleri', description: 'Masa açma, kapama ve düzenleme yetkileri' },
                      { label: 'Ödeme İşlemleri', description: 'POS\'a gönderme ve ödeme alma yetkileri' },
                      { label: 'İndirim Uygulama', description: 'Adisyona indirim uygulama yetkisi' },
                      { label: 'İptal İşlemleri', description: 'Ödeme ve işlem iptal yetkileri' },
                      { label: 'Rapor Görüntüleme', description: 'Finansal raporları görüntüleme yetkisi' },
                      { label: 'Ayar Yönetimi', description: 'Sistem ayarlarını değiştirme yetkisi' },
                    ].map((permission, index) => (
                      <div key={index} className="flex items-center justify-between py-2 lg:py-3 border-b border-gray-200 last:border-0">
                        <div className="pr-3">
                          <div className="font-medium text-sm lg:text-base text-gray-900">{permission.label}</div>
                          <div className="text-xs lg:text-sm text-gray-600 mt-1">{permission.description}</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    ))}

                    <Button className="bg-[#d4a017] hover:bg-[#c49316] h-10 lg:h-auto">
                      <Save className="w-4 h-4 mr-2" />
                      Yetkileri Kaydet
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Printer */}
              <TabsContent value="printer">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Yazıcı Ayarları</h2>
                  
                  <div className="space-y-3 lg:space-y-4 max-w-2xl">
                    <div>
                      <Label htmlFor="printer-name" className="text-sm">Yazıcı</Label>
                      <Input id="printer-name" defaultValue="EPSON TM-T88V" className="mt-2 h-10 lg:h-auto" />
                    </div>

                    <div>
                      <Label htmlFor="printer-ip" className="text-sm">Yazıcı IP Adresi</Label>
                      <Input id="printer-ip" defaultValue="192.168.1.50" className="mt-2 h-10 lg:h-auto" />
                    </div>

                    <div className="space-y-3 lg:space-y-4 pt-3 lg:pt-4">
                      <div className="flex items-center justify-between">
                        <div className="pr-3">
                          <div className="font-medium text-sm lg:text-base text-gray-900">Otomatik Yazdırma</div>
                          <div className="text-xs lg:text-sm text-gray-600">Ödeme sonrası otomatik fiş yazdır</div>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="pr-3">
                          <div className="font-medium text-sm lg:text-base text-gray-900">İkili Yazdırma</div>
                          <div className="text-xs lg:text-sm text-gray-600">Müşteri ve mutfak için ayrı fiş</div>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="pr-3">
                          <div className="font-medium text-sm lg:text-base text-gray-900">Logo Yazdır</div>
                          <div className="text-xs lg:text-sm text-gray-600">Fişte iş yeri logosu göster</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <div className="flex gap-2 lg:gap-3 pt-3 lg:pt-4">
                      <Button className="bg-[#d4a017] hover:bg-[#c49316] h-10 lg:h-auto">
                        <Save className="w-4 h-4 mr-2" />
                        Kaydet
                      </Button>
                      <Button variant="outline" className="h-10 lg:h-auto">Test Yazdır</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Integration */}
              <TabsContent value="integration">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Entegrasyon Ayarları</h2>
                  
                  <div className="space-y-4 lg:space-y-6 max-w-2xl">
                    <div className="space-y-3 lg:space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="pr-3">
                          <div className="font-medium text-sm lg:text-base text-gray-900">VakıfBank POS Entegrasyonu</div>
                          <div className="text-xs lg:text-sm text-gray-600">POS cihazları ile otomatik entegrasyon</div>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="pr-3">
                          <div className="font-medium text-sm lg:text-base text-gray-900">Ön Muhasebe Sistemi</div>
                          <div className="text-xs lg:text-sm text-gray-600">Paraşüt, Logo gibi sistemlerle entegrasyon</div>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="pr-3">
                          <div className="font-medium text-sm lg:text-base text-gray-900">SMS Bildirimleri</div>
                          <div className="text-xs lg:text-sm text-gray-600">Ödeme sonrası müşteri SMS gönderimi</div>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="pr-3">
                          <div className="font-medium text-sm lg:text-base text-gray-900">E-Fatura Entegrasyonu</div>
                          <div className="text-xs lg:text-sm text-gray-600">Otomatik e-fatura kesimi</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <Button className="bg-[#d4a017] hover:bg-[#c49316] h-10 lg:h-auto">
                      <Save className="w-4 h-4 mr-2" />
                      Kaydet
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Appearance */}
              <TabsContent value="appearance">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Tema ve Görünüm</h2>
                  
                  <div className="space-y-4 lg:space-y-6 max-w-2xl">
                    <div>
                      <Label className="mb-2 lg:mb-3 block text-sm">Renk Teması</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 lg:gap-3">
                        {[
                          { name: 'VakıfBank Gold', primary: '#d4a017', secondary: '#2a2d35' },
                          { name: 'Koyu Mavi', primary: '#2563eb', secondary: '#1e293b' },
                          { name: 'Mor', primary: '#8b5cf6', secondary: '#1e1b4b' },
                        ].map((theme, index) => (
                          <button
                            key={index}
                            className="border-2 border-gray-200 rounded-lg p-3 lg:p-4 hover:border-[#d4a017] transition-colors"
                          >
                            <div className="flex gap-1.5 lg:gap-2 mb-2">
                              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded" style={{ backgroundColor: theme.primary }}></div>
                              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded" style={{ backgroundColor: theme.secondary }}></div>
                            </div>
                            <div className="text-xs lg:text-sm font-medium text-gray-900">{theme.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 lg:space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="pr-3">
                          <div className="font-medium text-sm lg:text-base text-gray-900">Koyu Mod</div>
                          <div className="text-xs lg:text-sm text-gray-600">Sistem genelinde koyu tema</div>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="pr-3">
                          <div className="font-medium text-sm lg:text-base text-gray-900">Kompakt Görünüm</div>
                          <div className="text-xs lg:text-sm text-gray-600">Daha fazla bilgi göstermek için sıkıştırılmış görünüm</div>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="pr-3">
                          <div className="font-medium text-sm lg:text-base text-gray-900">Animasyonlar</div>
                          <div className="text-xs lg:text-sm text-gray-600">Geçiş animasyonlarını göster</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <Button className="bg-[#d4a017] hover:bg-[#c49316] h-10 lg:h-auto">
                      <Save className="w-4 h-4 mr-2" />
                      Kaydet
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}