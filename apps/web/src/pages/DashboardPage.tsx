import { Link } from 'react-router-dom';
import { Calendar, CreditCard, BookOpen, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const quickLinks = [
  { to: '/schedule', icon: Calendar, label: 'Dars jadvali', color: 'from-blue-500 to-blue-600' },
  { to: '/payments', icon: CreditCard, label: "To'lovlar", color: 'from-green-500 to-green-600' },
  { to: '/courses', icon: BookOpen, label: 'Kurslar', color: 'from-purple-500 to-purple-600' },
  { to: '/profile', icon: Bell, label: 'Bildirishnomalar', color: 'from-orange-500 to-orange-600' },
];

export function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="py-12">
      <div className="container-custom">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Salom, {user?.first_name}! 👋
          </h1>
          <p className="text-slate-400">
            O'quv markazimizga xush kelibsiz
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="card-hover text-center py-6"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} mb-3`}>
                <link.icon className="w-6 h-6 text-white" />
              </div>
              <span className="block font-medium">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-slate-400 text-sm mb-1">Aktiv kurslar</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="card">
            <h3 className="text-slate-400 text-sm mb-1">Kelgusi dars</h3>
            <p className="text-3xl font-bold">—</p>
          </div>
          <div className="card">
            <h3 className="text-slate-400 text-sm mb-1">To'lov holati</h3>
            <p className="text-3xl font-bold text-green-400">✓</p>
          </div>
        </div>

        {/* Empty state */}
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold mb-2">Hozircha kurslar yo'q</h2>
          <p className="text-slate-400 mb-6">
            Kursga yoziling va ta'limni boshlang!
          </p>
          <Link to="/courses" className="btn-primary">
            Kurslarni ko'rish
          </Link>
        </div>
      </div>
    </div>
  );
}

