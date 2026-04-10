import { CheckCircle2, Clock, Loader2 } from 'lucide-react';

interface TransactionProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  status: 'processing' | 'completed' | 'error';
  steps: string[];
  showPercentage?: boolean;
}

export function TransactionProgressIndicator({
  currentStep,
  totalSteps,
  status,
  steps,
  showPercentage = true
}: TransactionProgressIndicatorProps) {
  const percentage = Math.min((currentStep / totalSteps) * 100, 100);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">İşlem İlerlemesi</h3>
          <p className="text-xs text-gray-600 mt-1">
            Adım {currentStep} / {totalSteps}
          </p>
        </div>
        {showPercentage && (
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(percentage)}%
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out rounded-full ${
              status === 'error'
                ? 'bg-red-500'
                : status === 'completed'
                ? 'bg-green-500'
                : 'bg-gradient-to-r from-blue-500 to-[#d4a017]'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 transition-all ${
                isPending ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent && status === 'processing' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="text-xs font-semibold">{stepNumber}</span>
                )}
              </div>
              <div className="flex-1">
                <div
                  className={`text-sm ${
                    isCompleted || isCurrent
                      ? 'font-semibold text-gray-900'
                      : 'text-gray-600'
                  }`}
                >
                  {step}
                </div>
              </div>
              {isCurrent && status === 'processing' && (
                <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Status Message */}
      {status === 'completed' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-semibold">İşlem başarıyla tamamlandı</span>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-red-800">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-semibold">İşlem sırasında hata oluştu</span>
          </div>
        </div>
      )}
    </div>
  );
}
