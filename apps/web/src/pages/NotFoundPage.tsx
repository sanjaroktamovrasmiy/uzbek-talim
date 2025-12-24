import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Sahifa topilmadi</h2>
        <p className="text-slate-400 mb-8">
          Kechirasiz, siz qidirayotgan sahifa mavjud emas
        </p>
        <Link to="/" className="btn-primary">
          <Home className="w-5 h-5" />
          Bosh sahifaga
        </Link>
      </div>
    </div>
  );
}

