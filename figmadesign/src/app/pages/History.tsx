import { useState } from 'react';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { StatusBadge } from '../components/StatusBadge';
import { TransactionDetailDrawer } from '../components/TransactionDetailDrawer';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { mockTransactions } from '../data/mockData';
import { Search, Filter, Download, Eye } from 'lucide-react';

export default function History() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredTransactions = mockTransactions.filter(t => {
    const matchesSearch = 
      t.billNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tableNo.toString().includes(searchQuery) ||
      t.referenceNo?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesDate = dateFilter === 'all' || t.date === '07.04.2026';
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Convert mock transaction to detail format
  const convertToDetailFormat = (transaction: typeof mockTransactions[0]) => {
    const statusMap: any = {
      'Başarılı': 'success',
      'Başarısız': 'failed',
      'İptal': 'refunded',
    };

    return {
      id: transaction.id,
      receiptNo: transaction.billNo,
      tableNo: `Masa ${transaction.tableNo}`,
      waiter: transaction.tableNo <= 5 ? 'Ahmet Yılmaz' : transaction.tableNo <= 10 ? 'Ayşe Kaya' : 'Mehmet Demir',
      terminalId: transaction.terminalNo,
      terminalName: transaction.terminalNo === 'VKB-TRM-01' ? 'Ana Kasa POS 1' : 
                    transaction.terminalNo === 'VKB-TRM-02' ? 'Garson POS 1' : 'Ana Kasa POS 2',
      paymentType: transaction.paymentType,
      amount: transaction.amount,
      bankReference: transaction.referenceNo,
      authCode: transaction.status === 'Başarılı' ? Math.random().toString(36).substring(2, 8).toUpperCase() : undefined,
      cardLastFour: transaction.paymentType.includes('Kart') ? '4532' : undefined,
      date: transaction.date,
      time: transaction.time,
      status: statusMap[transaction.status] || 'pending',
      errorReason: transaction.status === 'Başarısız' ? 'Kart limiti yetersiz. İşlem reddedildi.' : undefined,
      items: [
        { name: 'Izgara Köfte', quantity: 2, price: 145.00, total: 290.00 },
        { name: 'Karışık Salata', quantity: 1, price: 65.00, total: 65.00 },
        { name: 'Mercimek Çorbası', quantity: 2, price: 45.00, total: 90.00 },
        { name: 'İçecek (Ayran)', quantity: 3, price: 25.00, total: 75.00 },
      ].slice(0, Math.floor(transaction.amount / 100)),
      timeline: transaction.status === 'Başarılı' ? [
        { label: 'Adisyon Oluşturuldu', timestamp: `${transaction.date} ${transaction.time.split(':')[0]}:${String(Number(transaction.time.split(':')[1]) - 35).padStart(2, '0')}`, status: 'completed' as const, detail: `Garson tarafından masa ${transaction.tableNo} için adisyon açıldı` },
        { label: 'Ödeme Talebi Alındı', timestamp: `${transaction.date} ${transaction.time.split(':')[0]}:${String(Number(transaction.time.split(':')[1]) - 2).padStart(2, '0')}`, status: 'completed' as const, detail: `Terminal ${transaction.terminalNo} üzerinden ödeme başlatıldı` },
        { label: 'Banka Onayı Bekleniyor', timestamp: `${transaction.date} ${transaction.time.split(':')[0]}:${String(Number(transaction.time.split(':')[1]) - 1).padStart(2, '0')}`, status: 'completed' as const },
        { label: 'Ödeme Başarılı', timestamp: `${transaction.date} ${transaction.time}`, status: 'completed' as const, detail: `Referans No: ${transaction.referenceNo}` },
      ] : [
        { label: 'Adisyon Oluşturuldu', timestamp: `${transaction.date} ${transaction.time.split(':')[0]}:${String(Number(transaction.time.split(':')[1]) - 35).padStart(2, '0')}`, status: 'completed' as const },
        { label: 'Ödeme Talebi Alındı', timestamp: `${transaction.date} ${transaction.time.split(':')[0]}:${String(Number(transaction.time.split(':')[1]) - 2).padStart(2, '0')}`, status: 'completed' as const },
        { label: 'Banka Onayı Bekleniyor', timestamp: `${transaction.date} ${transaction.time.split(':')[0]}:${String(Number(transaction.time.split(':')[1]) - 1).padStart(2, '0')}`, status: 'completed' as const },
        { label: 'İşlem Başarısız', timestamp: `${transaction.date} ${transaction.time}`, status: 'failed' as const, detail: 'Kart limiti yetersiz' },
      ],
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="pt-16 p-4 lg:p-6">
          {/* Header */}
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">İşlem Geçmişi</h1>
            <p className="text-xs lg:text-sm text-gray-600 mt-1">Tüm ödeme işlemlerini görüntüleyin</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 mb-4 lg:mb-6">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Adisyon no, masa no, referans no..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 lg:h-auto"
                />
              </div>

              {/* Date Filter */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full lg:w-48 h-10 lg:h-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Tarihler</SelectItem>
                  <SelectItem value="today">Bugün</SelectItem>
                  <SelectItem value="yesterday">Dün</SelectItem>
                  <SelectItem value="week">Bu Hafta</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48 h-10 lg:h-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="Başarılı">Başarılı</SelectItem>
                  <SelectItem value="Başarısız">Başarısız</SelectItem>
                  <SelectItem value="İptal">İptal</SelectItem>
                </SelectContent>
              </Select>

              {/* Export */}
              <Button variant="outline" className="gap-2 h-10 lg:h-auto">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Dışa Aktar</span>
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Tarih/Saat
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Masa
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                      Adisyon No
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider hidden md:table-cell">
                      Terminal
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                      Ödeme Tipi
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <div className="text-xs lg:text-sm text-gray-900">{transaction.date}</div>
                        <div className="text-xs text-gray-500">{transaction.time}</div>
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <div className="text-xs lg:text-sm font-medium text-gray-900">Masa {transaction.tableNo}</div>
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-xs lg:text-sm font-mono text-gray-900">{transaction.billNo}</div>
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="text-xs lg:text-sm text-gray-900">{transaction.terminalNo}</div>
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-xs lg:text-sm text-gray-900">{transaction.paymentType}</div>
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <div className="text-xs lg:text-sm font-semibold text-gray-900">
                          ₺{transaction.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <StatusBadge status={transaction.status} size="sm" />
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedTransaction(convertToDetailFormat(transaction))}
                          className="text-[#d4a017] hover:text-[#b8860b] font-medium text-xs lg:text-sm flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                          <span className="hidden sm:inline">Detay</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-xs lg:text-sm text-gray-600">
                Toplam {filteredTransactions.length} işlem
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled className="h-8 lg:h-auto text-xs lg:text-sm">
                  Önceki
                </Button>
                <Button variant="outline" size="sm" disabled className="h-8 lg:h-auto text-xs lg:text-sm">
                  Sonraki
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Detail Drawer */}
      <TransactionDetailDrawer
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />
    </div>
  );
}
