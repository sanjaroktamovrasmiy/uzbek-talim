import { Outlet } from 'react-router-dom';
import { BrandLogo } from '@/components/common/BrandLogo';

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
        <div className="flex justify-center mb-8">
          <BrandLogo
            to="/"
            imgClassName="h-20 sm:h-24 w-20 sm:w-24"
            className="justify-center gap-3"
            showFallbackText={false}
          />
        </div>

        {/* Content */}
        <div className="card">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          © 2025 Uzbek Ta'lim. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </div>
  );
}

