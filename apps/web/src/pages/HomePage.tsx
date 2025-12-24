import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Award, Clock } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: "Sifatli ta'lim",
    description: "Tajribali o'qituvchilar tomonidan zamonaviy metodlar bilan",
  },
  {
    icon: Users,
    title: 'Kichik guruhlar',
    description: "Har bir o'quvchiga individual e'tibor",
  },
  {
    icon: Award,
    title: 'Sertifikat',
    description: "Kurs yakunida rasmiy sertifikat beriladi",
  },
  {
    icon: Clock,
    title: 'Qulay jadval',
    description: "Ertalab, kunduzi va kechqurun guruhlar",
  },
];

export function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container-custom relative z-10 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in">
              Sifatli ta'lim —{' '}
              <span className="gradient-text">yorug' kelajak!</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-8 animate-fade-in animate-delay-100">
              Professional ta'lim markazi. Biz bilan bilimingizni oshiring va 
              muvaffaqiyatga erishing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in animate-delay-200">
              <Link to="/courses" className="btn-primary text-lg px-8 py-4">
                Kurslarni ko'rish
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/register" className="btn-secondary text-lg px-8 py-4">
                Ro'yxatdan o'tish
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">Nega biz?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Yillar davomida minglab o'quvchilarga sifatli ta'lim berdik
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="card-hover text-center animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 mb-4">
                  <feature.icon className="w-7 h-7 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="card bg-gradient-to-r from-primary-900/50 to-accent-900/50 border-primary-800/50 text-center p-12">
            <h2 className="section-title mb-4">Hoziroq boshlang!</h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              Birinchi dars bepul! Ro'yxatdan o'ting va kelajagingizni bugun boshlab yuboring.
            </p>
            <Link to="/register" className="btn-accent text-lg px-8 py-4">
              Bepul sinov darsi
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

