import { FileX, Inbox, ShoppingCart, Users, Search } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-data' | 'no-results' | 'no-transactions' | 'no-tables' | 'no-users' | 'error';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ type, title, description, action }: EmptyStateProps) {
  const iconMap = {
    'no-data': FileX,
    'no-results': Search,
    'no-transactions': ShoppingCart,
    'no-tables': Inbox,
    'no-users': Users,
    'error': FileX,
  };

  const Icon = iconMap[type];

  return (
    <div className="flex flex-col items-center justify-center py-12 lg:py-16 px-4">
      <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 lg:mb-6">
        <Icon className="w-10 h-10 lg:w-12 lg:h-12 text-gray-400" />
      </div>
      <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 text-center">{title}</h3>
      <p className="text-sm lg:text-base text-gray-600 mb-6 text-center max-w-md">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-[#d4a017] hover:bg-[#b8860b] text-white font-semibold rounded-lg transition-colors text-sm lg:text-base"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
