import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { AccessDeniedState } from '../components/enterprise/AccessDeniedState';
import { EmptyState } from '../components/enterprise/EmptyState';
import { LoadingSkeleton } from '../components/enterprise/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { reportsApi } from '../lib/api';
import { getErrorMessage, isForbiddenError } from '../lib/error-utils';
import { formatCurrency, localizeText, toUiPaymentType } from '../lib/mappers';
import type {
  DailyRevenueDto,
  FailedTransactionDto,
  PaymentDistributionDto,
  TablePerformanceDto,
  TerminalPerformanceDto,
} from '../types/api';
import { TrendingUp, TrendingDown, CreditCard, Banknote, XCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const chartColors = ['#3b82f6', '#8b5cf6', '#10b981', '#d4a017'];

const getShortDayName = (dateValue: string) =>
  new Intl.DateTimeFormat('tr-TR', { weekday: 'short' })
    .format(new Date(dateValue))
    .replace('.', '')
    .replace('Çar', 'Çar')
    .replace('Per', 'Per');

export default function Reports() {
  const { session } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenueDto[]>([]);
  const [paymentDistribution, setPaymentDistribution] = useState<PaymentDistributionDto[]>([]);
  const [tablePerformance, setTablePerformance] = useState<TablePerformanceDto[]>([]);
  const [terminalPerformance, setTerminalPerformance] = useState<TerminalPerformanceDto[]>([]);
  const [failedTransactions, setFailedTransactions] = useState<FailedTransactionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForbidden, setIsForbidden] = useState(false);

  const branchId = session?.branch.id;

  const loadReports = useCallback(async () => {
    if (!branchId) {
      return;
    }

    setIsLoading(true);
    setIsForbidden(false);
    setErrorMessage('');

    try {
      const [daily, distribution, tables, terminals, failed] = await Promise.all([
        reportsApi.dailyRevenue(branchId),
        reportsApi.paymentDistribution(branchId),
        reportsApi.tablePerformance(branchId),
        reportsApi.terminalPerformance(branchId),
        reportsApi.failedTransactions(branchId),
      ]);

      setDailyRevenue(daily);
      setPaymentDistribution(distribution);
      setTablePerformance(tables);
      setTerminalPerformance(terminals);
      setFailedTransactions(failed);
    } catch (error) {
      if (isForbiddenError(error)) {
        setIsForbidden(true);
        setErrorMessage('Raporlar ekranına erişim yetkiniz bulunmuyor.');
      } else {
        setErrorMessage(getErrorMessage(error, 'Rapor verileri alınamadı.'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const stats = useMemo(() => {
    const totalRevenue = paymentDistribution.reduce((sum, item) => sum + item.amount, 0);
    const cardTotal = paymentDistribution
      .filter((item) => toUiPaymentType(item.paymentType).includes('Kart'))
      .reduce((sum, item) => sum + item.amount, 0);
    const cashTotal = paymentDistribution
      .filter((item) => toUiPaymentType(item.paymentType).includes('Nakit'))
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      totalRevenue,
      cardTotal,
      cashTotal,
      failedCount: failedTransactions.length,
    };
  }, [failedTransactions.length, paymentDistribution]);

  const revenueChartData = useMemo(
    () =>
      dailyRevenue.map((item) => ({
        id: item.date,
        day: getShortDayName(item.date),
        kart: item.cardAmount,
        nakit: item.cashAmount,
      })),
    [dailyRevenue],
  );

  const terminalChartData = useMemo(
    () =>
      terminalPerformance.map((item, index) => ({
        id: item.terminalId,
        name: item.terminalNo,
        value: item.totalAmount,
        color: chartColors[index % chartColors.length],
      })),
    [terminalPerformance],
  );

  const tableChartData = useMemo(
    () =>
      [...tablePerformance]
        .sort((left, right) => right.revenue - left.revenue)
        .slice(0, 5)
        .map((item) => ({
          id: item.tableId,
          masa: localizeText(item.tableNo),
          ciro: item.revenue,
          islem: item.transactionCount,
        })),
    [tablePerformance],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <div className="px-4 pb-6 pt-20 lg:px-6 lg:pb-8">
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">Raporlar</h1>
            <p className="mt-1 text-xs text-gray-600 lg:text-sm">İşletme performansınızı analiz edin</p>
          </div>

          {errorMessage && !isLoading && !isForbidden ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {errorMessage}
            </div>
          ) : null}

          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
                <LoadingSkeleton type="card" count={4} />
              </div>
              <LoadingSkeleton type="card" count={3} />
            </div>
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
                title="Raporlar yüklenemedi"
                description={errorMessage}
                action={{ label: 'Tekrar Dene', onClick: loadReports }}
              />
            </div>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-2 gap-3 lg:mb-6 lg:grid-cols-4 lg:gap-6">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                  <div className="mb-3 flex items-center justify-between lg:mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 lg:h-12 lg:w-12">
                      <TrendingUp className="h-5 w-5 text-blue-600 lg:h-6 lg:w-6" />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      Veri güncel
                    </div>
                  </div>
                  <div className="mb-1 text-xl font-bold text-gray-900 lg:text-2xl">{formatCurrency(stats.totalRevenue)}</div>
                  <div className="text-xs text-gray-600 lg:text-sm">Toplam Ciro</div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                  <div className="mb-3 flex items-center justify-between lg:mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 lg:h-12 lg:w-12">
                      <CreditCard className="h-5 w-5 text-purple-600 lg:h-6 lg:w-6" />
                    </div>
                    <div className="text-xs font-medium text-purple-600">
                      %{stats.totalRevenue > 0 ? ((stats.cardTotal / stats.totalRevenue) * 100).toFixed(1) : '0.0'}
                    </div>
                  </div>
                  <div className="mb-1 text-xl font-bold text-gray-900 lg:text-2xl">{formatCurrency(stats.cardTotal)}</div>
                  <div className="text-xs text-gray-600 lg:text-sm">Kart Tahsilat</div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                  <div className="mb-3 flex items-center justify-between lg:mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 lg:h-12 lg:w-12">
                      <Banknote className="h-5 w-5 text-green-600 lg:h-6 lg:w-6" />
                    </div>
                    <div className="text-xs font-medium text-green-600">
                      %{stats.totalRevenue > 0 ? ((stats.cashTotal / stats.totalRevenue) * 100).toFixed(1) : '0.0'}
                    </div>
                  </div>
                  <div className="mb-1 text-xl font-bold text-gray-900 lg:text-2xl">{formatCurrency(stats.cashTotal)}</div>
                  <div className="text-xs text-gray-600 lg:text-sm">Nakit Tahsilat</div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                  <div className="mb-3 flex items-center justify-between lg:mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 lg:h-12 lg:w-12">
                      <XCircle className="h-5 w-5 text-red-600 lg:h-6 lg:w-6" />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-red-600">
                      <TrendingDown className="h-3 w-3" />
                      Hata kayıtları
                    </div>
                  </div>
                  <div className="mb-1 text-xl font-bold text-gray-900 lg:text-2xl">{stats.failedCount}</div>
                  <div className="text-xs text-gray-600 lg:text-sm">Başarısız İşlem</div>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4 lg:mb-6 lg:grid-cols-3 lg:gap-6">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2 lg:p-6">
                  <div className="mb-4 lg:mb-6">
                    <h2 className="text-base font-semibold text-gray-900 lg:text-lg">Haftalık Ciro Dağılımı</h2>
                    <p className="mt-1 text-xs text-gray-600 lg:text-sm">Kart ve nakit ödeme karşılaştırması</p>
                  </div>
                  {revenueChartData.length === 0 ? (
                    <EmptyState
                      type="no-data"
                      title="Grafik verisi bulunamadı"
                      description="Seçili dönem için günlük ciro verisi oluşmadı."
                    />
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={revenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            fontSize: '12px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="kart" fill="#3b82f6" name="Kart" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="nakit" fill="#10b981" name="Nakit" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                  <div className="mb-4 lg:mb-6">
                    <h2 className="text-base font-semibold text-gray-900 lg:text-lg">Terminal Dağılımı</h2>
                    <p className="mt-1 text-xs text-gray-600 lg:text-sm">İşlem bazlı performans</p>
                  </div>
                  {terminalChartData.length === 0 ? (
                    <EmptyState
                      type="no-data"
                      title="Terminal verisi bulunamadı"
                      description="Dağılım oluşturacak terminal verisi bulunmuyor."
                    />
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={terminalChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                            outerRadius={70}
                            dataKey="value"
                            style={{ fontSize: '11px' }}
                          >
                            {terminalChartData.map((entry) => (
                              <Cell key={entry.id} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-3 space-y-2 lg:mt-4">
                        {terminalChartData.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs lg:text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-gray-600">{item.name}</span>
                            </div>
                            <span className="font-semibold text-gray-900">{formatCurrency(item.value)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                <div className="mb-4 lg:mb-6">
                  <h2 className="text-base font-semibold text-gray-900 lg:text-lg">Masa Bazlı Performans</h2>
                  <p className="mt-1 text-xs text-gray-600 lg:text-sm">En yüksek ciro yapan masalar</p>
                </div>
                {tableChartData.length === 0 ? (
                  <EmptyState
                    type="no-data"
                    title="Masa performansı bulunamadı"
                    description="Performans karşılaştırması için yeterli işlem verisi yok."
                  />
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={tableChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <YAxis dataKey="masa" type="category" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="ciro" fill="#d4a017" name="Ciro (₺)" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
