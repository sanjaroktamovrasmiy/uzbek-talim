import { Link } from 'react-router-dom';
import { Clock, Users, ChevronRight } from 'lucide-react';

// Mock data - replace with API call
const courses = [
  {
    id: '1',
    slug: 'ingliz-tili',
    name: 'Ingliz tili',
    short_description: "Ingliz tilini noldan o'rganing yoki bilimingizni oshiring",
    image_url: null,
    current_price: 500000,
    duration_months: 3,
    lessons_per_week: 3,
    category: 'Tillar',
  },
  {
    id: '2',
    slug: 'matematika',
    name: 'Matematika',
    short_description: "Abituriyentlar uchun matematika tayyorlov kursi",
    image_url: null,
    current_price: 400000,
    duration_months: 4,
    lessons_per_week: 3,
    category: 'Fanlar',
  },
  {
    id: '3',
    slug: 'dasturlash',
    name: 'Dasturlash asoslari',
    short_description: "Python dasturlash tilini o'rganing",
    image_url: null,
    current_price: 600000,
    duration_months: 3,
    lessons_per_week: 2,
    category: 'IT',
  },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
}

export function CoursesPage() {
  return (
    <div className="py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="section-title mb-4">Bizning kurslar</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Professional o'qituvchilar bilan sifatli ta'lim oling
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.slug}`}
              className="card-hover group"
            >
              {/* Image placeholder */}
              <div className="aspect-video bg-gradient-to-br from-primary-900/50 to-accent-900/50 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-4xl">📚</span>
              </div>

              {/* Category */}
              <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-400 text-xs font-medium rounded-full mb-3">
                {course.category}
              </span>

              {/* Title */}
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                {course.name}
              </h3>

              {/* Description */}
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                {course.short_description}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration_months} oy
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Haftada {course.lessons_per_week} kun
                </span>
              </div>

              {/* Price and CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <span className="text-lg font-bold text-primary-400">
                  {formatPrice(course.current_price)}/oy
                </span>
                <span className="flex items-center text-sm text-slate-400 group-hover:text-primary-400 transition-colors">
                  Batafsil
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

