interface StatusBadgeProps {
  status: 'Başarılı' | 'Başarısız' | 'İptal' | 'Beklemede';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = {
    'Başarılı': { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    'Başarısız': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
    'İptal': { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
    'Beklemede': { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  };

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';
  const { bg, text, dot } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 ${bg} ${text} ${sizeClasses} rounded-full font-medium`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {status}
    </span>
  );
}
