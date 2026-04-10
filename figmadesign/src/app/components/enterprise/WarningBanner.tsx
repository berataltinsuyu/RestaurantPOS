import { AlertTriangle, Info, XCircle, X } from 'lucide-react';

interface WarningBannerProps {
  type: 'warning' | 'info' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function WarningBanner({
  type,
  title,
  message,
  action,
  dismissible = false,
  onDismiss
}: WarningBannerProps) {
  const config = {
    warning: {
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-500',
      textColor: 'text-amber-900',
      descColor: 'text-amber-800',
      iconColor: 'text-amber-600',
      buttonColor: 'bg-amber-600 hover:bg-amber-700',
      icon: AlertTriangle
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-900',
      descColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      icon: Info
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-900',
      descColor: 'text-red-800',
      iconColor: 'text-red-600',
      buttonColor: 'bg-red-600 hover:bg-red-700',
      icon: XCircle
    }
  };

  const style = config[type];
  const Icon = style.icon;

  return (
    <div className={`${style.bgColor} border-l-4 ${style.borderColor} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${style.textColor} mb-1`}>{title}</h3>
          <p className={`text-xs ${style.descColor}`}>{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-3 px-4 py-2 ${style.buttonColor} text-white text-xs font-semibold rounded-lg transition-colors`}
            >
              {action.label}
            </button>
          )}
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={`${style.iconColor} hover:opacity-70 transition-opacity`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
