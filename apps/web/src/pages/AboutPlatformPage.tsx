import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, Award, Target, Star, Sparkles, X } from 'lucide-react';

export function AboutPlatformPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      icon: BookOpen,
      title: 'Nima qilamiz?',
      content: 'Biz professional online ta\'lim platformasi bo\'lib, turli sohalarda sifatli kurslar taqdim etamiz. O\'quvchilar bizning platformamizda yangi ko\'nikmalarni o\'rganishlari va bilimlarini oshirishlari mumkin.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Target,
      title: 'Maqsadimiz nima?',
      content: 'Bizning maqsadimiz - har bir inson uchun qulay va samarali ta\'lim imkoniyatlarini yaratish. Biz har bir o\'quvchining muvaffaqiyatga erishishiga yordam beramiz va ularning kelajaklarini yoritishga intilamiz.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Users,
      title: 'Kimlar uchun?',
      content: 'Platformamiz barcha yoshdagi va darajadagi o\'quvchilar uchun mo\'ljallangan. Boshlang\'ichdan tortib mutaxassislargacha - har kim o\'z darajasiga mos kurslarni topishi mumkin.',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: Star,
      title: 'Nima qilmaymiz?',
      content: 'Biz sizni aldab yoki bo\'sh va\'dalar bermaymiz. Biz sizga faqat sifatli va samarali ta\'limni taqdim etamiz. Bizning platformada reklama yoki keraksiz kontent yo\'q.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Award,
      title: 'Nima beramiz?',
      content: 'Tugallangan kurslar uchun sertifikatlar, malakali o\'qituvchilar bilan ishlash imkoniyati, qulay vaqt jadvali, 24/7 qo\'llab-quvvatlash xizmati va professional ta\'lim sizni kutmoqda.',
      gradient: 'from-red-500 to-rose-500',
    },
  ];

  // Auto play slides
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 soniyada bir o'zgardi

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // 10 soniyadan keyin yana avto o'ynash
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <div className="bg-slate-950 relative overflow-hidden py-8 px-4">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.gradient} opacity-10 transition-all duration-1000`}
          style={{
            transform: `scale(${1 + Math.sin(Date.now() / 2000) * 0.1})`,
          }}
        />
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-accent-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Back Button */}
      <Link
        to="/dashboard"
        className="relative z-50 inline-flex items-center gap-2 text-slate-400 hover:text-white transition-all group mb-6"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Orqaga</span>
      </Link>

      {/* Close Button */}
      <Link
        to="/dashboard"
        className="absolute top-8 right-4 z-50 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
      >
        <X className="w-6 h-6" />
      </Link>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-r ${currentSlideData.gradient} rounded-full blur-2xl opacity-50 animate-pulse`} />
            <div className={`relative bg-gradient-to-r ${currentSlideData.gradient} p-4 rounded-full transition-all duration-1000`}>
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Slide Content */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-8 md:p-12 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div 
              className={`p-4 rounded-xl bg-gradient-to-br ${currentSlideData.gradient} transition-all duration-1000`}
              style={{
                transform: `rotate(${currentSlide * 72}deg) scale(${1 + Math.sin(Date.now() / 1000) * 0.1})`,
              }}
            >
              <Icon className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-6 text-white transition-all duration-500"
            key={currentSlide}
            style={{
              opacity: 0,
              animation: 'fadeInUp 0.5s ease-out 0.2s forwards',
            }}
          >
            {currentSlideData.title}
          </h2>

          {/* Content */}
          <p 
            className="text-lg md:text-xl text-slate-300 text-center leading-relaxed transition-all duration-500"
            key={`content-${currentSlide}`}
            style={{
              opacity: 0,
              animation: 'fadeInUp 0.5s ease-out 0.4s forwards',
            }}
          >
            {currentSlideData.content}
          </p>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-3 mt-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-3 rounded-full transition-all duration-500 ${
                  index === currentSlide 
                    ? `bg-gradient-to-r ${currentSlideData.gradient} w-12` 
                    : 'bg-slate-700 w-3 hover:bg-slate-600'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Slide Counter */}
          <div className="text-center mt-6 text-slate-500 text-sm">
            {currentSlide + 1} / {slides.length}
          </div>
        </div>

        {/* Platform Name */}
        <div className="text-center mt-8">
          <h3 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
            Uzbek Ta&apos;lim Platformasi
          </h3>
          <p className="text-slate-400 mt-2 text-sm">Professional ta&apos;lim - yorug&apos; kelajak uchun</p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link
            to="/app/courses"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${currentSlideData.gradient} hover:opacity-90 text-white font-semibold transition-all duration-300 shadow-lg hover:scale-105`}
          >
            <BookOpen className="w-5 h-5" />
            Kurslarga o&apos;tish
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all duration-300 border border-slate-700 hover:border-slate-600"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
