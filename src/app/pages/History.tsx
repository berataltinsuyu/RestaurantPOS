import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { StatusBadge } from '../components/StatusBadge';
import {
  TransactionDetailDrawer,
  type TransactionDetail as TransactionDetailViewModel,
} from '../components/TransactionDetailDrawer';
import { AccessDeniedState } from '../components/enterprise/AccessDeniedState';
import { EmptyState } from '../components/enterprise/EmptyState';
import { LoadingSkeleton } from '../components/enterprise/LoadingSkeleton';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { transactionsApi } from '../lib/api';
import { getErrorMessage, isForbiddenError } from '../lib/error-utils';
import {
  formatCurrency,
  formatDate,
  formatTime,
  localizeText,
  toDrawerTransactionStatus,
  toUiPaymentType,
  toUiTimelineDetail,
  toUiTransactionStatus,
  toUiTransactionType,
} from '../lib/mappers';
import type { TransactionDetailDto, TransactionHistoryItemDto } from '../types/api';
import { Download, Eye, Search } from 'lucide-react';

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const normalizeTableLabel = (tableNo: string) => {
  if (!tableNo) {
    return '-';
  }

  return /^masa/i.test(tableNo) ? localizeText(tableNo) : `Masa ${localizeText(tableNo)}`;
};

const mapTransactionDetail = (detail: TransactionDetailDto): TransactionDetailViewModel => {
  const transactionDate = new Date(detail.transactionDate);

  return {
    id: detail.id,
    receiptNo: detail.receiptNo,
    tableNo: normalizeTableLabel(detail.tableNo),
    waiter: localizeText(detail.waiter),
    terminalId: detail.terminalId,
    terminalName: localizeText(detail.terminalName),
    transactionType: toUiTransactionType(detail.transactionTypeLabel),
    paymentType: toUiPaymentType(detail.paymentType),
    amount: detail.amount,
    bankReference: detail.bankReference ?? undefined,
    originalReferenceNo: detail.originalReferenceNo ?? undefined,
    originalPaymentId: detail.originalPaymentId ?? undefined,
    authCode: detail.authCode ?? undefined,
    cardLastFour: detail.cardLastFour ?? undefined,
    date: formatDate(transactionDate.toISOString()),
    time: formatTime(transactionDate.toISOString()),
    status: toDrawerTransactionStatus(detail.status, detail.transactionTypeLabel),
    errorReason: detail.errorReason ? localizeText(detail.errorReason) : undefined,
    notes: detail.notes ? localizeText(detail.notes) : undefined,
    refundReason: detail.refundReason ? localizeText(detail.refundReason) : undefined,
    canRefund: detail.transactionTypeLabel === 'Odeme' && detail.status === 'Basarili',
    items: detail.items.map((item) => ({
      name: localizeText(item.productNameSnapshot),
      quantity: item.quantity,
      price: item.unitPrice,
      total: item.lineTotal,
    })),
    timeline: detail.timeline.map((item) => ({
      label: localizeText(item.label),
      timestamp: formatDate(item.timestamp) === '-'
        ? item.timestamp
        : `${formatDate(item.timestamp)} ${formatTime(item.timestamp)}`,
      status: item.status === 'failed' ? 'failed' : item.status === 'completed' ? 'completed' : 'pending',
      detail: toUiTimelineDetail(item.detail),
    })),
  };
};

export default function History() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState<TransactionHistoryItemDto[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetailViewModel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForbidden, setIsForbidden] = useState(false);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setIsForbidden(false);
    setErrorMessage('');

    try {
      const response = await transactionsApi.history();
      setTransactions(response);
    } catch (error) {
      if (isForbiddenError(error)) {
        setIsForbidden(true);
        setErrorMessage('Bu ekrana erişim yetkiniz bulunmuyor.');
      } else {
        setErrorMessage(getErrorMessage(error, 'İşlem geçmişi alınamadı.'));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filteredTransactions = useMemo(() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 6);

    return transactions.filter((transaction) => {
      const statusLabel = toUiTransactionStatus(transaction.statusLabel);
      const matchesSearch =
        transaction.billNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        localizeText(transaction.tableNo).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.referenceNo ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        toUiTransactionType(transaction.transactionTypeLabel).toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || statusLabel === statusFilter;

      const transactionDate = new Date(transaction.transactionDate);
      const matchesDate =
        dateFilter === 'all' ||
        (dateFilter === 'today' && isSameDay(transactionDate, today)) ||
        (dateFilter === 'yesterday' && isSameDay(transactionDate, yesterday)) ||
        (dateFilter === 'week' && transactionDate >= weekAgo && transactionDate <= today);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [dateFilter, searchQuery, statusFilter, transactions]);

  const handleOpenDetail = async (transactionId: number) => {
    setIsDetailLoading(transactionId);
    try {
      const detail = await transactionsApi.detail(transactionId);
      setSelectedTransaction(mapTransactionDetail(detail));
    } catch (error) {
      toast.error(getErrorMessage(error, 'İşlem detayı alınamadı.'));
    } finally {
      setIsDetailLoading(null);
    }
  };

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      toast.error('Dışa aktarılacak işlem bulunmuyor.');
      return;
    }

    const rows = [
      ['Tarih', 'Saat', 'Masa', 'Adisyon No', 'Terminal', 'İşlem Tipi', 'Ödeme Tipi', 'Tutar', 'Durum', 'Referans No'],
      ...filteredTransactions.map((transaction) => {
        const date = new Date(transaction.transactionDate);
        return [
          formatDate(date.toISOString()),
          formatTime(date.toISOString()),
          normalizeTableLabel(transaction.tableNo),
          transaction.billNo,
          transaction.terminalNo,
          toUiTransactionType(transaction.transactionTypeLabel),
          toUiPaymentType(transaction.paymentTypeLabel),
          transaction.amount.toFixed(2),
          toUiTransactionStatus(transaction.statusLabel),
          transaction.referenceNo ?? '',
        ];
      }),
    ];

    const blob = new Blob(
      ['\ufeff' + rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n')],
      { type: 'text/csv;charset=utf-8;' },
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'islem-gecmisi.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleStartRefund = (transaction: TransactionDetailViewModel) => {
    navigate('/refund-cancel', {
      state: {
        paymentId: Number(transaction.id),
        adisyonNo: transaction.receiptNo,
        masaNo: transaction.tableNo,
        terminalNo: transaction.terminalId,
        referansNo: transaction.bankReference,
        odemeTipi: transaction.paymentType,
        islemTarihi: `${transaction.date} ${transaction.time}`,
        tutar: transaction.amount,
        kartSonDort: transaction.cardLastFour,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <div className="px-4 pb-6 pt-20 lg:px-6 lg:pb-8">
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">İşlem Geçmişi</h1>
            <p className="mt-1 text-xs text-gray-600 lg:text-sm">Tüm ödeme işlemlerini görüntüleyin</p>
          </div>

          <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:mb-6 lg:p-6">
            <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Adisyon no, masa no, referans no..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-10 h-10 lg:h-auto"
                />
              </div>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="h-10 w-full lg:h-auto lg:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Tarihler</SelectItem>
                  <SelectItem value="today">Bugün</SelectItem>
                  <SelectItem value="yesterday">Dün</SelectItem>
                  <SelectItem value="week">Bu Hafta</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-full lg:h-auto lg:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="Başarılı">Başarılı</SelectItem>
                  <SelectItem value="Başarısız">Başarısız</SelectItem>
                  <SelectItem value="İptal">İptal</SelectItem>
                  <SelectItem value="Beklemede">Beklemede</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="h-10 gap-2 lg:h-auto" onClick={handleExport}>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Dışa Aktar</span>
              </Button>
            </div>
          </div>

          {errorMessage && !isLoading && !isForbidden ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {errorMessage}
            </div>
          ) : null}

          {isLoading ? (
            <LoadingSkeleton type="table" count={7} />
          ) : isForbidden ? (
            <div className="mx-auto max-w-4xl">
              <AccessDeniedState
                onBack={() => navigate(-1)}
                onHome={() => navigate('/dashboard')}
              />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <EmptyState
                type="no-data"
                title="İşlem bulunamadı"
                description="Seçili filtreler için listelenecek bir işlem kaydı bulunmuyor."
                action={{
                  label: 'Filtreleri Sıfırla',
                  onClick: () => {
                    setSearchQuery('');
                    setDateFilter('all');
                    setStatusFilter('all');
                  },
                }}
              />
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 lg:px-6">Tarih/Saat</th>
                      <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 lg:px-6">Masa</th>
                      <th className="hidden px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 sm:table-cell lg:px-6">Adisyon No</th>
                      <th className="hidden px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 md:table-cell lg:px-6">Terminal</th>
                      <th className="hidden px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 xl:table-cell lg:px-6">İşlem Tipi</th>
                      <th className="hidden px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 lg:table-cell lg:px-6">Ödeme Tipi</th>
                      <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 lg:px-6">Tutar</th>
                      <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 lg:px-6">Durum</th>
                      <th className="hidden px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 xl:table-cell lg:px-6">Referans No</th>
                      <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 lg:px-6">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredTransactions.map((transaction) => {
                      const transactionDate = new Date(transaction.transactionDate);
                      const uiStatus = toUiTransactionStatus(transaction.statusLabel) as 'Başarılı' | 'Başarısız' | 'İptal' | 'Beklemede';

                      return (
                        <tr key={transaction.id} className="transition-colors hover:bg-gray-50">
                          <td className="whitespace-nowrap px-3 py-3 lg:px-6 lg:py-4">
                            <div className="text-xs text-gray-900 lg:text-sm">{formatDate(transactionDate.toISOString())}</div>
                            <div className="text-xs text-gray-500">{formatTime(transactionDate.toISOString())}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 lg:px-6 lg:py-4">
                            <div className="text-xs font-medium text-gray-900 lg:text-sm">{normalizeTableLabel(transaction.tableNo)}</div>
                          </td>
                          <td className="hidden whitespace-nowrap px-3 py-3 sm:table-cell lg:px-6 lg:py-4">
                            <div className="font-mono text-xs text-gray-900 lg:text-sm">{transaction.billNo}</div>
                          </td>
                          <td className="hidden whitespace-nowrap px-3 py-3 md:table-cell lg:px-6 lg:py-4">
                            <div className="text-xs text-gray-900 lg:text-sm">{localizeText(transaction.terminalNo)}</div>
                          </td>
                          <td className="hidden whitespace-nowrap px-3 py-3 xl:table-cell lg:px-6 lg:py-4">
                            <div className="text-xs text-gray-900 lg:text-sm">{toUiTransactionType(transaction.transactionTypeLabel)}</div>
                          </td>
                          <td className="hidden whitespace-nowrap px-3 py-3 lg:table-cell lg:px-6 lg:py-4">
                            <div className="text-xs text-gray-900 lg:text-sm">{toUiPaymentType(transaction.paymentTypeLabel)}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 lg:px-6 lg:py-4">
                            <div className="text-xs font-semibold text-gray-900 lg:text-sm">{formatCurrency(transaction.amount)}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 lg:px-6 lg:py-4">
                            <StatusBadge status={uiStatus} size="sm" />
                          </td>
                          <td className="hidden whitespace-nowrap px-3 py-3 xl:table-cell lg:px-6 lg:py-4">
                            <div className="font-mono text-xs text-gray-900 lg:text-sm">{transaction.referenceNo || '-'}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 lg:px-6 lg:py-4">
                            <button
                              onClick={() => handleOpenDetail(transaction.id)}
                              disabled={isDetailLoading === transaction.id}
                              className="flex items-center gap-1 text-xs font-medium text-[#d4a017] transition-colors hover:text-[#b8860b] disabled:opacity-50 lg:text-sm"
                            >
                              <Eye className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                              <span>{isDetailLoading === transaction.id ? 'Yükleniyor...' : 'Detay'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 lg:px-6 lg:py-4">
                <div className="text-xs text-gray-600 lg:text-sm">Toplam {filteredTransactions.length} işlem</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled className="h-8 text-xs lg:h-auto lg:text-sm">Önceki</Button>
                  <Button variant="outline" size="sm" disabled className="h-8 text-xs lg:h-auto lg:text-sm">Sonraki</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <TransactionDetailDrawer
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        onStartRefund={handleStartRefund}
        onViewReceipt={() => toast.success('Fiş görünümü yakında eklenecek.')}
        onPrint={() => toast.success('Yazdırma akışı tarayıcı yazdırma servisine bağlanacak.')}
        onShare={() => toast.success('İşlem paylaşım akışı hazırlanıyor.')}
      />
    </div>
  );
}
