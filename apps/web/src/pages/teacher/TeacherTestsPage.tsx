import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plus, FileText, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { testsApi } from '@/services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

interface Test {
  id: string;
  title: string;
  course_id?: string;
  course_name?: string;
  test_type: string;
  duration: number;
  max_score: number;
  passing_score: number;
  is_active: boolean;
  scoring_model: string;
  available_from?: string;
  available_until?: string;
  created_at: string;
}

export function TeacherTestsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Check if user is teacher
    if (user?.role !== 'teacher' && user?.role !== 'admin' && user?.role !== 'super_admin') {
      toast.error('Bu sahifa faqat o\'qituvchilar uchun');
      navigate('/dashboard');
      return;
    }
    
    // Reload tests when coming back to this page (e.g., after creating a test)
    if (location.pathname === '/teacher/tests') {
      loadTests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, location.pathname]);

  const loadTests = async () => {
    try {
      setLoading(true);
      const response = await testsApi.getTests({ page: 1, size: 100 });
      
      // Handle different response formats
      let testsList: Test[] = [];
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          testsList = response;
        } else if (response.items && Array.isArray(response.items)) {
          testsList = response.items;
        } else if (response.data && Array.isArray(response.data)) {
          testsList = response.data;
        }
      }
      
      setTests(testsList);
    } catch (error: any) {
      console.error('Error loading tests:', error);
      toast.error(error.response?.data?.detail || 'Testlarni yuklashda xatolik');
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (testId: string) => {
    if (!confirm('Bu testni o\'chirishni tasdiqlaysizmi?')) return;

    try {
      await testsApi.deleteTest(testId);
      toast.success('Test o\'chirildi');
      loadTests();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Xatolik yuz berdi');
    }
  };

  const getTestTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      course_test: 'Kurs testi',
      public_test: 'Ommaviy test',
      mock_test: 'Mock test',
      sat_mock: 'SAT Mock',
      entrance_test: 'Kirish testi',
      placement_test: 'Joylashtirish testi',
      diagnostic_test: 'Diagnostika testi',
      practice_test: 'Amaliy test',
    };
    return types[type] || type;
  };

  const getScoringModelLabel = (model: string) => {
    const models: Record<string, string> = {
      simple: 'Oddiy',
      weighted: 'Vaznli',
      rasch: 'Rasch',
      two_pl: '2PL IRT',
      three_pl: '3PL IRT',
    };
    return models[model] || model;
  };

  const filteredTests = tests.filter((test) =>
    test.title.toLowerCase().includes(search.toLowerCase()) ||
    test.course_name?.toLowerCase().includes(search.toLowerCase())
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
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Testlarim</h1>
            <p className="text-slate-400">Testlarni boshqarish va yangi testlar yaratish</p>
          </div>
          <Link
            to="/teacher/tests/create"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Yangi test
          </Link>
        </div>

        {/* Search */}
        <div className="card mb-6">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Testlarni qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500"
            />
          </div>
        </div>

        {/* Tests List */}
        {!loading && filteredTests.length === 0 && tests.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Hozircha testlar yo'q</h3>
            <p className="text-slate-400 mb-6">Yangi test yaratishni boshlang</p>
            <Link to="/teacher/tests/create" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Birinchi testni yaratish
            </Link>
          </div>
        ) : !loading && filteredTests.length === 0 && tests.length > 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Qidiruv natijalari bo'sh</h3>
            <p className="text-slate-400 mb-6">"{search}" uchun testlar topilmadi</p>
            <button
              onClick={() => setSearch('')}
              className="btn-secondary inline-flex items-center gap-2"
            >
              Qidiruvni tozalash
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <div 
                key={test.id} 
                className="card group hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 border border-slate-800 hover:border-primary-500/50 relative overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-accent-500/0 group-hover:from-primary-500/5 group-hover:to-accent-500/5 transition-opacity duration-300 pointer-events-none" />
                
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                            {test.title}
                          </h3>
                          {test.course_name && (
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm text-slate-400">Kurs:</span>
                              <span className="text-sm font-medium text-primary-400">{test.course_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        <span className="px-3 py-1.5 bg-gradient-to-r from-primary-500/20 to-primary-600/20 text-primary-300 text-xs font-semibold rounded-lg border border-primary-500/30 backdrop-blur-sm">
                          {getTestTypeLabel(test.test_type)}
                        </span>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border backdrop-blur-sm ${
                          test.is_active 
                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30' 
                            : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        }`}>
                          {test.is_active ? '✓ Faol' : '○ Nofaol'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-400 mb-1">{test.duration}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide">Daqiqa</div>
                    </div>
                    <div className="text-center border-x border-slate-800">
                      <div className="text-2xl font-bold text-accent-400 mb-1">{test.max_score}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide">Max ball</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400 mb-1">{test.passing_score}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide">O'tish</div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center justify-between mb-4 p-2 bg-slate-900/30 rounded-lg">
                    <span className="text-xs text-slate-400">Hisoblash:</span>
                    <span className="text-xs font-medium text-slate-300">{getScoringModelLabel(test.scoring_model)}</span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500">Yaratilgan</span>
                      <span className="text-sm font-medium text-slate-300">
                        {new Date(test.created_at).toLocaleDateString('uz-UZ', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/teacher/tests/${test.id}/edit`}
                        className="p-2.5 rounded-lg bg-slate-800 hover:bg-primary-500/20 border border-slate-700 hover:border-primary-500/50 transition-all group/edit"
                        title="Tahrirlash"
                      >
                        <Edit className="w-4 h-4 text-slate-400 group-hover/edit:text-primary-400 transition-colors" />
                      </Link>
                      <button
                        onClick={() => handleDelete(test.id)}
                        className="p-2.5 rounded-lg bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 transition-all group/delete"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4 text-slate-400 group-hover/delete:text-red-400 transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

