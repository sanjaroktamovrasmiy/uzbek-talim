import { useEffect } from 'react';
import { X, BookOpen, Users, Award, Zap, Target, Star, Sparkles } from 'lucide-react';

interface PlatformInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlatformInfoModal({ isOpen, onClose }: PlatformInfoModalProps) {
  // ESC tugmasini bosilganda modalni yopish
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const features = [
    {
      icon: BookOpen,
      title: 'Keng kurslar tarmog\'i',
      description: 'Turli sohalardagi professional kurslar',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Malakali o\'qituvchilar',
      description: 'Soha mutaxassislari bilan ishlash',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Award,
      title: 'Sertifikatlar',
      description: 'Tugallangan kurslar uchun sertifikatlar',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Zap,
      title: 'Tezkor o\'rganish',
      description: 'Qulay va samarali o\'qitish metodlari',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Target,
      title: 'Maqsadli ta\'lim',
      description: 'Har bir o\'quvchi uchun individual yondashuv',
      color: 'from-red-500 to-rose-500',
    },
    {
      icon: Star,
      title: 'Yuqori sifat',
      description: 'Sertifikatlangan ta\'lim standartlari',
      color: 'from-indigo-500 to-violet-500',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop with animation */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-5xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-accent-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all duration-200 group"
          aria-label="Yopish"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
        </button>

        {/* Content */}
        <div className="relative z-10 overflow-y-auto max-h-[90vh]">
          {/* Header */}
          <div className="p-8 pb-6 text-center border-b border-slate-700/50">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-r from-primary-500 to-accent-500 p-4 rounded-full">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-purple-400 to-accent-400 mb-3">
              Uzbek Ta&apos;lim Platformasi
            </h2>
            <p className="text-slate-400 text-lg">
              Professional ta&apos;lim - yorug&apos; kelajak uchun
            </p>
          </div>

          {/* Features Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group relative p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/20 hover:-translate-y-1"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {/* Gradient Background on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />
                    
                    <div className="relative z-10">
                      {/* Icon */}
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary-400 group-hover:to-accent-400 transition-all duration-300">
                        {feature.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats Section */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '1000+', label: 'O\'quvchilar' },
                { value: '50+', label: 'Kurslar' },
                { value: '30+', label: 'O\'qituvchilar' },
                { value: '98%', label: 'Mamnuniyat' },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-primary-500/50 transition-all duration-300"
                >
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Footer CTA */}
            <div className="mt-12 text-center p-8 rounded-xl bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-accent-500/10 border border-primary-500/20">
              <h3 className="text-2xl font-bold text-white mb-3">
                Biz bilan o&apos;rganing va muvaffaqiyatga erishing!
              </h3>
              <p className="text-slate-400 mb-6">
                Professional ta&apos;lim platformasi - sizning kelajagingizni qurishda yordamchi
              </p>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold transition-all duration-200 shadow-lg shadow-primary-500/50 hover:shadow-xl hover:shadow-primary-500/60 hover:scale-105"
              >
                <BookOpen className="w-5 h-5" />
                Kurslarga o&apos;tish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

