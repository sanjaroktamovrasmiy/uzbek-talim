import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CreditCard,
  TrendingUp,
  UserCheck,
  BookMarked,
  DollarSign,
  Calendar,
  ArrowRight,
  Settings,
} from 'lucide-react';
import { usersApi, adminCoursesApi, adminPaymentsApi } from '@/services/api';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  activeCourses: number;
  totalPayments: number;
  todayPayments: number;
  totalRevenue: number;
  todayRevenue: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalPayments: 0,
    todayPayments: 0,
    totalRevenue: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      // Load all data for accurate statistics
      const [usersRes, coursesRes, paymentsRes] = await Promise.all([
        usersApi.listUsers({ size: 1000 }),
        adminCoursesApi.listCourses({ size: 1000 }),
        adminPaymentsApi.listPayments({ size: 1000 }),
      ]);

      // Calculate stats
      const totalUsers = usersRes.total || 0;
      const activeUsers = usersRes.items?.filter((u: any) => u.is_active)?.length || 0;
      const totalCourses = coursesRes.total || 0;
      const activeCourses = coursesRes.items?.filter((c: any) => c.status === 'published')?.length || 0;
      const totalPayments = paymentsRes.total || 0;
      
      // Calculate revenue and today stats
      let totalRevenue = 0;
      let todayRevenue = 0;
      let todayPayments = 0;
      const today = new Date().toISOString().split('T')[0];
      
      if (paymentsRes.items) {
        paymentsRes.items.forEach((payment: any) => {
          if (payment.status === 'completed' && payment.amount) {
            totalRevenue += Number(payment.amount);
            const paidDate = payment.paid_at?.split('T')[0];
            if (paidDate === today) {
              todayRevenue += Number(payment.amount);
              todayPayments += 1;
            }
          }
        });
      }

      setStats({
        totalUsers,
        activeUsers,
        totalCourses,
        activeCourses,
        totalPayments,
        todayPayments,
        totalRevenue,
        todayRevenue,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(amount) + " so'm";
  };

  const statCards = [
    {
      title: 'Jami foydalanuvchilar',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-500/10 to-blue-600/5',
      borderColor: 'border-blue-500/20',
      textColor: 'text-blue-400',
      link: '/admin/users',
    },
    {
      title: 'Aktiv foydalanuvchilar',
      value: stats.activeUsers,
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-500/10 to-green-600/5',
      borderColor: 'border-green-500/20',
      textColor: 'text-green-400',
      link: '/admin/users',
    },
    {
      title: 'Jami kurslar',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-500/10 to-purple-600/5',
      borderColor: 'border-purple-500/20',
      textColor: 'text-purple-400',
      link: '/admin/courses',
    },
    {
      title: 'Aktiv kurslar',
      value: stats.activeCourses,
      icon: BookMarked,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'from-indigo-500/10 to-indigo-600/5',
      borderColor: 'border-indigo-500/20',
      textColor: 'text-indigo-400',
      link: '/admin/courses',
    },
    {
      title: 'Jami to\'lovlar',
      value: stats.totalPayments,
      icon: CreditCard,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-500/10 to-emerald-600/5',
      borderColor: 'border-emerald-500/20',
      textColor: 'text-emerald-400',
      link: '/admin/payments',
    },
    {
      title: 'Bugungi to\'lovlar',
      value: stats.todayPayments,
      icon: Calendar,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-500/10 to-orange-600/5',
      borderColor: 'border-orange-500/20',
      textColor: 'text-orange-400',
      link: '/admin/payments',
    },
    {
      title: 'Jami daromad',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'from-yellow-500/10 to-yellow-600/5',
      borderColor: 'border-yellow-500/20',
      textColor: 'text-yellow-400',
      link: '/admin/stats',
    },
    {
      title: 'Bugungi daromad',
      value: formatPrice(stats.todayRevenue),
      icon: TrendingUp,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'from-pink-500/10 to-pink-600/5',
      borderColor: 'border-pink-500/20',
      textColor: 'text-pink-400',
      link: '/admin/stats',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Tizim statistikasi va ko'rsatkichlar</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Link
          to="/admin/users"
          className="card bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 hover:scale-105 transition-transform duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-medium">Foydalanuvchilar</span>
            </div>
            <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link
          to="/admin/courses"
          className="card bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 hover:scale-105 transition-transform duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-medium">Kurslar</span>
            </div>
            <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link
          to="/admin/payments"
          className="card bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 hover:scale-105 transition-transform duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-medium">To'lovlar</span>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link
          to="/admin/stats"
          className="card bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 hover:scale-105 transition-transform duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-medium">Statistika</span>
            </div>
            <ArrowRight className="w-5 h-5 text-pink-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link
          to="/admin/settings"
          className="card bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 hover:scale-105 transition-transform duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-medium">Sozlamalar</span>
            </div>
            <ArrowRight className="w-5 h-5 text-orange-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const CardContent = (
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-400 mb-2">{card.title}</p>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          );

          if (card.link) {
            return (
              <Link
                key={index}
                to={card.link}
                className={`
                  card bg-gradient-to-br ${card.bgColor} border ${card.borderColor}
                  hover:scale-105 transition-transform duration-200 cursor-pointer
                `}
              >
                {CardContent}
              </Link>
            );
          }

          return (
            <div
              key={index}
              className={`
                card bg-gradient-to-br ${card.bgColor} border ${card.borderColor}
                hover:scale-105 transition-transform duration-200
              `}
            >
              {CardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}

