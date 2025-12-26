import { Link } from 'react-router-dom';
import { 
  Calendar, 
  CreditCard, 
  BookOpen, 
  User, 
  TrendingUp,
  Clock,
  CheckCircle2,
  MessageSquare,
  Shield
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const quickLinks = [
  { to: '/schedule', icon: Calendar, label: 'Dars jadvali', color: 'from-blue-500 to-blue-600', description: 'Kelgusi darslar' },
  { to: '/payments', icon: CreditCard, label: "To'lovlar", color: 'from-green-500 to-green-600', description: "To'lov tarixi" },
  { to: '/app/courses', icon: BookOpen, label: 'Kurslar', color: 'from-purple-500 to-purple-600', description: "Barcha kurslar" },
  { to: '/profile', icon: User, label: 'Profil', color: 'from-orange-500 to-orange-600', description: "Shaxsiy ma'lumotlar" },
];

const recentActivities = [
  { icon: CheckCircle2, text: "Tizimga muvaffaqiyatli kirdingiz", time: "Hozir", color: 'text-green-400' },
];

export function DashboardPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'student': return "O'quvchi";
      case 'teacher': return "O'qituvchi";
      case 'admin': return "Administrator";
      case 'super_admin': return "Super Admin";
      default: return role;
    }
  };

  return (
    <div className="py-8 md:py-12">
      <div className="container-custom">
        {/* Welcome Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Salom, {user?.first_name}! 👋
              </h1>
              <p className="text-slate-400">
                O'quv markazimizga xush kelibsiz. Bugun ham yangi bilimlar olishga tayyormisiz?
              </p>
            </div>
            <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                <p className="text-sm text-slate-400">{getRoleLabel(user?.role)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-slate-400">Aktiv kurslar</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-slate-400">Tugatilgan</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">0%</p>
                <p className="text-sm text-slate-400">O'rtacha ball</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">—</p>
                <p className="text-sm text-slate-400">Kelgusi dars</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Panel Link */}
        {isAdmin && (
          <div className="mb-6">
            <Link
              to="/admin"
              className="card-hover group bg-gradient-to-r from-red-500/10 to-orange-600/10 border-red-500/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Admin Panel</h3>
                  <p className="text-sm text-slate-400">
                    Tizimni boshqarish va sozlamalarni o'zgartirish
                  </p>
                </div>
                <div className="text-red-400 group-hover:text-red-300">
                  →
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Quick Links & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Tezkor havolalar</h2>
            <div className="grid grid-cols-2 gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="card-hover group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <link.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="block font-medium mb-1">{link.label}</span>
                      <span className="text-sm text-slate-400">{link.description}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-semibold mb-4">So'nggi faollik</h2>
            <div className="card space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <activity.icon className={`w-5 h-5 ${activity.color} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}

              {recentActivities.length === 1 && (
                <div className="text-center py-4 text-slate-500 text-sm">
                  Boshqa faollik yo'q
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Telegram Connection */}
        {!user?.telegram_id && (
          <div className="card bg-gradient-to-r from-[#0088cc]/10 to-[#0088cc]/5 border-[#0088cc]/20 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#0088cc]/20 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-7 h-7 text-[#0088cc]" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-semibold mb-1">Telegram'ni ulang</h3>
                <p className="text-sm text-slate-400">
                  Telegram orqali bildirishnomalar va tezkor kirish imkoniyatidan foydalaning
                </p>
              </div>
              <a
                href="https://t.me/uzbektalim_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4" />
                Telegram Bot
              </a>
            </div>
          </div>
        )}

        {/* Empty Courses State */}
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold mb-2">Hozircha kurslar yo'q</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Kursga yoziling va professional ta'limni boshlang! Bizning tajribali ustozlarimiz sizga yordam berishadi.
          </p>
          <Link to="/app/courses" className="btn-primary inline-flex">
            <BookOpen className="w-5 h-5" />
            Kurslarni ko'rish
          </Link>
        </div>
      </div>
    </div>
  );
}
