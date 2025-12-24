import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { GraduationCap, Menu, X, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';

const navLinks = [
  { to: '/', label: "Bosh sahifa" },
  { to: '/courses', label: 'Kurslar' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text hidden sm:block">
              Uzbek Ta'lim
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  {user?.first_name}
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">
                  Kirish
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Ro'yxatdan o'tish
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 animate-slide-down">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'px-4 py-3 rounded-lg font-medium transition-colors',
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="border-t border-slate-800 mt-2 pt-4 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-3 rounded-lg font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="px-4 py-3 rounded-lg font-medium text-red-400 hover:text-red-300 hover:bg-slate-800/50 transition-colors text-left"
                    >
                      Chiqish
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="btn-secondary w-full"
                    >
                      Kirish
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="btn-primary w-full"
                    >
                      Ro'yxatdan o'tish
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

