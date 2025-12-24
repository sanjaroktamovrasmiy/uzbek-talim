import { Outlet, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-accent-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center justify-center gap-3 mb-8 group"
        >
          <div className="p-3 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">Uzbek Ta'lim</span>
        </Link>

        {/* Content */}
        <div className="card">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          © 2024 Uzbek Ta'lim. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </div>
  );
}

