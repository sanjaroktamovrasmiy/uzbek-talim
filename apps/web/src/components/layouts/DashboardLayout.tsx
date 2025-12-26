import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  BookOpen,
  User,
  Menu,
  X,
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { BrandLogo } from '@/components/common/BrandLogo';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Calendar, label: 'Dars jadvali', path: '/schedule' },
  { icon: FileText, label: 'Testlar', path: '/tests' },
  { icon: CreditCard, label: "To'lovlar", path: '/payments' },
  { icon: BookOpen, label: 'Kurslar', path: '/app/courses' },
  { icon: User, label: 'Profil', path: '/profile' },
];

const SIDEBAR_STORAGE_KEY = 'dashboard_sidebar_open';

export function DashboardLayout() {
  // localStorage'dan sidebar holatini o'qish (default: true - ochiq)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return saved !== null ? saved === 'true' : true;
  });
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Sidebar holatini localStorage'da saqlash
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarOpen));
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'student': return "O'quvchi";
      case 'teacher': return "O'qituvchi";
      case 'admin': return 'Admin';
      case 'super_admin': return 'Super Admin';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-slate-900 border-r border-slate-800
          transform transition-all duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-r-0'}
          overflow-hidden
        `}
      >
        <div className="flex flex-col h-full w-64">
          {/* Logo/Header */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <BrandLogo
                to="/"
                imgClassName="h-10 w-10"
                className="gap-2"
                showFallbackText={false}
              />
            </div>
            <div className="px-2">
              <p className="text-sm font-medium text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-slate-400">{getRoleLabel(user?.role)}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    // Mobile'da sidebar'ni yopish
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-primary-400 border border-primary-500/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info & Actions */}
          <div className="p-4 border-t border-slate-800 space-y-2">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Bosh sahifa</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Chiqish</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-slate-900 border-b border-slate-800 px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
              aria-label={sidebarOpen ? "Sidebar'ni yopish" : "Sidebar'ni ochish"}
            >
              {sidebarOpen ? (
                <>
                  <X className="w-6 h-6 lg:hidden" />
                  <ChevronLeft className="w-5 h-5 hidden lg:block" />
                </>
              ) : (
                <>
                  <Menu className="w-6 h-6 lg:hidden" />
                  <ChevronRight className="w-5 h-5 hidden lg:block" />
                </>
              )}
            </button>
            <div className="flex-1" />
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <Link
                to="/admin"
                className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                Admin Panel
              </Link>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <div className="container mx-auto px-4 py-6 lg:px-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

