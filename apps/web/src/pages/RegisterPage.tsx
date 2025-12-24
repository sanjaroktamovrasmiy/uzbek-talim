import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/services/api';

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
  const navigate = useNavigate();

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
      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

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

