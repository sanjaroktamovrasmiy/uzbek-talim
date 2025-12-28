import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, ChevronRight, Loader2 } from 'lucide-react';
import { coursesApi } from '@/services/api';
import toast from 'react-hot-toast';

interface Course {
  id: string;
  slug: string;
  name: string;
  short_description?: string;
  image_url?: string | null;
  current_price: number;
  price: number;
  discount_price?: number;
  duration_months: number;
  lessons_per_week: number;
  category?: string;
  status: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
}

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      // Don't filter by status - show all published courses (and drafts for teachers/admins)
      const response = await coursesApi.getAll({ page: 1, size: 100 });
      if (response && response.items) {
        // Filter to show only published courses for students, all for teachers/admins
        const filteredCourses = response.items.filter((course: Course) => 
          course.status === 'published'
        );
        setCourses(filteredCourses || []);
      } else if (Array.isArray(response)) {
        const filteredCourses = response.filter((course: Course) => 
          course.status === 'published'
        );
        setCourses(filteredCourses);
      } else {
        setCourses([]);
      }
    } catch (error: any) {
      console.error('Error loading courses:', error);
      toast.error(error.response?.data?.detail || 'Kurslarni yuklashda xatolik');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="container-custom">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        </div>
      </div>
    );
  }

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
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Hozircha kurslar mavjud emas</p>
          </div>
        ) : (
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
                  {formatPrice(course.current_price || course.price)}/oy
                </span>
                <span className="flex items-center text-sm text-slate-400 group-hover:text-primary-400 transition-colors">
                  Batafsil
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

