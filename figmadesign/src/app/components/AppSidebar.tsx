import { Link, useLocation } from 'react-router';
import { 
  LayoutGrid, 
  ShoppingBag, 
  CreditCard, 
  Clock, 
  BarChart3, 
  Settings,
  X,
  RotateCcw,
  MonitorCheck,
  CalendarCheck,
  Shield
} from 'lucide-react';

const menuItems = [
  { icon: LayoutGrid, label: 'Masalar', path: '/dashboard' },
  { icon: Clock, label: 'İşlem Geçmişi', path: '/history' },
  { icon: RotateCcw, label: 'İade / İptal', path: '/refund-cancel' },
  { icon: MonitorCheck, label: 'Terminal Yönetimi', path: '/terminal-management' },
  { icon: CalendarCheck, label: 'Gün Sonu Mutabakat', path: '/end-of-day' },
  { icon: BarChart3, label: 'Raporlar', path: '/reports' },
  { icon: Shield, label: 'Rol ve Yetkiler', path: '/role-permissions' },
  { icon: Settings, label: 'Ayarlar', path: '/settings' },
];

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isOpen = true, onClose }: AppSidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        w-64 bg-[#2a2d35] text-white h-screen flex flex-col fixed left-0 top-0 z-50
        transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Area */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#d4a017] rounded flex items-center justify-center font-bold text-lg text-[#2a2d35]">
                V
              </div>
              <div>
                <div className="font-semibold text-base">VakıfBank</div>
                <div className="text-xs text-gray-400">POS Sistemi</div>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button 
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive 
                    ? 'bg-[#d4a017] text-[#2a2d35] font-medium' 
                    : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            <div>Sürüm 2.4.1</div>
            <div className="mt-1">© 2026 VakıfBank</div>
          </div>
        </div>
      </div>
    </>
  );
}