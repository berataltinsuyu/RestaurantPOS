import { useNavigate, useParams } from 'react-router';
import { X, UserPlus, ArrowRight, Combine, Split as SplitIcon, Plus } from 'lucide-react';

export default function TableActionMenu() {
  const navigate = useNavigate();
  const { tableId } = useParams();

  const actions = [
    {
      id: 'open',
      label: 'Masa Aç',
      icon: Plus,
      color: 'bg-blue-500',
      action: () => navigate(`/mobile/open-table/${tableId}`)
    },
    {
      id: 'move',
      label: 'Masa Taşı',
      icon: ArrowRight,
      color: 'bg-purple-500',
      action: () => navigate(`/mobile/move-table/${tableId}`)
    },
    {
      id: 'merge',
      label: 'Masa Birleştir',
      icon: Combine,
      color: 'bg-green-500',
      action: () => navigate(`/mobile/merge-table/${tableId}`)
    },
    {
      id: 'split',
      label: 'Masa Ayır',
      icon: SplitIcon,
      color: 'bg-amber-500',
      action: () => navigate(`/mobile/split-table/${tableId}`)
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Masa İşlemleri</h2>
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Masa {tableId}</p>
        </div>

        {/* Actions Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 flex flex-col items-center gap-3 active:scale-95 transition-transform"
                >
                  <div className={`w-16 h-16 ${action.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900 text-center text-sm">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cancel */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}
