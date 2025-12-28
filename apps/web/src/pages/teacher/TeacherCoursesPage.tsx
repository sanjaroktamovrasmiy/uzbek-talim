import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Edit, Search, Loader2, Calendar, Clock, RefreshCw } from 'lucide-react';
import { coursesApi } from '@/services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

interface Course {
  id: string;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  price: number;
  discount_price?: number;
  status: string;
  category?: string;
  duration_months?: number;
  lessons_per_week?: number;
  created_at: string;
}

export function TeacherCoursesPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Check if user is teacher
    if (user?.role !== 'teacher' && user?.role !== 'admin' && user?.role !== 'super_admin') {
      toast.error('Bu sahifa faqat o\'qituvchilar uchun');
      navigate('/dashboard');
      return;
    }
    loadCourses();
  }, [user, navigate]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesApi.getAll({ page: 1, size: 100 });
      setCourses(response.items || []);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Kurslarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(price) + " so'm";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Qoralama',
      published: 'Nashr qilingan',
      archived: 'Arxivlangan',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      published: 'bg-green-500/20 text-green-400 border-green-500/30',
      archived: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(search.toLowerCase()) ||
    course.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="py-8 md:py-12">
        <div className="container-custom">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Kurslarim</h1>
            <p className="text-slate-400">Kurslarni boshqarish va yangi kurslar yaratish</p>
          </div>
          <Link
            to="/teacher/courses/create"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Yangi kurs
          </Link>
        </div>

        {/* Search and Refresh */}
        <div className="card mb-6">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Kurslarni qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500"
            />
            <button
              onClick={loadCourses}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
              title="Yangilash"
            >
              <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Jami kurslar</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Nashr qilingan</p>
                <p className="text-2xl font-bold">
                  {courses.filter((c) => c.status === 'published').length}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Qoralama</p>
                <p className="text-2xl font-bold">
                  {courses.filter((c) => c.status === 'draft').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses List */}
        {filteredCourses.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Hozircha kurslar yo'q</h3>
            <p className="text-slate-400 mb-6">Yangi kurs yaratishni boshlang</p>
            <Link to="/teacher/courses/create" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Birinchi kursni yaratish
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="card group hover:border-primary-500/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{course.name}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(course.status)}`}>
                      {getStatusLabel(course.status)}
                    </span>
                  </div>
                </div>

                {course.short_description && (
                  <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                    {course.short_description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  {course.duration_months && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{course.duration_months} oy</span>
                    </div>
                  )}
                  {course.lessons_per_week && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>Haftada {course.lessons_per_week} dars</span>
                    </div>
                  )}
                  {course.category && (
                    <div className="text-sm text-slate-400">
                      <span className="text-slate-500">Kategoriya:</span> {course.category}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div>
                    <span className="text-lg font-bold text-primary-400">
                      {formatPrice(course.price)}
                    </span>
                    {course.discount_price && course.discount_price > 0 && (
                      <span className="block text-sm text-slate-500 line-through">
                        {formatPrice(course.discount_price)}
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/teacher/courses/${course.id}/edit`}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Tahrirlash
                  </Link>
                </div>
                {course.created_at && (
                  <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-500">
                    Yaratilgan: {formatDate(course.created_at)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
