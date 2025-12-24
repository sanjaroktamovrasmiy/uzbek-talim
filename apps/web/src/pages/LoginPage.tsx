import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/api';

interface LoginForm {
  phone: string;
  password: string;
}

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data.phone, data.password);
      const user = await authApi.getMe();
      login(user, response.access_token);
      toast.success('Muvaffaqiyatli kirdingiz!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Xatolik yuz berdi");
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

      <p className="text-center text-slate-400 mt-6">
        Hisobingiz yo'qmi?{' '}
        <Link to="/register" className="text-primary-400 hover:underline">
          Ro'yxatdan o'ting
        </Link>
      </p>
    </div>
  );
}

