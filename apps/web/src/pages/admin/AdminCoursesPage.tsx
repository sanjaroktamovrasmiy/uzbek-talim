import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { adminCoursesApi } from '@/services/api';
import toast from 'react-hot-toast';

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

export function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    loadCourses();
  }, [page, statusFilter]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        size: pageSize,
      };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const response = await adminCoursesApi.listCourses(params);
      setCourses(response.items || []);
      setTotalPages(Math.ceil((response.total || 0) / pageSize));
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Kurslarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadCourses();
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Bu kursni o\'chirishni tasdiqlaysizmi?')) return;

    try {
      await adminCoursesApi.deleteCourse(courseId);
      toast.success('Kurs o\'chirildi');
      loadCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Xatolik yuz berdi');
    }
  };

  const handlePublish = async (courseId: string) => {
    try {
      await adminCoursesApi.publishCourse(courseId);
      toast.success('Kurs nashr qilindi');
      loadCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Xatolik yuz berdi');
    }
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

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Kurslar</h1>
          <p className="text-slate-400">Barcha kurslarni boshqarish</p>
        </div>
        <button
          onClick={() => {
            toast('Yangi kurs yaratish funksiyasi tez orada qo\'shiladi', { icon: 'ℹ️' });
          }}
          className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:from-red-600 hover:to-orange-700 transition-colors font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Yangi kurs
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Qidirish (kurs nomi)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Barcha holatlar</option>
            <option value="draft">Qoralama</option>
            <option value="published">Nashr qilingan</option>
            <option value="archived">Arxivlangan</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:from-red-600 hover:to-orange-700 transition-colors font-medium"
          >
            Qidirish
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400">Kurslar topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="card hover:scale-105 transition-transform duration-200">
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-white line-clamp-2">{course.name}</h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ml-2 ${getStatusColor(course.status)}`}
                  >
                    {getStatusLabel(course.status)}
                  </span>
                </div>
                {course.short_description && (
                  <p className="text-sm text-slate-400 line-clamp-2">{course.short_description}</p>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Narxi:</span>
                  <span className="text-lg font-bold text-white">
                    {formatPrice(course.discount_price || course.price)}
                  </span>
                </div>
                {course.duration_months && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Davomiyligi:</span>
                    <span className="text-sm text-white">{course.duration_months} oy</span>
                  </div>
                )}
                {course.category && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Kategoriya:</span>
                    <span className="text-sm text-white">{course.category}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-700">
                {course.status !== 'published' && (
                  <button
                    onClick={() => handlePublish(course.id)}
                    className="flex-1 px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    title="Nashr qilish"
                  >
                    <Eye className="w-4 h-4" />
                    Nashr qilish
                  </button>
                )}
                <button
                  onClick={() => {
                    toast('Tahrirlash funksiyasi tez orada qo\'shiladi', { icon: 'ℹ️' });
                  }}
                  className="px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
                  title="Tahrirlash"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                  title="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Sahifa {page} / {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Oldingi
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Keyingi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

