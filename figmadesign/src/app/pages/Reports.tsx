import { useState, useMemo } from 'react';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { TrendingUp, TrendingDown, CreditCard, Banknote, XCircle, Users } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const dailyRevenue = useMemo(() => [
    { id: 'pzt', day: 'Pzt', kart: 15400, nakit: 8200 },
    { id: 'sal', day: 'Sal', kart: 18200, nakit: 7800 },
    { id: 'car', day: 'Çar', kart: 16800, nakit: 9100 },
    { id: 'per', day: 'Per', kart: 19500, nakit: 8500 },
    { id: 'cum', day: 'Cum', kart: 22100, nakit: 10200 },
    { id: 'cmt', day: 'Cmt', kart: 25800, nakit: 12400 },
    { id: 'paz', day: 'Paz', kart: 21600, nakit: 9800 },
  ], []);

  const terminalData = useMemo(() => [
    { id: 't001', name: 'T-001', value: 42500, color: '#3b82f6' },
    { id: 't002', name: 'T-002', value: 31200, color: '#8b5cf6' },
  ], []);

  const tablePerformance = useMemo(() => [
    { id: 'm1', masa: 'M-1', ciro: 8400, islem: 12 },
    { id: 'm4', masa: 'M-4', ciro: 7800, islem: 10 },
    { id: 'm6', masa: 'M-6', ciro: 7200, islem: 11 },
    { id: 'm9', masa: 'M-9', ciro: 6900, islem: 9 },
    { id: 'm12', masa: 'M-12', ciro: 6100, islem: 8 },
  ], []);

  const stats = {
    dailyRevenue: 73700,
    cardTotal: 51200,
    cashTotal: 22500,
    failedCount: 3,
  };

  const COLORS = ['#3b82f6', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="pt-16 p-4 lg:p-6">
          {/* Header */}
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Raporlar</h1>
            <p className="text-xs lg:text-sm text-gray-600 mt-1">İşletme performansınızı analiz edin</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
                <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12.5%
                </div>
              </div>
              <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                {stats.dailyRevenue.toLocaleString('tr-TR')} ₺
              </div>
              <div className="text-xs lg:text-sm text-gray-600">Günlük Ciro</div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                </div>
                <div className="text-xs text-purple-600 font-medium">69.5%</div>
              </div>
              <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                {stats.cardTotal.toLocaleString('tr-TR')} ₺
              </div>
              <div className="text-xs lg:text-sm text-gray-600">Kart Tahsilat</div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Banknote className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
                <div className="text-xs text-green-600 font-medium">30.5%</div>
              </div>
              <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                {stats.cashTotal.toLocaleString('tr-TR')} ₺
              </div>
              <div className="text-xs lg:text-sm text-gray-600">Nakit Tahsilat</div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
                </div>
                <div className="text-xs text-red-600 font-medium flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  -2 işlem
                </div>
              </div>
              <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                {stats.failedCount}
              </div>
              <div className="text-xs lg:text-sm text-gray-600">Başarısız İşlem</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
            {/* Daily Revenue Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
              <div className="mb-4 lg:mb-6">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900">Haftalık Ciro Dağılımı</h2>
                <p className="text-xs lg:text-sm text-gray-600 mt-1">Kart ve nakit ödeme karşılaştırması</p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="kart" fill="#3b82f6" name="Kart" radius={[8, 8, 0, 0]} key="bar-kart" />
                  <Bar dataKey="nakit" fill="#10b981" name="Nakit" radius={[8, 8, 0, 0]} key="bar-nakit" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Terminal Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
              <div className="mb-4 lg:mb-6">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900">Terminal Dağılımı</h2>
                <p className="text-xs lg:text-sm text-gray-600 mt-1">İşlem bazlı performans</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={terminalData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    style={{ fontSize: '11px' }}
                  >
                    {terminalData.map((entry, index) => (
                      <Cell key={`terminal-cell-${index}-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 lg:mt-4 space-y-2">
                {terminalData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs lg:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.value.toLocaleString('tr-TR')} ₺</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table Performance */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
            <div className="mb-4 lg:mb-6">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900">Masa Bazlı Performans</h2>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">En yüksek ciro yapan masalar</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tablePerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis dataKey="masa" type="category" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="ciro" fill="#d4a017" name="Ciro (₺)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}