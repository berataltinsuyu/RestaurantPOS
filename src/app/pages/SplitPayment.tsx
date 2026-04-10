import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { mockTables, mockBillItems } from '../data/mockData';
import { 
  ArrowLeft, 
  Plus, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  Trash2, 
  Edit2,
  Users,
  Calculator,
  ShoppingBag,
  Send,
  Clock,
  XCircle,
  AlertCircle,
  RotateCcw,
  Terminal,
  FileText
} from 'lucide-react';

type SplitStatus = 'Bekliyor' | 'POS\'a Gönderildi' | 'Tamamlandı' | 'Başarısız' | 'İptal Edildi';
type PaymentMethod = 'Kart' | 'Nakit';
type SplitMode = 'equal' | 'manual' | 'product';

interface SplitItem {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: SplitStatus;
  referenceNo?: string;
  terminalId?: string;
  error?: string;
  timestamp?: string;
}

export default function SplitPayment() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const table = mockTables.find(t => t.id === tableId);
  const billItems = mockBillItems[tableId!] || [];

  const subtotal = billItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceCharge = subtotal * 0.10;
  const total = subtotal + serviceCharge;

  const [splitMode, setSplitMode] = useState<SplitMode>('manual');
  const [equalParts, setEqualParts] = useState(2);
  const [splits, setSplits] = useState<SplitItem[]>([
    { id: '1', amount: 0, method: 'Kart', status: 'Bekliyor' },
  ]);

  if (!table) {
    return <div>Masa bulunamadı</div>;
  }

  const totalPaid = splits
    .filter(s => s.status === 'Tamamlandı')
    .reduce((sum, split) => sum + split.amount, 0);
  
  const totalPending = splits
    .filter(s => s.status === 'POS\'a Gönderildi' || s.status === 'Bekliyor')
    .reduce((sum, split) => sum + split.amount, 0);
  
  const remaining = total - totalPaid - totalPending;
  const progressPercentage = Math.min(((totalPaid + totalPending) / total) * 100, 100);
  const allCompleted = splits.every(s => s.status === 'Tamamlandı' || s.status === 'İptal Edildi');
  const hasFailures = splits.some(s => s.status === 'Başarısız');

  const handleSplitModeChange = (mode: SplitMode) => {
    setSplitMode(mode);
    
    if (mode === 'equal') {
      // Create equal splits
      const amountPerPerson = total / equalParts;
      const newSplits: SplitItem[] = Array.from({ length: equalParts }, (_, i) => ({
        id: Date.now().toString() + i,
        amount: amountPerPerson,
        method: 'Kart',
        status: 'Bekliyor' as SplitStatus,
      }));
      setSplits(newSplits);
    } else if (mode === 'manual') {
      setSplits([{ id: Date.now().toString(), amount: 0, method: 'Kart', status: 'Bekliyor' }]);
    } else if (mode === 'product') {
      // Product-based split (simplified - equal split)
      const itemsPerPerson = Math.ceil(billItems.length / 2);
      const firstHalf = billItems.slice(0, itemsPerPerson);
      const secondHalf = billItems.slice(itemsPerPerson);
      
      const firstAmount = firstHalf.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.1;
      const secondAmount = secondHalf.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.1;
      
      setSplits([
        { id: '1', amount: firstAmount, method: 'Kart', status: 'Bekliyor' },
        { id: '2', amount: secondAmount, method: 'Kart', status: 'Bekliyor' },
      ]);
    }
  };

  const handleEqualPartsChange = (parts: number) => {
    setEqualParts(parts);
    if (splitMode === 'equal') {
      const amountPerPerson = total / parts;
      const newSplits: SplitItem[] = Array.from({ length: parts }, (_, i) => ({
        id: Date.now().toString() + i,
        amount: amountPerPerson,
        method: 'Kart',
        status: 'Bekliyor' as SplitStatus,
      }));
      setSplits(newSplits);
    }
  };

  const handleAddSplit = () => {
    setSplits([
      ...splits,
      { id: Date.now().toString(), amount: remaining > 0 ? remaining : 0, method: 'Kart', status: 'Bekliyor' },
    ]);
  };

  const handleRemoveSplit = (id: string) => {
    if (splits.length > 1) {
      const split = splits.find(s => s.id === id);
      if (split && split.status === 'Bekliyor') {
        setSplits(splits.filter(s => s.id !== id));
      }
    }
  };

  const handleAmountChange = (id: string, value: string) => {
    const amount = parseFloat(value) || 0;
    setSplits(splits.map(split =>
      split.id === id ? { ...split, amount } : split
    ));
  };

  const handleMethodChange = (id: string, method: PaymentMethod) => {
    setSplits(splits.map(split =>
      split.id === id ? { ...split, method } : split
    ));
  };

  const handleSendToPos = (id: string) => {
    const split = splits.find(s => s.id === id);
    if (!split || split.amount <= 0) return;

    // Update to sent status
    setSplits(splits.map(s =>
      s.id === id
        ? { 
            ...s, 
            status: 'POS\'a Gönderildi' as SplitStatus,
            terminalId: 'VKB-TRM-01',
            timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
          }
        : s
    ));

    // Simulate payment processing
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      setSplits(splits.map(s =>
        s.id === id
          ? { 
              ...s, 
              status: success ? 'Tamamlandı' as SplitStatus : 'Başarısız' as SplitStatus,
              referenceNo: success ? 'REF-' + Math.random().toString().slice(2, 11) : undefined,
              error: success ? undefined : 'Kart limiti yetersiz',
              timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
            }
          : s
      ));
    }, 3000);
  };

  const handleRetry = (id: string) => {
    setSplits(splits.map(s =>
      s.id === id
        ? { ...s, status: 'Bekliyor' as SplitStatus, error: undefined, referenceNo: undefined }
        : s
    ));
  };

  const handleCancel = (id: string) => {
    setSplits(splits.map(s =>
      s.id === id
        ? { ...s, status: 'İptal Edildi' as SplitStatus }
        : s
    ));
  };

  const handleComplete = () => {
    if (allCompleted && Math.abs(remaining) < 0.01 && !hasFailures) {
      navigate('/success', {
        state: {
          paymentType: 'Bölünmüş Ödeme',
          amount: total,
          tableNo: table.number,
        },
      });
    }
  };

  const getStatusConfig = (status: SplitStatus) => {
    switch (status) {
      case 'Bekliyor':
        return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock };
      case 'POS\'a Gönderildi':
        return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Send };
      case 'Tamamlandı':
        return { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 };
      case 'Başarısız':
        return { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle };
      case 'İptal Edildi':
        return { color: 'bg-gray-100 text-gray-500 border-gray-200', icon: XCircle };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="px-4 pb-6 pt-20 lg:px-6 lg:pb-8">
          {/* Header */}
          <div className="mb-4 lg:mb-6">
            <button
              onClick={() => navigate(`/payment/${tableId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 lg:mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="text-sm lg:text-base">Ödeme Ekranına Geri Dön</span>
            </button>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Bölünmüş Ödeme</h1>
            <p className="text-xs lg:text-sm text-gray-600 mt-1">Masa {table.number} - A-{String(table.number).padStart(4, '0')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Left: Summary & Split Methods */}
            <div className="space-y-4 lg:space-y-6">
              {/* Total Summary */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Ödeme Özeti</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Toplam Tutar</span>
                    <span className="font-bold text-gray-900 text-base lg:text-lg">
                      ₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Ödenen</span>
                    <span className="font-semibold text-green-600">
                      ₺{totalPaid.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">İşlemde</span>
                    <span className="font-semibold text-blue-600">
                      ₺{totalPending.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="pt-3 border-t-2 border-gray-200 flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Kalan Tutar</span>
                    <span className={`text-xl font-bold ${
                      remaining > 0.01 ? 'text-amber-600' : 'text-green-600'
                    }`}>
                      ₺{remaining.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span>İlerleme</span>
                    <span className="font-semibold">{progressPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-[#d4a017] transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {remaining > 0.01 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        Kalan tutarı ödemek için bölüm ekleyin veya mevcut bölümleri düzenleyin
                      </p>
                    </div>
                  </div>
                )}

                {hasFailures && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-800">
                        Bazı ödemeler başarısız oldu. Lütfen tekrar deneyin.
                      </p>
                    </div>
                  </div>
                )}

                {allCompleted && Math.abs(remaining) < 0.01 && !hasFailures && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-green-800 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-medium">Tüm ödemeler tamamlandı!</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleComplete}
                  disabled={!allCompleted || Math.abs(remaining) > 0.01 || hasFailures}
                  className="w-full h-11 lg:h-12 bg-[#d4a017] hover:bg-[#b8860b] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
                >
                  Adisyonu Kapat
                </Button>
              </div>

              {/* Split Methods */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Bölme Yöntemi</h2>
                
                <div className="space-y-3">
                  {/* Equal Split */}
                  <button
                    onClick={() => handleSplitModeChange('equal')}
                    className={`w-full flex items-center gap-3 p-3 lg:p-4 rounded-lg border-2 transition-all ${
                      splitMode === 'equal'
                        ? 'border-[#d4a017] bg-[#d4a017]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      splitMode === 'equal' ? 'bg-[#d4a017]' : 'bg-gray-100'
                    }`}>
                      <Users className={`w-5 h-5 ${splitMode === 'equal' ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900 text-sm">Kişi Başı Eşit Böl</div>
                      <div className="text-xs text-gray-600">Tutarı eşit parçalara böl</div>
                    </div>
                  </button>

                  {splitMode === 'equal' && (
                    <div className="ml-4 pl-4 border-l-2 border-[#d4a017] py-2">
                      <label className="text-xs font-medium text-gray-700 mb-2 block">Kişi Sayısı</label>
                      <Select 
                        value={equalParts.toString()} 
                        onValueChange={(v) => handleEqualPartsChange(parseInt(v))}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2, 3, 4, 5, 6, 7, 8].map(n => (
                            <SelectItem key={n} value={n.toString()}>
                              {n} Kişi (₺{(total / n).toFixed(2)} / kişi)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Manual Split */}
                  <button
                    onClick={() => handleSplitModeChange('manual')}
                    className={`w-full flex items-center gap-3 p-3 lg:p-4 rounded-lg border-2 transition-all ${
                      splitMode === 'manual'
                        ? 'border-[#d4a017] bg-[#d4a017]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      splitMode === 'manual' ? 'bg-[#d4a017]' : 'bg-gray-100'
                    }`}>
                      <Calculator className={`w-5 h-5 ${splitMode === 'manual' ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900 text-sm">Manuel Tutar ile Böl</div>
                      <div className="text-xs text-gray-600">Özel tutarlar gir</div>
                    </div>
                  </button>

                  {/* Product Based Split */}
                  <button
                    onClick={() => handleSplitModeChange('product')}
                    className={`w-full flex items-center gap-3 p-3 lg:p-4 rounded-lg border-2 transition-all ${
                      splitMode === 'product'
                        ? 'border-[#d4a017] bg-[#d4a017]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      splitMode === 'product' ? 'bg-[#d4a017]' : 'bg-gray-100'
                    }`}>
                      <ShoppingBag className={`w-5 h-5 ${splitMode === 'product' ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900 text-sm">Ürün Bazlı Böl</div>
                      <div className="text-xs text-gray-600">Ürünleri dağıt</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Split Items */}
            <div className="lg:col-span-2 space-y-4">
              {splits.map((split, index) => {
                const statusConfig = getStatusConfig(split.status);
                const StatusIcon = statusConfig.icon;
                const canEdit = split.status === 'Bekliyor';
                const canSend = split.status === 'Bekliyor' && split.amount > 0;
                const canRetry = split.status === 'Başarısız';
                const canCancel = split.status === 'POS\'a Gönderildi';

                return (
                  <div 
                    key={split.id} 
                    className={`bg-white rounded-xl border-2 shadow-sm p-4 lg:p-6 transition-all ${
                      split.status === 'Tamamlandı' ? 'border-green-200' :
                      split.status === 'Başarısız' ? 'border-red-200' :
                      split.status === 'POS\'a Gönderildi' ? 'border-blue-200' :
                      'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white text-base lg:text-lg shadow-lg">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Ödeme Bölümü {index + 1}</h3>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold mt-1 ${statusConfig.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {split.status}
                          </div>
                        </div>
                      </div>
                      {canEdit && splits.length > 1 && (
                        <button
                          onClick={() => handleRemoveSplit(split.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-2"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                        </button>
                      )}
                    </div>

                    {canEdit ? (
                      <>
                        {/* Amount Input */}
                        <div className="mb-4">
                          <label className="text-xs lg:text-sm font-medium text-gray-700 mb-2 block">
                            Ödeme Tutarı
                          </label>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              value={split.amount}
                              onChange={(e) => handleAmountChange(split.id, e.target.value)}
                              className="h-12 lg:h-14 text-base lg:text-lg font-semibold pr-12"
                              placeholder="0.00"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-base lg:text-lg">
                              ₺
                            </span>
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div className="mb-4">
                          <label className="text-xs lg:text-sm font-medium text-gray-700 mb-2 block">
                            Ödeme Yöntemi
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => handleMethodChange(split.id, 'Kart')}
                              className={`flex items-center justify-center gap-2 p-3 lg:p-4 rounded-lg border-2 transition-all ${
                                split.method === 'Kart'
                                  ? 'border-[#d4a017] bg-[#d4a017]/5'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <CreditCard className="w-4 h-4 lg:w-5 lg:h-5" />
                              <span className="font-medium text-sm lg:text-base">Kart ile</span>
                            </button>
                            <button
                              onClick={() => handleMethodChange(split.id, 'Nakit')}
                              className={`flex items-center justify-center gap-2 p-3 lg:p-4 rounded-lg border-2 transition-all ${
                                split.method === 'Nakit'
                                  ? 'border-[#d4a017] bg-[#d4a017]/5'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <Banknote className="w-4 h-4 lg:w-5 lg:h-5" />
                              <span className="font-medium text-sm lg:text-base">Nakit</span>
                            </button>
                          </div>
                        </div>

                        {/* Send Button */}
                        <Button
                          onClick={() => handleSendToPos(split.id)}
                          disabled={!canSend}
                          className="w-full h-11 lg:h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm lg:text-base"
                        >
                          <Send className="w-4 h-4 lg:w-5 lg:h-5" />
                          {split.method === 'Kart' ? 'POS\'a Gönder' : 'Nakit Onayla'}
                        </Button>
                      </>
                    ) : (
                      <div className={`rounded-lg p-4 border-2 ${
                        split.status === 'Tamamlandı' ? 'bg-green-50 border-green-200' :
                        split.status === 'Başarısız' ? 'bg-red-50 border-red-200' :
                        split.status === 'POS\'a Gönderildi' ? 'bg-blue-50 border-blue-200' :
                        'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center gap-2">
                              <Banknote className="w-4 h-4" />
                              Tutar
                            </span>
                            <span className="font-bold text-lg text-gray-900">
                              ₺{split.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              Yöntem
                            </span>
                            <span className="font-medium text-gray-900">{split.method}</span>
                          </div>
                          {split.terminalId && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 flex items-center gap-2">
                                <Terminal className="w-4 h-4" />
                                Terminal
                              </span>
                              <span className="font-mono text-xs text-gray-900">{split.terminalId}</span>
                            </div>
                          )}
                          {split.referenceNo && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Referans
                              </span>
                              <span className="font-mono text-xs text-gray-900">{split.referenceNo}</span>
                            </div>
                          )}
                          {split.timestamp && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Zaman
                              </span>
                              <span className="text-xs text-gray-900">{split.timestamp}</span>
                            </div>
                          )}
                          {split.error && (
                            <div className="pt-3 border-t border-red-200">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <div className="text-sm font-semibold text-red-900">Hata</div>
                                  <div className="text-xs text-red-800 mt-1">{split.error}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action buttons for failed/pending */}
                        {(canRetry || canCancel) && (
                          <div className="flex gap-2 mt-4">
                            {canRetry && (
                              <Button
                                onClick={() => handleRetry(split.id)}
                                variant="outline"
                                className="flex-1 h-10 text-sm"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Tekrar Dene
                              </Button>
                            )}
                            {canCancel && (
                              <Button
                                onClick={() => handleCancel(split.id)}
                                variant="outline"
                                className="flex-1 h-10 text-sm text-red-600 hover:text-red-700"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                İptal Et
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add Split Button */}
              <button
                onClick={handleAddSplit}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 lg:p-8 hover:border-[#d4a017] hover:bg-[#d4a017]/5 transition-all group"
              >
                <Plus className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400 group-hover:text-[#d4a017] mx-auto mb-2 transition-colors" />
                <span className="text-sm lg:text-base font-medium text-gray-600 group-hover:text-[#d4a017] transition-colors">
                  Yeni Ödeme Bölümü Ekle
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
