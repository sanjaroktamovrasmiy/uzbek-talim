import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/api';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { token, setUser, setLoading, logout } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // Token mavjud, user ma'lumotlarini olish
          const userData = await authApi.getMe();
          setUser(userData);
        } catch (error) {
          // Token yaroqsiz, logout qilish
          console.error('Auth init failed:', error);
          logout();
        }
      }
      setLoading(false);
      setInitialized(true);
    };

    initAuth();
  }, [token, setUser, setLoading, logout]);

  // Boshlang'ich yuklash
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

