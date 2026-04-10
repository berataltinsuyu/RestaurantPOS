import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Menu, Search, Users, Clock, Filter, Plus, LogOut, MoreVertical, Move, GitMerge, Split, Settings } from 'lucide-react';
import { mockTables } from '../data/mockData';

export default function MobileTables() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showMenu, setShowMenu] = useState(false);
  const [showTableActions, setShowTableActions] = useState<string | null>(null);
  const [showGlobalActions, setShowGlobalActions] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const stats = {
    activeTables: mockTables.filter(t => t.status === 'Dolu').length,
    available: mockTables.filter(t => t.status === 'Boş').length,
    pending: mockTables.filter(t => t.status === 'Ödeme Bekliyor').length,
  };

  const filteredTables = mockTables.filter(table => {
    const matchesSearch = table.number.toString().includes(searchQuery);
    const matchesFilter = filterStatus === 'all' || table.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusConfig = {
    'Boş': { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-700', dot: 'bg-gray-400' },
    'Dolu': { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', dot: 'bg-blue-500' },
    'Ödeme Bekliyor': { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', dot: 'bg-amber-500' },
    'Ödendi': { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', dot: 'bg-green-500' },
  };

  const handleTableClick = (table: typeof mockTables[0]) => {
    if (table.status === 'Boş') {
      navigate(`/mobile/table-action/${table.id}`);
    } else {
      navigate(`/mobile/order/${table.id}`);
    }
  };

  const handleLongPress = (table: typeof mockTables[0]) => {
    longPressTimer.current = setTimeout(() => {
      setShowTableActions(table.id);
    }, 500);
  };

  const handleTableRelease = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#d4a017] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900">Masa Planı</h1>
                <p className="text-xs text-gray-600">Ahmet Yılmaz - Garson</p>
              </div>
            </div>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 flex items-center justify-center text-gray-600"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 border-2 border-gray-200 rounded-lg focus:border-[#d4a017] focus:outline-none text-sm"
              placeholder="Masa ara..."
            />
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
          <div className="flex-1 min-w-[100px] bg-blue-50 border border-blue-200 rounded-lg p-2.5">
            <div className="text-xs text-blue-700 mb-0.5">Dolu</div>
            <div className="text-lg font-bold text-blue-900">{stats.activeTables}</div>
          </div>
          <div className="flex-1 min-w-[100px] bg-gray-50 border border-gray-300 rounded-lg p-2.5">
            <div className="text-xs text-gray-700 mb-0.5">Müsait</div>
            <div className="text-lg font-bold text-gray-900">{stats.available}</div>
          </div>
          <div className="flex-1 min-w-[100px] bg-amber-50 border border-amber-200 rounded-lg p-2.5">
            <div className="text-xs text-amber-700 mb-0.5">Bekliyor</div>
            <div className="text-lg font-bold text-amber-900">{stats.pending}</div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'all'
                ? 'bg-[#d4a017] text-white'
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilterStatus('Dolu')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'Dolu'
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            Dolu
          </button>
          <button
            onClick={() => setFilterStatus('Boş')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'Boş'
                ? 'bg-gray-500 text-white'
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            Boş
          </button>
          <button
            onClick={() => setFilterStatus('Ödeme Bekliyor')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'Ödeme Bekliyor'
                ? 'bg-amber-500 text-white'
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            Ödeme
          </button>
        </div>

        {/* Table Actions Button */}
        <div className="px-4 pb-3">
          <button
            onClick={() => setShowGlobalActions(true)}
            className="w-full h-11 bg-white border-2 border-[#d4a017] text-[#d4a017] rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Settings className="w-4 h-4" />
            Masa İşlemleri
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredTables.map((table) => {
            const config = statusConfig[table.status];
            const isActive = table.status !== 'Boş' && table.status !== 'Ödendi';

            return (
              <button
                key={table.id}
                onClick={() => handleTableClick(table)}
                onMouseDown={() => handleLongPress(table)}
                onMouseUp={handleTableRelease}
                onTouchStart={() => handleLongPress(table)}
                onTouchEnd={handleTableRelease}
                className={`${config.bg} border-2 ${config.border} rounded-xl p-4 text-left transition-all active:scale-95`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-base text-gray-900">M-{table.number}</div>
                  <div className={`flex items-center gap-1 ${config.text} text-xs font-medium`}>
                    <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
                  </div>
                </div>

                {/* Details */}
                {isActive ? (
                  <>
                    <div className="space-y-1 mb-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{table.guests} Kişi</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{table.time}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-600 mb-0.5">Tutar</div>
                      <div className="text-lg font-bold text-gray-900">
                        ₺{table.total.toFixed(2)}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-3">
                    <div className="text-sm text-gray-500 mb-2">Müsait</div>
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#d4a017] bg-[#d4a017]/10 px-2.5 py-1 rounded-lg">
                      <Plus className="w-3 h-3" />
                      Aç
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Overlay */}
      {showMenu && (
        <div
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-1">Ahmet Yılmaz</h3>
              <p className="text-sm text-gray-600">Garson</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate('/mobile/tables');
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-900"
              >
                Masa Planı
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate('/mobile/login');
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 text-sm font-medium text-red-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Actions Overlay */}
      {showTableActions && (
        <div
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setShowTableActions(null)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-1">Masa Eylemleri</h3>
              <p className="text-sm text-gray-600">Masa-{showTableActions}</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowTableActions(null);
                  navigate(`/mobile/table-action/${showTableActions}`);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-900"
              >
                Masa Aç
              </button>
              <button
                onClick={() => {
                  setShowTableActions(null);
                  navigate(`/mobile/order/${showTableActions}`);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-900"
              >
                Sipariş Görüntüle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Actions Bottom Sheet */}
      {showGlobalActions && (
        <div
          className="fixed inset-0 bg-black/50 z-20 flex items-end"
          onClick={() => setShowGlobalActions(false)}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-bold text-lg text-gray-900">Masa İşlemleri</h3>
              <p className="text-sm text-gray-600">Tüm masalar için işlemler</p>
            </div>

            {/* Actions */}
            <div className="p-4 space-y-3">
              {/* Move Table */}
              <button
                onClick={() => {
                  setShowGlobalActions(false);
                  navigate('/mobile/table-selection?action=move');
                }}
                className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 transition-all active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Move className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-gray-900">Masa Taşı</div>
                    <div className="text-sm text-gray-600">Bir masayı başka bir numaraya taşı</div>
                  </div>
                </div>
              </button>

              {/* Merge Tables */}
              <button
                onClick={() => {
                  setShowGlobalActions(false);
                  navigate('/mobile/table-selection?action=merge');
                }}
                className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 transition-all active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <GitMerge className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-gray-900">Masa Birleştir</div>
                    <div className="text-sm text-gray-600">Birden fazla masayı birleştir</div>
                  </div>
                </div>
              </button>

              {/* Split Table */}
              <button
                onClick={() => {
                  setShowGlobalActions(false);
                  navigate('/mobile/table-selection?action=split');
                }}
                className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 transition-all active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Split className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-gray-900">Masa Ayır</div>
                    <div className="text-sm text-gray-600">Bir masayı birden fazla masaya böl</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}