import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Filter,
  Search,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface Test {
  id: string;
  title: string;
  course: string;
  duration: number; // minutes
  status: 'available' | 'completed' | 'pending';
  score?: number;
  maxScore: number;
  deadline?: string;
  completedAt?: string;
}

// Mock data
const mockTests: Test[] = [
  {
    id: '1',
    title: 'Ingliz tili - Vocabulary Test',
    course: 'Ingliz tili - Boshlang\'ich',
    duration: 30,
    status: 'completed',
    score: 85,
    maxScore: 100,
    completedAt: '2024-12-20',
  },
  {
    id: '2',
    title: 'Matematika - Algebra Test',
    course: 'Matematika - Abituriyent',
    duration: 45,
    status: 'available',
    maxScore: 100,
    deadline: '2024-12-28',
  },
  {
    id: '3',
    title: 'Dasturlash - Python Basics',
    course: 'Dasturlash asoslari',
    duration: 60,
    status: 'pending',
    maxScore: 100,
    deadline: '2025-01-05',
  },
];

export function TestsPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'completed' | 'pending'>('all');

  const filteredTests = mockTests.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Test['status'], score?: number) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Tugallangan {score !== undefined && `(${score}%)`}
          </span>
        );
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400">
            <AlertCircle className="w-3.5 h-3.5" />
            Mavjud
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-400">
            <Clock className="w-3.5 h-3.5" />
            Kutilmoqda
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
        <div className="grid grid-cols-1 gap-4">
          {filteredTests.length === 0 ? (
            <div className="card text-center py-12">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Testlar topilmadi</h3>
              <p className="text-slate-400">
                {searchQuery ? 'Qidiruv natijalari bo\'sh' : 'Hozircha testlar mavjud emas'}
              </p>
            </div>
          ) : (
            filteredTests.map((test) => (
              <div key={test.id} className="card card-hover">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Test Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{test.title}</h3>
                        <p className="text-slate-400 mb-3">{test.course}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {test.duration} daqiqa
                          </span>
                          {test.deadline && (
                            <span>
                              Muddati: {formatDate(test.deadline)}
                            </span>
                          )}
                          {test.completedAt && (
                            <span>
                              Tugallangan: {formatDate(test.completedAt)}
                            </span>
                          )}
                          {test.score !== undefined && (
                            <span className="text-primary-400 font-medium">
                              Ball: {test.score}/{test.maxScore}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-3">
                    {getStatusBadge(test.status, test.score)}
                    {test.status === 'available' && (
                      <Link
                        to={`/tests/${test.id}`}
                        className="btn-primary inline-flex items-center gap-2"
                      >
                        Testni boshlash
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                    {test.status === 'completed' && (
                      <Link
                        to={`/tests/${test.id}/results`}
                        className="btn-secondary inline-flex items-center gap-2"
                      >
                        Natijalarni ko'rish
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                    {test.status === 'pending' && (
                      <span className="text-slate-400 text-sm">
                        Hali ochilmagan
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
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
                <p className="text-2xl font-bold">{mockTests.length}</p>
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
                  {mockTests.filter((t) => t.status === 'completed').length}
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
                  {mockTests.filter((t) => t.status === 'available').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

