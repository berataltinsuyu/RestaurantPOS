import { Users, Clock, Plus } from 'lucide-react';
import { Link } from 'react-router';

interface TableCardProps {
  id: string;
  number: number;
  status: 'Boş' | 'Dolu' | 'Ödeme Bekliyor' | 'Ödendi';
  guests: number;
  total: number;
  time: string;
  onOpenTable?: () => void;
}

const statusConfig = {
  'Boş': { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', dot: 'bg-gray-400' },
  'Dolu': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Ödeme Bekliyor': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Ödendi': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-500' },
};

export function TableCard({ id, number, status, guests, total, time, onOpenTable }: TableCardProps) {
  const config = statusConfig[status];
  const isActive = status !== 'Boş' && status !== 'Ödendi';
  const isEmpty = status === 'Boş';

  const content = (
    <div
      className={`${config.bg} border-2 ${config.border} rounded-xl p-4 transition-all ${
        isActive ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' : ''
      } ${
        isEmpty ? 'hover:shadow-lg hover:border-[#d4a017] cursor-pointer opacity-100' : ''
      } ${
        status === 'Ödendi' ? 'opacity-60' : ''
      }`}
      onClick={isEmpty ? onOpenTable : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-lg text-gray-900">Masa {number}</div>
        <div className={`flex items-center gap-1.5 ${config.text} text-xs font-medium`}>
          <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
          {status}
        </div>
      </div>

      {/* Details */}
      {isActive && (
        <>
          <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{guests} Kişi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{time}</span>
            </div>
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Toplam Tutar</div>
            <div className="text-xl font-bold text-gray-900">
              {total.toFixed(2)} ₺
            </div>
          </div>
        </>
      )}

      {isEmpty && (
        <div className="text-center py-4">
          <div className="text-sm text-gray-400 mb-2">Müsait</div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d4a017] bg-[#d4a017]/10 px-3 py-1.5 rounded-lg">
            <Plus className="w-3.5 h-3.5" />
            Masa Aç
          </div>
        </div>
      )}
    </div>
  );

  return isActive ? <Link to={`/bill/${id}`}>{content}</Link> : content;
}
