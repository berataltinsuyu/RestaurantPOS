import { WifiOff, Signal } from 'lucide-react';

interface OfflineStatusChipProps {
  status: 'online' | 'offline';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function OfflineStatusChip({ 
  status, 
  size = 'md',
  showLabel = true 
}: OfflineStatusChipProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-2.5 py-1.5 text-xs gap-1.5',
    lg: 'px-3 py-2 text-sm gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  if (status === 'online') {
    return showLabel ? (
      <div className={`inline-flex items-center ${sizeClasses[size]} bg-green-100 text-green-700 border border-green-200 rounded-lg font-semibold`}>
        <Signal className={iconSizes[size]} />
        Çevrimiçi
      </div>
    ) : (
      <div className="relative">
        <div className={`${iconSizes[size]} bg-green-500 rounded-full`}></div>
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
      </div>
    );
  }

  return showLabel ? (
    <div className={`inline-flex items-center ${sizeClasses[size]} bg-red-100 text-red-700 border border-red-200 rounded-lg font-semibold`}>
      <WifiOff className={iconSizes[size]} />
      Çevrimdışı
    </div>
  ) : (
    <div className={`${iconSizes[size]} bg-red-500 rounded-full`}></div>
  );
}
