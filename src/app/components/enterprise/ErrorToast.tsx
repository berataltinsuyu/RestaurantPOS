import { useEffect, useState } from 'react';
import { XCircle, X, AlertTriangle } from 'lucide-react';

interface ErrorToastProps {
  message: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorToast({ 
  message, 
  description, 
  duration = 7000, 
  onClose,
  actionLabel,
  onAction
}: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const handleAction = () => {
    onAction?.();
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
      }`}
    >
      <div className="bg-white rounded-xl border-2 border-red-200 shadow-lg p-4 min-w-[320px] max-w-md">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm mb-1">{message}</div>
            {description && (
              <div className="text-xs text-gray-600 mb-2">{description}</div>
            )}
            {actionLabel && onAction && (
              <button
                onClick={handleAction}
                className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                {actionLabel} →
              </button>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1 bg-red-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 rounded-full transition-all"
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
