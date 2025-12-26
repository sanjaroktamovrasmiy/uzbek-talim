import { useEffect, useState } from 'react';
import { usersApi, adminCoursesApi, adminPaymentsApi } from '@/services/api';

interface StatData {
  label: string;
  value: number;
  change?: number;
}

export function AdminStatsPage() {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<StatData[]>([]);
  const [courseStats, setCourseStats] = useState<StatData[]>([]);
  const [paymentStats, setPaymentStats] = useState<StatData[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Load all data for statistics
      const [usersRes, coursesRes, paymentsRes] = await Promise.all([
        usersApi.listUsers({ size: 1000 }),
        adminCoursesApi.listCourses({ size: 1000 }),
        adminPaymentsApi.listPayments({ size: 1000 }),
      ]);

      const users = usersRes.items || [];
      const courses = coursesRes.items || [];
      const payments = paymentsRes.items || [];

      // Calculate user stats by role
      const userRoles: Record<string, number> = {};
      users.forEach((user: any) => {
        userRoles[user.role] = (userRoles[user.role] || 0) + 1;
      });

      const roleLabels: Record<string, string> = {
        super_admin: 'Super Admin',
        admin: 'Admin',
        manager: 'Manager',
        teacher: "O'qituvchi",
        student: "O'quvchi",
        guest: 'Mehmon',
      };

      setUserStats(
        Object.entries(userRoles).map(([role, count]) => ({
          label: roleLabels[role] || role,
          value: count as number,
        }))
      );

      // Calculate course stats by status
      const courseStatuses: Record<string, number> = {};
      courses.forEach((course: any) => {
        courseStatuses[course.status] = (courseStatuses[course.status] || 0) + 1;
      });

      const statusLabels: Record<string, string> = {
        draft: 'Qoralama',
        published: 'Nashr qilingan',
        archived: 'Arxivlangan',
      };

      setCourseStats(
        Object.entries(courseStatuses).map(([status, count]) => ({
          label: statusLabels[status] || status,
          value: count as number,
        }))
      );

      // Calculate payment stats by status
      const paymentStatuses: Record<string, number> = {};
      let totalRevenue = 0;
      const today = new Date().toISOString().split('T')[0];
      let todayRevenue = 0;

      payments.forEach((payment: any) => {
        paymentStatuses[payment.status] = (paymentStatuses[payment.status] || 0) + 1;
        if (payment.status === 'completed' && payment.amount) {
          totalRevenue += payment.amount;
          const paidDate = payment.paid_at?.split('T')[0];
          if (paidDate === today) {
            todayRevenue += payment.amount;
          }
        }
      });

      const paymentStatusLabels: Record<string, string> = {
        pending: 'Kutilmoqda',
        completed: 'Tasdiqlangan',
        failed: 'Muvaffaqiyatsiz',
        cancelled: 'Bekor qilingan',
      };

      setPaymentStats([
        ...Object.entries(paymentStatuses).map(([status, count]) => ({
          label: paymentStatusLabels[status] || status,
          value: count as number,
        })),
        {
          label: 'Jami daromad',
          value: totalRevenue,
        },
        {
          label: 'Bugungi daromad',
          value: todayRevenue,
        },
      ]);
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

  const StatCard = ({ title, stats }: { title: string; stats: StatData[] }) => (
    <div className="card">
      <h3 className="text-xl font-bold text-white mb-6">{title}</h3>
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-slate-400">{stat.label}</span>
            <div className="flex items-center gap-2">
              {stat.value > 1000000 ? (
                <span className="text-lg font-bold text-white">{formatPrice(stat.value)}</span>
              ) : (
                <span className="text-lg font-bold text-white">{stat.value}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
        <h1 className="text-3xl font-bold text-white mb-2">Statistika</h1>
        <p className="text-slate-400">Batafsil statistika va hisobotlar</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Foydalanuvchilar bo'yicha" stats={userStats} />
        <StatCard title="Kurslar bo'yicha" stats={courseStats} />
        <StatCard title="To'lovlar bo'yicha" stats={paymentStats} />
      </div>
    </div>
  );
}

