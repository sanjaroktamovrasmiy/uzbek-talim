import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Yuklanayotganda kutish
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Agar allaqachon login qilgan bo'lsa, dashboard'ga yo'naltiramiz
  // yoki oldingi sahifaga qaytaramiz
  if (isAuthenticated) {
    const from = (location.state as { from?: string } | null)?.from || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

