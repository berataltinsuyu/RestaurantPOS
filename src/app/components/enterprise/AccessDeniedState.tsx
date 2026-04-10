import { ArrowLeft, Home, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button';

interface AccessDeniedStateProps {
  title?: string;
  description?: string;
  onBack?: () => void;
  onHome?: () => void;
}

export function AccessDeniedState({
  title = 'Bu alana erişim yetkiniz bulunmuyor.',
  description = 'Lütfen yetkili bir kullanıcı ile giriş yapın.',
  onBack,
  onHome,
}: AccessDeniedStateProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col items-center justify-center px-6 py-14 text-center lg:px-10 lg:py-20">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
          <ShieldAlert className="h-10 w-10 text-[#d4a017]" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900 lg:text-2xl">{title}</h2>
        <p className="max-w-md text-sm text-gray-600 lg:text-base">{description}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {onHome ? (
            <Button
              onClick={onHome}
              className="bg-[#d4a017] text-white hover:bg-[#c49316]"
            >
              <Home className="mr-2 h-4 w-4" />
              Ana Sayfaya Dön
            </Button>
          ) : null}
          {onBack ? (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri Git
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
