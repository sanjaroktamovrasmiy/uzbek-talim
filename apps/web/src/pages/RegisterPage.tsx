import { useState, useEffect } from 'react';
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
  role: 'student' | 'teacher';
}

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Load state from localStorage on mount to persist across refreshes
  const [registeredPhone, setRegisteredPhone] = useState(() => {
    return localStorage.getItem('register_phone') || '';
  });
  const [registeredPassword, setRegisteredPassword] = useState(() => {
    return localStorage.getItem('register_password') || '';
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(() => {
    return localStorage.getItem('register_code_sent') === 'true';
  });
  const [sendingCode, setSendingCode] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // Countdown timer in seconds
  const [verificationMethod, setVerificationMethod] = useState<'telegram' | 'phone'>(() => {
    return (localStorage.getItem('register_verification_method') as 'telegram' | 'phone') || 'phone';
  });
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // Load form data from localStorage on mount
  const loadFormData = (): Partial<RegisterForm> => {
    try {
      const saved = localStorage.getItem('register_form_data');
      if (saved) {
        const data = JSON.parse(saved);
        // Don't load password for security
        return {
          phone: data.phone || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          role: data.role || 'student',
        };
      }
    } catch (e) {
      console.error('Error loading form data:', e);
    }
    return {
      role: 'student',
    };
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: loadFormData(),
    mode: 'onChange',
  });

  const password = watch('password');
  const selectedRole = watch('role');
  const formData = watch();

  // Save form data to localStorage whenever it changes (debounced)
  useEffect(() => {
    // Don't save password for security reasons
    const dataToSave = {
      phone: formData.phone || '',
      first_name: formData.first_name || '',
      last_name: formData.last_name || '',
      role: formData.role || 'student',
    };

    // Only save if at least one field has value
    if (dataToSave.phone || dataToSave.first_name || dataToSave.last_name) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('register_form_data', JSON.stringify(dataToSave));
      }, 500); // Debounce: save after 500ms of no changes

      return () => clearTimeout(timeoutId);
    }
  }, [formData.phone, formData.first_name, formData.last_name, formData.role]);

  // Load form data on mount
  useEffect(() => {
    const saved = loadFormData();
    if (saved.phone) setValue('phone', saved.phone);
    if (saved.first_name) setValue('first_name', saved.first_name);
    if (saved.last_name) setValue('last_name', saved.last_name);
    if (saved.role) setValue('role', saved.role);
  }, [setValue]);

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await authApi.register({
        phone: data.phone,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
        role: data.role,
      });
      
      // Save to localStorage to persist across refreshes
      localStorage.setItem('register_phone', data.phone);
      localStorage.setItem('register_password', data.password);
      localStorage.setItem('register_code_sent', 'true');
      
      // Clear form data from localStorage after successful registration
      localStorage.removeItem('register_form_data');
      
      // Update state - this will trigger re-render to show verification page
      setRegisteredPhone(data.phone);
      setRegisteredPassword(data.password);
      setVerificationCode('');
      setCodeSent(true);
      setIsLoading(false); // Set loading to false after state is updated

      // Try to send code via Telegram if user has telegram_id
      try {
        await authApi.sendTelegramCode(data.phone);
        localStorage.setItem('register_verification_method', 'telegram');
        setVerificationMethod('telegram');
        toast.success("Ro'yxatdan o'tdingiz! Tasdiqlash kodi Telegram orqali yuborildi. Iltimos, kodni kiriting.");
      } catch (e: any) {
        // If Telegram code fails, fall back to phone verification
        localStorage.setItem('register_verification_method', 'phone');
        setVerificationMethod('phone');
        // Support both error formats: {detail: ...} and {error: {message: ...}}
        const errorMsg = 
          e.response?.data?.detail || 
          e.response?.data?.error?.message || 
          e.message || 
          "";
        if (errorMsg.includes("Telegram ID not found") || errorMsg.includes("not found") || errorMsg.includes("Telegram ID topilmadi")) {
          toast.success(
            "Ro'yxatdan o'tdingiz! Telegram orqali kod yuborish mumkin emas. " +
            "Telegram orqali kod olish uchun avval Telegram botga /start buyrug'ini yuborib bot bilan bog'lanishingiz kerak. " +
            "Hozir telefon raqamni tasdiqlash uchun kodni qo'lda kiriting.",
            { duration: 8000 }
          );
        } else {
          toast.success("Ro'yxatdan o'tdingiz! Telefon raqamni tasdiqlash uchun kodni kiriting.", {
            duration: 5000,
          });
        }
      }
    } catch (error: any) {
      // Support both error formats: {detail: ...} and {error: {message: ...}}
      const errorMessage = 
        error.response?.data?.detail || 
        error.response?.data?.error?.message || 
        error.message || 
        "Xatolik yuz berdi";
      
      // Check for specific validation errors
      const errorData = error.response?.data;
      let specificError = '';
      
      // Check for field-specific errors from Pydantic validation
      if (errorData?.error?.details) {
        const details = errorData.error.details;
        if (details.errors && Array.isArray(details.errors)) {
          const fieldErrors = details.errors.map((err: any) => {
            const field = err.loc?.[1] || err.field || 'Maydon';
            const msg = err.msg || err.message || 'Noto\'g\'ri';
            return `${field}: ${msg}`;
          }).join(', ');
          specificError = fieldErrors;
        }
      }
      
      // Check for phone already exists
      if (errorMessage.includes("ro'yxatdan o'tgan") || errorMessage.includes("mavjud") || errorMessage.includes("already registered")) {
        toast.error(
          "❌ Telefon raqam muammosi:\n\n" +
          "Bu telefon raqam orqali allaqachon ro'yxatdan o'tgan foydalanuvchi mavjud.\n\n" +
          "Yechim:\n" +
          "• Agar bu sizning raqamingiz bo'lsa → Kirish sahifasiga o'ting\n" +
          "• Agar boshqa hisob ochmoqchisiz → Avval eski hisobni o'chiring (Profil → Hisobni o'chirish)",
          {
            duration: 10000,
          }
        );
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              phone: data.phone,
              message: "Bu raqam orqali allaqachon ro'yxatdan o'tgansiz. Iltimos, kirish sahifasiga o'ting yoki eski hisobni o'chiring." 
            } 
          });
        }, 2000);
      }
      // Check for phone format error
      else if (errorMessage.includes("telefon raqam formati") || errorMessage.includes("phone number format") || errorMessage.includes("Noto'g'ri format")) {
        toast.error(
          "❌ Telefon raqam formati noto'g'ri:\n\n" +
          "To'g'ri format: +998901234567\n\n" +
          "Iltimos, telefon raqamingizni quyidagi formatda kiriting:\n" +
          "• +998 bilan boshlanishi kerak\n" +
          "• Keyin 9 ta raqam\n" +
          "• Masalan: +998901234567",
          {
            duration: 8000,
          }
        );
      }
      // Check for password errors
      else if (errorMessage.includes("Parol") || errorMessage.includes("password") || errorMessage.includes("parol")) {
        if (errorMessage.includes("kamida 6")) {
          toast.error(
            "❌ Parol muammosi:\n\n" +
            "Parol kamida 6 ta belgidan iborat bo'lishi kerak.\n\n" +
            "Iltimos, uzunroq parol kiriting.",
            {
              duration: 6000,
            }
          );
        } else if (errorMessage.includes("oddiy") || errorMessage.includes("xavfsiz")) {
          toast.error(
            "❌ Parol xavfsizligi muammosi:\n\n" +
            "Bu parol juda oddiy va xavfsiz emas.\n\n" +
            "Yaxshi parol:\n" +
            "• Harflar va raqamlar aralashmasi\n" +
            "• Kamida 6 ta belgi\n" +
            "• Oddiy so'zlar emas (masalan: '123456', 'password')",
            {
              duration: 8000,
            }
          );
        } else if (errorMessage.includes("faqat raqam") || errorMessage.includes("all numbers")) {
          toast.error(
            "❌ Parol muammosi:\n\n" +
            "Parol faqat raqamlardan iborat bo'lmasligi kerak.\n\n" +
            "Iltimos, harflar va raqamlar aralashmasini ishlating.",
            {
              duration: 6000,
            }
          );
        } else if (errorMessage.includes("faqat harf") || errorMessage.includes("all letters")) {
          toast.error(
            "❌ Parol muammosi:\n\n" +
            "Parol faqat harflardan iborat bo'lmasligi kerak.\n\n" +
            "Iltimos, raqamlar ham qo'shing.",
            {
              duration: 6000,
            }
          );
        } else {
          toast.error(
            `❌ Parol muammosi:\n\n${errorMessage}`,
            {
              duration: 6000,
            }
          );
        }
      }
      // Check for name errors
      else if (errorMessage.includes("Ism") || errorMessage.includes("first_name") || errorMessage.includes("Familiya") || errorMessage.includes("last_name")) {
        if (errorMessage.includes("kamida 2")) {
          toast.error(
            "❌ Ism yoki Familiya muammosi:\n\n" +
            "Ism va Familiya kamida 2 ta harfdan iborat bo'lishi kerak.\n\n" +
            "Iltimos, to'liq ism va familiyangizni kiriting.",
            {
              duration: 6000,
            }
          );
        } else {
          toast.error(
            `❌ Ism yoki Familiya muammosi:\n\n${errorMessage}`,
            {
              duration: 6000,
            }
          );
        }
      }
      // Check for role errors
      else if (errorMessage.includes("Rol") || errorMessage.includes("role")) {
        toast.error(
          "❌ Rol tanlash muammosi:\n\n" +
          "Iltimos, o'zingizning rolini tanlang:\n" +
          "• O'quvchi - kurslarga yozilish uchun\n" +
          "• Ustoz - kurslar yaratish uchun",
          {
            duration: 6000,
          }
        );
      }
      // Check for network/server errors
      else if (error.response?.status === 0 || error.message?.includes("Network") || error.message?.includes("network")) {
        toast.error(
          "❌ Internet aloqasi muammosi:\n\n" +
          "Internet aloqasi yo'q yoki serverga ulanib bo'lmadi.\n\n" +
          "Iltimos:\n" +
          "• Internet aloqangizni tekshiring\n" +
          "• Bir necha soniyadan keyin qayta urinib ko'ring",
          {
            duration: 8000,
          }
        );
      }
      // Check for server errors (500, 502, 503, etc.)
      else if (error.response?.status >= 500) {
        toast.error(
          "❌ Server muammosi:\n\n" +
          "Serverda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.\n\n" +
          "Agar muammo davom etsa, admin bilan bog'laning.",
          {
            duration: 8000,
          }
        );
      }
      // Generic error with specific message if available
      else if (specificError) {
        toast.error(
          `❌ Ma'lumotlar noto'g'ri:\n\n${specificError}\n\nIltimos, ma'lumotlarni to'g'rilab kiriting.`,
          {
            duration: 8000,
          }
        );
      }
      // Default error message
      else {
        toast.error(
          `❌ Xatolik yuz berdi:\n\n${errorMessage}\n\nIltimos, ma'lumotlarni tekshirib qayta urinib ko'ring.`,
          {
            duration: 8000,
          }
        );
      }
      // Only set loading to false if there was an error
      setIsLoading(false);
    }
    // Note: If registration succeeds, setIsLoading(false) is called after setCodeSent(true)
    // This ensures the verification page is shown immediately
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
        
        // Clear registration state from localStorage after successful verification
        localStorage.removeItem('register_phone');
        localStorage.removeItem('register_password');
        localStorage.removeItem('register_code_sent');
        localStorage.removeItem('register_verification_method');
        localStorage.removeItem('register_form_data'); // Clear form cache
        
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
      
      // Clear registration state from localStorage after successful verification
      localStorage.removeItem('register_phone');
      localStorage.removeItem('register_password');
      localStorage.removeItem('register_code_sent');
      localStorage.removeItem('register_verification_method');
      localStorage.removeItem('register_form_data'); // Clear form cache
      
      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz va kirdingiz!");
      navigate('/dashboard');
    } catch (error: any) {
      // Support both error formats: {detail: ...} and {error: {message: ...}}
      const errorMessage = 
        error.response?.data?.detail || 
        error.response?.data?.error?.message || 
        error.message || 
        "Kod noto'g'ri";
      
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
      // Support both error formats: {detail: ...} and {error: {message: ...}}
      const errorMsg = 
        error.response?.data?.detail || 
        error.response?.data?.error?.message || 
        "Kod yuborishda xatolik";
      toast.error(errorMsg);
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
              // Clear ALL registration state - user cannot login without verification
              localStorage.removeItem('register_phone');
              localStorage.removeItem('register_password');
              localStorage.removeItem('register_code_sent');
              localStorage.removeItem('register_verification_method');
              localStorage.removeItem('register_form_data'); // Clear form data too to prevent reusing
              
              setCodeSent(false);
              setRegisteredPhone('');
              setRegisteredPassword('');
              setVerificationCode('');
              setVerificationMethod('phone');
              
              toast("Tasdiqlash jarayoni bekor qilindi. Ro'yxatdan o'tish ma'lumotlari tozalandi.", {
                duration: 5000,
                icon: 'ℹ️',
              });
            }}
            className="text-slate-400 hover:text-white text-sm w-full"
          >
            Orqaga (Jarayonni bekor qilish)
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
                required: 'Ism maydoni to\'ldirilishi shart',
                minLength: { 
                  value: 2, 
                  message: 'Ism kamida 2 ta harfdan iborat bo\'lishi kerak' 
                },
                maxLength: {
                  value: 100,
                  message: 'Ism 100 ta harfdan oshmasligi kerak'
                },
                pattern: {
                  value: /^[a-zA-Zа-яА-ЯёЁ\s'-]+$/,
                  message: 'Ism faqat harflardan iborat bo\'lishi kerak'
                }
              })}
            />
            {errors.first_name && (
              <p className="text-red-400 text-sm mt-1">❌ {errors.first_name.message}</p>
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
                required: 'Familiya maydoni to\'ldirilishi shart',
                minLength: { 
                  value: 2, 
                  message: 'Familiya kamida 2 ta harfdan iborat bo\'lishi kerak' 
                },
                maxLength: {
                  value: 100,
                  message: 'Familiya 100 ta harfdan oshmasligi kerak'
                },
                pattern: {
                  value: /^[a-zA-Zа-яА-ЯёЁ\s'-]+$/,
                  message: 'Familiya faqat harflardan iborat bo\'lishi kerak'
                }
              })}
            />
            {errors.last_name && (
              <p className="text-red-400 text-sm mt-1">❌ {errors.last_name.message}</p>
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
              required: 'Telefon raqam maydoni to\'ldirilishi shart',
              pattern: {
                value: /^\+998[0-9]{9}$/,
                message: 'Noto\'g\'ri format. To\'g\'ri format: +998901234567 (+998 + 9 ta raqam)',
              },
            })}
          />
          {errors.phone && (
            <p className="text-red-400 text-sm mt-1">
              ❌ {errors.phone.message}
              <br />
              <span className="text-xs text-slate-400">Masalan: +998901234567</span>
            </p>
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
                required: 'Parol maydoni to\'ldirilishi shart',
                minLength: {
                  value: 6,
                  message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
                },
                maxLength: {
                  value: 100,
                  message: 'Parol 100 ta belgidan oshmasligi kerak'
                },
                validate: (value) => {
                  if (value === '123456' || value === 'password' || value === 'qwerty') {
                    return 'Bu parol juda oddiy. Iltimos, kuchliroq parol tanlang';
                  }
                  if (/^\d+$/.test(value)) {
                    return 'Parol faqat raqamlardan iborat bo\'lmasligi kerak. Harflar ham qo\'shing';
                  }
                  if (/^[a-zA-Z]+$/.test(value)) {
                    return 'Parol faqat harflardan iborat bo\'lmasligi kerak. Raqamlar ham qo\'shing';
                  }
                  return true;
                }
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
            <p className="text-red-400 text-sm mt-1">❌ {errors.password.message}</p>
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
              required: 'Parolni tasdiqlash maydoni to\'ldirilishi shart',
              validate: (value) =>
                value === password || 'Parollar mos kelmaydi. Iltimos, bir xil parol kiriting',
            })}
          />
          {errors.confirmPassword && (
            <p className="text-red-400 text-sm mt-1">❌ {errors.confirmPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Men kimman? <span className="text-red-400">*</span>
          </label>
          {errors.role && (
            <p className="text-red-400 text-sm mb-2">{errors.role.message}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`
                relative flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all
                ${selectedRole === 'student'
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }
              `}
            >
              <input
                type="radio"
                value="student"
                {...register('role', {
                  required: 'Rolni tanlang',
                })}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-2xl mb-1">👨‍🎓</div>
                <div className={`font-medium ${selectedRole === 'student' ? 'text-primary-400' : 'text-slate-300'}`}>
                  O'quvchi
                </div>
                <div className="text-xs text-slate-400 mt-1">Kurslarga yozilish</div>
              </div>
            </label>
            <label
              className={`
                relative flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all
                ${selectedRole === 'teacher'
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }
              `}
            >
              <input
                type="radio"
                value="teacher"
                {...register('role', {
                  required: 'Rolni tanlang',
                })}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-2xl mb-1">👨‍🏫</div>
                <div className={`font-medium ${selectedRole === 'teacher' ? 'text-primary-400' : 'text-slate-300'}`}>
                  Ustoz
                </div>
                <div className="text-xs text-slate-400 mt-1">Kurslar yaratish</div>
              </div>
            </label>
          </div>
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

