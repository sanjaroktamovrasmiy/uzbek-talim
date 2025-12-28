import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/api';

interface LoginForm {
  phone: string;
  password: string;
  rememberMe: boolean;
}

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'password' | 'telegram'>('password');
  const [telegramPhone, setTelegramPhone] = useState('');
  const [telegramCode, setTelegramCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [telegramRememberMe, setTelegramRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      rememberMe: false,
    },
  });

  // Check if redirected from register page or load remembered phone
  useEffect(() => {
    const state = location.state as { phone?: string; message?: string } | null;
    if (state?.phone) {
      setValue('phone', state.phone);
      setTelegramPhone(state.phone);
    } else {
      // Avtomatik login - eslab qolgan telefon raqamni yuklash
      const rememberedPhone = localStorage.getItem('remembered_phone');
      if (rememberedPhone) {
        setValue('phone', rememberedPhone);
        setTelegramPhone(rememberedPhone);
        setValue('rememberMe', true);
        setTelegramRememberMe(true);
      }
    }
    if (state?.message) {
      toast.error(state.message, { duration: 6000 });
    }
  }, [location.state, setValue]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data.phone, data.password);
      const user = await authApi.getMe(response.access_token);
      // Remember me - token va user localStorage'da saqlanadi (logout qilinmaguncha)
      login(user, response.access_token, response.refresh_token);
      
      // Remember me belgilangan bo'lsa, telefon raqamni saqlash
      if (data.rememberMe) {
        localStorage.setItem('remembered_phone', data.phone);
      } else {
        localStorage.removeItem('remembered_phone');
      }
      
      toast.success('Muvaffaqiyatli kirdingiz!');
      // Oldingi sahifaga yoki dashboard'ga yo'naltirish
      const from = (location.state as { from?: string } | null)?.from || '/dashboard';
      navigate(from, { replace: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || "Xatolik yuz berdi";
      
      // More detailed error messages
      if (errorMessage.includes("Invalid phone") || errorMessage.includes("not found")) {
        toast.error("Bu telefon raqam orqali ro'yxatdan o'tgan foydalanuvchi topilmadi. Iltimos, ro'yxatdan o'ting.", {
          duration: 5000,
        });
      } else if (errorMessage.includes("Password not set")) {
        toast.error("Parol o'rnatilmagan. Iltimos, parolni tiklash funksiyasidan foydalaning.", {
          duration: 5000,
        });
      } else if (errorMessage.includes("tasdiqlanmagan") || errorMessage.includes("not verified") || errorMessage.includes("Telefon raqami")) {
        toast.error(
          "❌ Telefon raqami tasdiqlanmagan:\n\n" +
          "Sizning telefon raqamingiz hali tasdiqlanmagan. " +
          "Iltimos, ro'yxatdan o'tish jarayonida tasdiqlash kodini kiriting.\n\n" +
          "Agar siz yangi hisob ochmoqchi bo'lsangiz, ro'yxatdan o'tish sahifasiga qayting.",
          {
            duration: 8000,
          }
        );
      } else if (errorMessage.includes("Invalid") || errorMessage.includes("password")) {
        toast.error("Noto'g'ri telefon raqam yoki parol. Iltimos, qaytadan urinib ko'ring.", {
          duration: 5000,
        });
      } else if (errorMessage.includes("deactivated")) {
        toast.error("Hisobingiz o'chirilgan. Iltimos, admin bilan bog'laning.", {
          duration: 5000,
        });
      } else {
        toast.error(errorMessage, {
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTelegramCode = async () => {
    if (!telegramPhone.match(/^\+998[0-9]{9}$/)) {
      toast.error('Noto\'g\'ri telefon raqam formati');
      return;
    }

    setSendingCode(true);
    try {
      await authApi.sendTelegramCodeLogin(telegramPhone);
      setCodeSent(true);
      toast.success('Kod Telegram orqali yuborildi!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Kod yuborishda xatolik");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyTelegramCode = async () => {
    if (!telegramCode || telegramCode.length < 4) {
      toast.error('Kodni kiriting');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.verifyTelegramCode(telegramPhone, telegramCode, true);
      if (response.access_token) {
        const user = await authApi.getMe(response.access_token);
        // Remember me - logout qilinmaguncha saqlanadi
        login(user, response.access_token, response.refresh_token);
        
        // Telegram orqali kirishda ham telefon raqamni eslab qolish (agar remember me belgilangan bo'lsa)
        if (telegramRememberMe) {
          localStorage.setItem('remembered_phone', telegramPhone);
        } else {
          localStorage.removeItem('remembered_phone');
        }
        
        toast.success('Muvaffaqiyatli kirdingiz!');
        // Oldingi sahifaga yoki dashboard'ga yo'naltirish
        const from = (location.state as { from?: string } | null)?.from || '/dashboard';
        navigate(from, { replace: true });
      } else {
        toast.error("Token olinmadi. Qaytadan urinib ko'ring.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Kod noto'g'ri");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-2">Kirish</h1>
      <p className="text-slate-400 text-center mb-8">
        Hisobingizga kiring
      </p>

      {/* Auth Method Selector */}
      <div className="flex gap-2 mb-6 bg-slate-800 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => {
            setAuthMethod('password');
            setCodeSent(false);
            setTelegramCode('');
          }}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            authMethod === 'password'
              ? 'bg-primary-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Parol bilan
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMethod('telegram');
            setCodeSent(false);
            setTelegramCode('');
          }}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            authMethod === 'telegram'
              ? 'bg-primary-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Telegram
        </button>
      </div>

      {authMethod === 'password' ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Telefon raqam
          </label>
          <input
            type="tel"
            placeholder="+998901234567"
            className="input"
            {...register('phone', {
              required: 'Telefon raqam kiriting',
              pattern: {
                value: /^\+998[0-9]{9}$/,
                message: 'Noto\'g\'ri format (+998XXXXXXXXX)',
              },
            })}
          />
          {errors.phone && (
            <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Parol
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="input pr-10"
              {...register('password', {
                required: 'Parol kiriting',
                minLength: {
                  value: 6,
                  message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            {...register('rememberMe')}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-primary-500 focus:ring-primary-500 focus:ring-2"
          />
          <label htmlFor="rememberMe" className="ml-2 text-sm text-slate-300 cursor-pointer">
            Meni eslab qol
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Kirish'
          )}
        </button>
      </form>

      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Telefon raqam
            </label>
            <input
              type="tel"
              placeholder="+998901234567"
              value={telegramPhone}
              onChange={(e) => setTelegramPhone(e.target.value)}
              className="input"
              disabled={codeSent}
            />
          </div>

          {!codeSent ? (
            <button
              type="button"
              onClick={handleSendTelegramCode}
              disabled={sendingCode}
              className="btn-primary w-full"
            >
              {sendingCode ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                <>
                  <MessageSquare className="w-5 h-5 inline mr-2" />
                  Telegram orqali kod olish
                </>
              )}
            </button>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tasdiqlash kodi
                </label>
                <input
                  type="text"
                  placeholder="Kodni kiriting"
                  value={telegramCode}
                  onChange={(e) => setTelegramCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input text-center text-2xl tracking-widest"
                  maxLength={6}
                />
                <p className="text-slate-400 text-sm mt-2 text-center">
                  Kod Telegram orqali yuborildi
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="telegramRememberMe"
                  checked={telegramRememberMe}
                  onChange={(e) => setTelegramRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-primary-500 focus:ring-primary-500 focus:ring-2"
                />
                <label htmlFor="telegramRememberMe" className="ml-2 text-sm text-slate-300 cursor-pointer">
                  Meni eslab qol
                </label>
              </div>

              <button
                type="button"
                onClick={handleVerifyTelegramCode}
                disabled={isLoading || !telegramCode}
                className="btn-primary w-full"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Tasdiqlash'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCodeSent(false);
                  setTelegramCode('');
                }}
                className="text-slate-400 hover:text-white text-sm w-full"
              >
                Kodni qayta yuborish
              </button>
            </>
          )}
        </div>
      )}

      <p className="text-center text-slate-400 mt-6">
        Hisobingiz yo'qmi?{' '}
        <Link to="/register" className="text-primary-400 hover:underline">
          Ro'yxatdan o'ting
        </Link>
      </p>
    </div>
  );
}

