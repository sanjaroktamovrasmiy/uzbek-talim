import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { coursesApi } from '@/services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    duration_months: 3,
    lessons_per_week: 3,
    lesson_duration_minutes: 90,
    price: 0,
    discount_price: 0,
    level: '',
    category: '',
    tags: '',
  });

  useEffect(() => {
    if (user?.role !== 'teacher' && user?.role !== 'admin' && user?.role !== 'super_admin') {
      navigate('/dashboard');
      return;
    }
    if (id) {
      loadCourse();
    }
  }, [id, user, navigate]);

  const loadCourse = async () => {
    if (!id) return;
    try {
      setLoadingCourse(true);
      // getBySlug works with both ID and slug
      const course = await coursesApi.getBySlug(id);
      setFormData({
        name: course.name || '',
        description: course.description || '',
        short_description: course.short_description || '',
        duration_months: course.duration_months || 3,
        lessons_per_week: course.lessons_per_week || 3,
        lesson_duration_minutes: course.lesson_duration_minutes || 90,
        price: Number(course.price) || 0,
        discount_price: course.discount_price ? Number(course.discount_price) : 0,
        level: course.level || '',
        category: course.category || '',
        tags: course.tags || '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Kursni yuklashda xatolik');
      navigate('/teacher/courses');
    } finally {
      setLoadingCourse(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    if (!formData.name.trim()) {
      toast.error('Kurs nomini kiriting');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Kurs narxini kiriting');
      return;
    }

    try {
      setLoading(true);
      await coursesApi.update(id, formData);
      toast.success('Kurs muvaffaqiyatli yangilandi');
      navigate('/teacher/courses');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Kursni yangilashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration_months' || name === 'lessons_per_week' || name === 'lesson_duration_minutes' || name === 'price' || name === 'discount_price'
        ? Number(value) || 0
        : value,
    }));
  };

  if (loadingCourse) {
    return (
      <div className="py-8 md:py-12">
        <div className="container-custom max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/teacher/courses')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Orqaga
          </button>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Kursni tahrirlash</h1>
          <p className="text-slate-400">Kurs ma'lumotlarini yangilang</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Asosiy ma'lumotlar</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Kurs nomi <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Masalan: Ingliz tili"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Qisqa tavsif</label>
                <input
                  type="text"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Kurs haqida qisqa ma'lumot"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">To'liq tavsif</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Kurs haqida batafsil ma'lumot"
                />
              </div>
            </div>
          </div>

          {/* Course Details */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Kurs tafsilotlari</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Davomiyligi (oy)</label>
                <input
                  type="number"
                  name="duration_months"
                  value={formData.duration_months}
                  onChange={handleChange}
                  min="1"
                  max="24"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Haftada darslar soni</label>
                <input
                  type="number"
                  name="lessons_per_week"
                  value={formData.lessons_per_week}
                  onChange={handleChange}
                  min="1"
                  max="7"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dars davomiyligi (daqiqa)</label>
                <input
                  type="number"
                  name="lesson_duration_minutes"
                  value={formData.lesson_duration_minutes}
                  onChange={handleChange}
                  min="30"
                  max="180"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Daraja</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Tanlang</option>
                  <option value="beginner">Boshlang'ich</option>
                  <option value="intermediate">O'rta</option>
                  <option value="advanced">Yuqori</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kategoriya</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Masalan: Tillar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Teglar</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Vergul bilan ajratilgan"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Narx</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Narx (so'm) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Chegirma narxi (so'm)</label>
                <input
                  type="number"
                  name="discount_price"
                  value={formData.discount_price}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/teacher/courses')}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Yangilanmoqda...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  O'zgarishlarni saqlash
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

