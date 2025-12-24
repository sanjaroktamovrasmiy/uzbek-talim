import { useAuthStore } from '@/store/authStore';
import { User, Phone, Mail, MapPin } from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="py-12">
      <div className="container-custom max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Profil</h1>

        <div className="card">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-800">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {user?.first_name} {user?.last_name}
              </h2>
              <span className="text-slate-400 text-sm capitalize">
                {user?.role === 'student' ? "O'quvchi" : user?.role}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary-400" />
              <div>
                <span className="text-slate-400 text-sm block">Telefon</span>
                <span>{user?.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary-400" />
              <div>
                <span className="text-slate-400 text-sm block">Email</span>
                <span>{user?.email || 'Kiritilmagan'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary-400" />
              <div>
                <span className="text-slate-400 text-sm block">Manzil</span>
                <span>Kiritilmagan</span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button className="btn-secondary w-full mt-8">
            Tahrirlash
          </button>
        </div>
      </div>
    </div>
  );
}

