import { CheckCircle2, XCircle, Clock, Circle } from 'lucide-react';

interface TimelineStep {
  label: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'pending' | 'inactive';
  detail?: string;
}

interface AuditTimelineProps {
  steps: TimelineStep[];
  title?: string;
}

export function AuditTimeline({ steps, title = 'İşlem Zaman Çizelgesi' }: AuditTimelineProps) {
  const getStatusConfig = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          dotColor: 'bg-green-500',
          lineColor: 'bg-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600'
        };
      case 'failed':
        return {
          icon: XCircle,
          dotColor: 'bg-red-500',
          lineColor: 'bg-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600'
        };
      case 'pending':
        return {
          icon: Clock,
          dotColor: 'bg-amber-500',
          lineColor: 'bg-amber-200',
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600'
        };
      case 'inactive':
        return {
          icon: Circle,
          dotColor: 'bg-gray-300',
          lineColor: 'bg-gray-200',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-400'
        };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-4 lg:p-6">
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            const config = getStatusConfig(step.status);
            const Icon = config.icon;

            return (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.iconBg}`}>
                    <Icon className={`w-4 h-4 ${config.iconColor}`} />
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 h-full min-h-[32px] ${config.lineColor} mt-1`} />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="text-sm font-semibold text-gray-900">{step.label}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{step.timestamp}</div>
                  {step.detail && (
                    <div className="text-xs text-gray-700 mt-1 bg-gray-50 rounded px-2 py-1 inline-block">
                      {step.detail}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
