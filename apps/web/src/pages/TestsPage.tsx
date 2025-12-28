import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  Filter,
  Search,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { testsApi } from '@/services/api';

interface Test {
  id: string;
  title: string;
  course_name?: string;
  course_id?: string;
  test_type: string;
  duration: number; // minutes
  max_score: number;
  passing_score: number;
  scoring_model: string;
  is_active?: boolean;
  available_from?: string;
  available_until?: string;
  status?: 'available' | 'completed' | 'pending';
  score?: number;
  completed_at?: string;
}

export function TestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'completed' | 'pending'>('all');
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setIsLoading(true);
    try {
      const data = await testsApi.getTests();
      // Handle paginated response
      if (data && data.items) {
        setTests(data.items || []);
      } else if (Array.isArray(data)) {
        setTests(data);
      } else {
        setTests([]);
      }
    } catch (error: any) {
      console.error('Error loading tests:', error);
      toast.error(error.response?.data?.detail || 'Testlarni yuklashda xatolik');
      setTests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTestStatus = (test: Test): 'available' | 'completed' | 'pending' => {
    // If test is completed, return completed status
    if (test.completed_at) return 'completed';
    
    // If test is not active, it should not be shown, but if shown, mark as pending
    if (test.is_active === false) return 'pending';
    
    const now = new Date();
    
    // Check if test has expired (available_until is in the past)
    if (test.available_until) {
      const untilDate = new Date(test.available_until);
      if (untilDate < now) return 'pending';
    }
    
    // Check if test hasn't started yet (available_from is in the future)
    if (test.available_from) {
      const fromDate = new Date(test.available_from);
      if (fromDate > now) return 'pending';
    }
    
    // If test is active and within available dates (or no dates set), it's available
    return 'available';
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

  const filteredTests = tests.map(test => ({
    ...test,
    status: test.status || getTestStatus(test),
  })).filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (test.course_name && test.course_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (test: Test) => {
    const status = test.status || getTestStatus(test);
    switch (status) {
      case 'completed':
        const percentage = test.score !== undefined ? Math.round((test.score / test.max_score) * 100) : 0;
        return (
          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold border backdrop-blur-sm bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30">
            ✓ Tugallangan {test.score !== undefined && `(${percentage}%)`}
          </span>
        );
      case 'available':
        return (
          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold border backdrop-blur-sm bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30">
            ● Mavjud
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold border backdrop-blur-sm bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/30">
            ○ Kutilmoqda
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="py-8 md:py-12">
        <div className="container-custom">
          <div className="flex items-center justify-center py-12">
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
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Testlar</h1>
          <p className="text-slate-400">
            Mavjud testlar va natijalaringiz
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Test yoki kurs nomini qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="input bg-slate-800 border-slate-700"
              >
                <option value="all">Barchasi</option>
                <option value="available">Mavjud</option>
                <option value="completed">Tugallangan</option>
                <option value="pending">Kutilmoqda</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tests List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.length === 0 ? (
            <div className="col-span-full">
              <div className="card text-center py-12">
                <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Testlar topilmadi</h3>
                <p className="text-slate-400">
                  {searchQuery ? 'Qidiruv natijalari bo\'sh' : 'Hozircha testlar mavjud emas'}
                </p>
              </div>
            </div>
          ) : (
            filteredTests.map((test) => {
              const status = test.status || getTestStatus(test);
              return (
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
                            <Link to={`/tests/${test.id}`} className="block">
                              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors cursor-pointer">
                                {test.title}
                              </h3>
                            </Link>
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
                          {getStatusBadge(test)}
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
                    <div className="space-y-2 mb-4 p-2 bg-slate-900/30 rounded-lg">
                      {test.available_until && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Muddati:</span>
                          <span className="text-slate-300 font-medium">{formatDate(test.available_until)}</span>
                        </div>
                      )}
                      {test.completed_at && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Tugallangan:</span>
                          <span className="text-slate-300 font-medium">{formatDate(test.completed_at)}</span>
                        </div>
                      )}
                      {test.score !== undefined && (
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                          <span className="text-slate-400">Sizning balingiz:</span>
                          <span className="text-primary-400 font-bold">{test.score}/{test.max_score}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <span className="text-xs text-slate-500">
                        {test.available_from && formatDate(test.available_from)}
                      </span>
                      <div className="flex items-center gap-2">
                        {status === 'available' && (
                          <Link
                            to={`/tests/${test.id}`}
                            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 inline-flex items-center gap-2"
                          >
                            Testni boshlash
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                        {status === 'completed' && (
                          <Link
                            to={`/tests/${test.id}/results`}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2 border border-slate-700"
                          >
                            Natijalarni ko'rish
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                        {status === 'pending' && (
                          <span className="px-4 py-2 bg-slate-800 text-slate-400 text-sm font-medium rounded-lg border border-slate-700 cursor-not-allowed">
                            Hali ochilmagan
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Jami testlar</p>
                <p className="text-2xl font-bold">{tests.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Tugallangan</p>
                <p className="text-2xl font-bold">
                  {tests.filter((t) => (t.status || getTestStatus(t)) === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Mavjud testlar</p>
                <p className="text-2xl font-bold">
                  {tests.filter((t) => (t.status || getTestStatus(t)) === 'available').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
