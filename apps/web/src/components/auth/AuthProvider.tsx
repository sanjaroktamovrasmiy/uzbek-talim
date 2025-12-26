import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/api';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { token, user, setUser, setLoading, logout, isAuthenticated } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // Token localStorage'dan o'qilgan bo'lishi mumkin (auto remember me)
      const storedToken = token;
      
      if (storedToken) {
        // Token mavjud, lekin user ma'lumotlari yo'q bo'lsa, olish
        if (!user || !isAuthenticated) {
          try {
            setLoading(true);
            // Token mavjud, user ma'lumotlarini olish
            const userData = await authApi.getMe();
            setUser(userData);
          } catch (error) {
            // Token yaroqsiz, logout qilish
            console.error('Auth init failed:', error);
            logout();
          } finally {
            setLoading(false);
          }
        } else {
          // User ma'lumotlari allaqachon mavjud
          setLoading(false);
        }
      } else {
        // Token yo'q, yuklash tugadi
        setLoading(false);
      }
      
      setInitialized(true);
    };

    initAuth();
  }, []); // Faqat bir marta ishga tushadi

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

