import { Search, Bell, ChevronDown, Wifi, Menu } from 'lucide-react';

interface TopBarProps {
  businessName?: string;
  userName?: string;
  terminalStatus?: 'online' | 'offline';
  onMenuClick?: () => void;
}

export function TopBar({ 
  businessName = 'Güneş Cafe & Restaurant', 
  userName = 'Ahmet Yılmaz',
  terminalStatus = 'online',
  onMenuClick
}: TopBarProps) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 fixed top-0 right-0 left-0 lg:left-64 z-10">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        
        {/* Business Name */}
        <div>
          <h1 className="text-base lg:text-lg font-semibold text-gray-900">{businessName}</h1>
          <div className="text-xs text-gray-500 hidden sm:block">İş Yeri Kodu: 8547293</div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 lg:gap-6">
        {/* Search - Hidden on mobile */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ara..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-[#d4a017]/20 focus:border-[#d4a017]"
          />
        </div>

        {/* Terminal Status */}
        <div className="flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 bg-green-50 rounded-lg">
          <Wifi className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-green-600" />
          <span className="text-xs font-medium text-green-700 hidden sm:inline">
            {terminalStatus === 'online' ? 'Terminal Bağlı' : 'Terminal Bağlı Değil'}
          </span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg">
          <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu - Simplified on mobile */}
        <button className="flex items-center gap-2 hover:bg-gray-100 px-2 lg:px-3 py-2 rounded-lg">
          <div className="w-7 h-7 lg:w-8 lg:h-8 bg-[#d4a017] rounded-full flex items-center justify-center text-white text-xs lg:text-sm font-medium">
            AY
          </div>
          <div className="text-left hidden lg:block">
            <div className="text-sm font-medium text-gray-900">{userName}</div>
            <div className="text-xs text-gray-500">Garson</div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 hidden lg:block" />
        </button>
      </div>
    </div>
  );
}