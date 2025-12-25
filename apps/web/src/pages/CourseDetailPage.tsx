import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Calendar, CheckCircle, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export function CourseDetailPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuthStore();

  // Mock data - replace with API call
  const course = {
    id: '1',
    slug: slug,
    name: 'Ingliz tili',
    description: `
      Ingliz tilini noldan o'rganing yoki mavjud bilimingizni rivojlantiring.
      
      Kursimizda siz:
      - Grammar asoslarini o'rganasiz
      - Speaking ko'nikmalarini rivojlantirasiz
      - Listening va Reading bo'yicha mashq qilasiz
      - Writing ko'nikmalarini oshirasiz
    `,
    price: 500000,
    duration_months: 3,
    lessons_per_week: 3,
    lesson_duration_minutes: 90,
    level: 'Boshlang\'ich',
  };

  const features = [
    "Tajribali o'qituvchilar",
    'Kichik guruhlar (8-10 kishi)',
    'Interaktiv darslar',
    "Uy vazifasi va qo'shimcha materiallar",
    'Online va offline formatda',
    'Sertifikat beriladi',
  ];

  return (
    <div className="py-12">
      <div className="container-custom">
        {/* Back link */}
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Barcha kurslar
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-8">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {course.duration_months} oy
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Haftada {course.lessons_per_week} kun
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {course.lesson_duration_minutes} daqiqa dars
              </span>
            </div>

            <div className="card mb-8">
              <h2 className="text-xl font-semibold mb-4">Kurs haqida</h2>
              <div className="text-slate-300 whitespace-pre-line">
                {course.description}
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Nimalar kiradi</h2>
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <div className="text-center mb-6">
                <span className="text-slate-400 text-sm">Narxi</span>
                <div className="text-3xl font-bold text-primary-400">
                  {new Intl.NumberFormat('uz-UZ').format(course.price)} so'm
                </div>
                <span className="text-slate-500 text-sm">oyiga</span>
              </div>

              {isAuthenticated ? (
                <button 
                  onClick={() => {
                    toast.success("So'rovingiz qabul qilindi! Tez orada siz bilan bog'lanamiz.");
                    // TODO: API ga enrollment yuborish
                  }}
                  className="btn-primary w-full mb-3"
                >
                  Kursga yozilish
                </button>
              ) : (
                <Link 
                  to="/login" 
                  state={{ from: { pathname: `/courses/${slug}` } }}
                  className="btn-primary w-full mb-3"
                >
                  Kirish va yozilish
                </Link>
              )}
              
              <a
                href="https://t.me/uzbektalim_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full"
              >
                <MessageSquare className="w-4 h-4" />
                Telegram orqali
              </a>

              <div className="mt-6 pt-6 border-t border-slate-800">
                <h4 className="font-medium mb-3">Savollar bormi?</h4>
                <p className="text-sm text-slate-400">
                  Bizga qo'ng'iroq qiling yoki yozing:
                </p>
                <a
                  href="tel:+998944758090"
                  className="text-primary-400 font-medium hover:underline"
                >
                  +998 94 475 80 90
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

