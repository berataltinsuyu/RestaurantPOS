import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function MobileLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username && password) {
      navigate('/mobile/tables');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 bg-[#d4a017] rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>
        </div>
        <h1 className="text-center text-xl font-bold text-gray-900 mt-3">VakıfBank POS</h1>
        <p className="text-center text-sm text-gray-600 mt-1">Garson Mobil Uygulaması</p>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Giriş Yap</h2>
              <p className="text-sm text-gray-600">Devam etmek için giriş yapın</p>
            </div>

            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Kullanıcı Adı
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 border-2 border-gray-200 rounded-lg focus:border-[#d4a017] focus:outline-none text-base"
                    placeholder="Kullanıcı adınızı girin"
                    autoCapitalize="none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 pl-11 pr-12 border-2 border-gray-200 rounded-lg focus:border-[#d4a017] focus:outline-none text-base"
                    placeholder="Şifrenizi girin"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                onClick={handleLogin}
                className="w-full h-12 bg-[#d4a017] hover:bg-[#b8860b] text-white font-semibold rounded-lg text-base mt-6"
              >
                Giriş Yap
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-xs text-gray-500">
            VakıfBank Restoran POS v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
