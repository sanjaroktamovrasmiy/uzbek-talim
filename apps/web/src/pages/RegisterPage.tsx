import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

interface RegisterForm {
  phone: string;
  first_name: string;
  last_name: string;
  password: string;
  confirmPassword: string;
}

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registeredPhone, setRegisteredPhone] = useState('');
  const [registeredPassword, setRegisteredPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'telegram' | 'phone'>('phone');
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await authApi.register({
        phone: data.phone,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
      });
      setRegisteredPhone(data.phone);
      setRegisteredPassword(data.password);
      setVerificationCode('');
      setCodeSent(true);

      // Try to send code via Telegram if user has telegram_id
      try {
        await authApi.sendTelegramCode(data.phone);
        setVerificationMethod('telegram');
        toast.success("Ro'yxatdan o'tdingiz! Tasdiqlash kodi Telegram orqali yuborildi. Iltimos, kodni kiriting.");
      } catch (e: any) {
        // If Telegram code fails, fall back to phone verification
        setVerificationMethod('phone');
        const errorMsg = e.response?.data?.detail || e.message || "";
        if (errorMsg.includes("Telegram ID not found") || errorMsg.includes("not found")) {
          toast.success(
            "Ro'yxatdan o'tdingiz! Telegram orqali kod yuborish mumkin emas. " +
            "Iltimos, telefon raqamni tasdiqlash uchun kodni qo'lda kiriting yoki Telegram botga ulaning.",
            { duration: 6000 }
          );
        } else {
          toast.success("Ro'yxatdan o'tdingiz! Telefon raqamni tasdiqlash uchun kodni kiriting.", {
            duration: 5000,
          });
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || "Xatolik yuz berdi";
      
      // Check if phone already exists - redirect to login
      if (errorMessage.includes("ro'yxatdan o'tgan") || errorMessage.includes("mavjud")) {
        toast.error(errorMessage, {
          duration: 6000,
        });
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              phone: data.phone,
              message: "Bu raqam orqali allaqachon ro'yxatdan o'tgansiz. Iltimos, kirish sahifasiga o'ting." 
            } 
          });
        }, 2000);
      } else {
        toast.error(errorMessage, {
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      toast.error('Kodni kiriting');
      return;
    }

    setIsLoading(true);
    try {
      if (verificationMethod === 'telegram') {
        const response = await authApi.verifyTelegramCode(
          registeredPhone,
          verificationCode,
          true
        );
        if (!response.access_token) {
          throw new Error("Token olinmadi. Qaytadan urinib ko'ring.");
        }
        const user = await authApi.getMe(response.access_token);
        login(user, response.access_token);
        toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz va kirdingiz!");
        navigate('/dashboard');
        return;
      }

      // Phone verification (haqiqiy rejim - kod tekshiriladi)
      await authApi.verifyPhone(registeredPhone, verificationCode);

      // Auto-login after verification (Remember me - logout qilinmaguncha saqlanadi)
      const tokenResponse = await authApi.login(registeredPhone, registeredPassword);
      const user = await authApi.getMe(tokenResponse.access_token);
      login(user, tokenResponse.access_token, tokenResponse.refresh_token);
      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz va kirdingiz!");
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || "Kod noto'g'ri";
      
      if (errorMessage.includes("Noto'g'ri") || errorMessage.includes("Invalid")) {
        toast.error("Noto'g'ri tasdiqlash kodi. Iltimos, qaytadan urinib ko'ring yoki kodni qayta so'rang.", {
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

  const handleResendCode = async () => {
    if (verificationMethod !== 'telegram') {
      toast.error("Telegram orqali kod yuborish uchun avval bot orqali akkauntni bog'lang.");
      return;
    }

    setSendingCode(true);
    try {
      await authApi.sendTelegramCode(registeredPhone);
      toast.success('Kod qayta yuborildi!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Kod yuborishda xatolik");
    } finally {
      setSendingCode(false);
    }
  };

  if (codeSent) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-center mb-2">Telefon raqamni tasdiqlash</h1>
        <p className="text-slate-400 text-center mb-8">
          {verificationMethod === 'telegram'
            ? `Kod Telegram akkauntingizga yuborildi (telefon: ${registeredPhone})`
            : `Test rejimi: telefonni tasdiqlash uchun istalgan kod kiriting (${registeredPhone})`}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tasdiqlash kodi
            </label>
            <input
              type="text"
              placeholder="Kodni kiriting"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="input text-center text-2xl tracking-widest"
              maxLength={6}
            />
            <p className="text-slate-400 text-sm mt-2 text-center">
              {verificationMethod === 'telegram'
                ? 'Kod Telegram orqali yuborildi'
                : "SMS hozircha yo'q. Test rejimida istalgan 4-6 raqam kiriting."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleVerifyCode}
            disabled={isLoading || !verificationCode}
            className="btn-primary w-full"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Tasdiqlash'
            )}
          </button>

          {verificationMethod === 'telegram' && (
            <button
              type="button"
              onClick={handleResendCode}
              disabled={sendingCode}
              className="text-slate-400 hover:text-white text-sm w-full"
            >
              {sendingCode ? 'Yuborilmoqda...' : 'Kodni qayta yuborish'}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setCodeSent(false);
              setRegisteredPhone('');
              setRegisteredPassword('');
              setVerificationCode('');
              setVerificationMethod('phone');
            }}
            className="text-slate-400 hover:text-white text-sm w-full"
          >
            Orqaga
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-2">Ro'yxatdan o'tish</h1>
      <p className="text-slate-400 text-center mb-8">
        Yangi hisob yarating
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ism
            </label>
            <input
              type="text"
              placeholder="Ism"
              className="input"
              {...register('first_name', {
                required: 'Ismingizni kiriting',
                minLength: { value: 2, message: 'Kamida 2 ta harf' },
              })}
            />
            {errors.first_name && (
              <p className="text-red-400 text-sm mt-1">{errors.first_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Familiya
            </label>
            <input
              type="text"
              placeholder="Familiya"
              className="input"
              {...register('last_name', {
                required: 'Familiyangizni kiriting',
                minLength: { value: 2, message: 'Kamida 2 ta harf' },
              })}
            />
            {errors.last_name && (
              <p className="text-red-400 text-sm mt-1">{errors.last_name.message}</p>
            )}
          </div>
        </div>

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
              placeholder="Kamida 6 ta belgi"
              className="input pr-10"
              {...register('password', {
                required: 'Parol kiriting',
                minLength: {
                  value: 6,
                  message: 'Kamida 6 ta belgi',
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

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Parolni tasdiqlang
          </label>
          <input
            type="password"
            placeholder="Parolni qayta kiriting"
            className="input"
            {...register('confirmPassword', {
              required: 'Parolni tasdiqlang',
              validate: (value) =>
                value === password || 'Parollar mos kelmaydi',
            })}
          />
          {errors.confirmPassword && (
            <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Ro'yxatdan o'tish"
          )}
        </button>
      </form>

      <p className="text-center text-slate-400 mt-6">
        Hisobingiz bormi?{' '}
        <Link to="/login" className="text-primary-400 hover:underline">
          Kirish
        </Link>
      </p>
    </div>
  );
}

