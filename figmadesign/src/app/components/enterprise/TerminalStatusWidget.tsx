import { Terminal, Wifi, WifiOff, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TerminalStatusWidgetProps {
  terminalId: string;
  terminalName: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  lastSeen?: string;
  transactionsToday?: number;
  onClick?: () => void;
}

export function TerminalStatusWidget({
  terminalId,
  terminalName,
  status,
  lastSeen,
  transactionsToday = 0,
  onClick
}: TerminalStatusWidgetProps) {
  const statusConfig = {
    online: {
      label: 'Çevrimiçi',
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle2,
      dotColor: 'bg-green-500'
    },
    offline: {
      label: 'Çevrimdışı',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: WifiOff,
      dotColor: 'bg-gray-500'
    },
    busy: {
      label: 'Meşgul',
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: Wifi,
      dotColor: 'bg-amber-500'
    },
    error: {
      label: 'Hata',
      color: 'bg-red-100 text-red-700 border-red-200',
      icon: AlertCircle,
      dotColor: 'bg-red-500'
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 transition-all ${
        onClick ? 'cursor-pointer hover:border-[#d4a017] hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Terminal className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">{terminalName}</div>
            <div className="text-xs text-gray-600 font-mono">{terminalId}</div>
          </div>
        </div>
        <div className={`relative w-3 h-3 rounded-full ${config.dotColor}`}>
          {status === 'online' && (
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
          )}
        </div>
      </div>

      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${config.color}`}>
        <StatusIcon className="w-3.5 h-3.5" />
        {config.label}
      </div>

      {lastSeen && status === 'offline' && (
        <div className="text-xs text-gray-600 mt-2">
          Son görülme: {lastSeen}
        </div>
      )}

      {status === 'online' && transactionsToday > 0 && (
        <div className="text-xs text-gray-600 mt-2">
          Bugün: {transactionsToday} işlem
        </div>
      )}
    </div>
  );
}
