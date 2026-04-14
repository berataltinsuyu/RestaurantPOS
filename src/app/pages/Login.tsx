import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { env } from '../config/env';
import { getErrorMessage } from '../lib/error-utils';
import { localizeText } from '../lib/mappers';

export default function Login() {
  const location = useLocation();
  const { login, isAuthenticated, isBootstrapped } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    business: env.defaultBranchCode,
  });

  const redirectTo =
    typeof location.state?.from === 'string' && location.state.from
      ? location.state.from
      : '/dashboard';

  if (isBootstrapped && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login({
        branchCode: formData.business.trim(),
        userName: formData.username.trim(),
        password: formData.password,
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Giriş yapılamadı.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#d4a017] rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-4xl font-bold">V</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">VakıfBank</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-1">POS Sistemi</h2>
          <p className="text-sm text-gray-500">Restoran & Cafe Ödeme Yönetimi</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Hoş Geldiniz</h3>
            <p className="text-sm text-gray-600">Devam etmek için giriş yapın</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Business Selection */}
            <div>
              <Label htmlFor="business" className="text-sm font-medium text-gray-700 mb-2 block">
                İş Yeri Seçimi
              </Label>
              <Select
                value={formData.business}
                onValueChange={(value) => setFormData({ ...formData, business: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="İş yeri seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={env.defaultBranchCode}>
                    {localizeText('Gunes Cafe & Restaurant')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Username */}
            <div>
              <Label htmlFor="username" className="text-sm font-medium text-gray-700 mb-2 block">
                Kullanıcı Adı
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Kullanıcı adınızı girin"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="h-12"
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                Şifre
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifrenizi girin"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-[#d4a017] border-gray-300 rounded focus:ring-[#d4a017]" />
                <span className="text-gray-600">Beni Hatırla</span>
              </label>
              <a href="#" className="text-[#d4a017] hover:underline font-medium">
                Şifremi Unuttum
              </a>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !formData.username.trim() || !formData.password || !formData.business}
              className="w-full h-12 bg-[#d4a017] hover:bg-[#c49316] text-white font-semibold text-base rounded-lg"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Giriş Yapılıyor
                </span>
              ) : (
                'Giriş Yap'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              Güvenli Bağlantı • 256-bit SSL Şifreleme
            </p>
          </div>
        </div>

        {/* Support Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Destek almak için{' '}
            <a href="#" className="text-[#d4a017] hover:underline font-medium">
              0850 222 0 724
            </a>
          </p>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 text-xs text-gray-500">
          © 2026 VakıfBank A.Ş. Tüm hakları saklıdır.
        </div>
      </div>
    </div>
  );
}
