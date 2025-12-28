import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Trophy,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { testsApi } from '@/services/api';

interface QuestionResult {
  id: string;
  question_text: string;
  points: number;
  user_answer: string[];
  correct_answer: string[];
  is_correct: boolean;
  options?: Array<{
    id: string;
    option_text: string;
    is_correct: boolean;
  }>;
}

interface TestResult {
  id: string;
  test_id: string;
  test_title: string;
  course_name: string;
  score: number;
  max_score: number;
  passing_score: number;
  percentage: number;
  passed: boolean;
  completed_at: string;
  questions: QuestionResult[];
}

export function TestResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadResult();
    }
  }, [id]);

  const loadResult = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await testsApi.getResult(id);
      setResult(data);
    } catch (error: any) {
      console.error('Error loading test result:', error);
      toast.error(error.response?.data?.detail || 'Natijalarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  if (!result) {
    return (
      <div className="py-8 md:py-12">
        <div className="container-custom">
          <div className="card text-center py-12">
            <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Natijalar topilmadi</h3>
            <Link to="/tests" className="btn-primary inline-flex items-center gap-2 mt-4">
              <ArrowLeft className="w-4 h-4" />
              Testlar ro'yxatiga qaytish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const correctCount = result.questions.filter((q) => q.is_correct).length;
  const incorrectCount = result.questions.length - correctCount;

  return (
    <div className="py-8 md:py-12">
      <div className="container-custom">
        <Link
          to="/tests"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Testlar ro'yxatiga qaytish
        </Link>

        {/* Result Summary */}
        <div className="card mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">{result.test_title}</h1>
            <p className="text-slate-400">{result.course_name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Score */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-10 h-10 text-primary-400" />
              </div>
              <p className="text-3xl font-bold mb-1">
                {result.score} / {result.max_score}
              </p>
              <p className="text-slate-400">Ball</p>
            </div>

            {/* Percentage */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-400">{result.percentage}%</span>
              </div>
              <p className="text-slate-400">Foiz</p>
            </div>

            {/* Status */}
            <div className="text-center">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  result.passed ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}
              >
                {result.passed ? (
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                ) : (
                  <XCircle className="w-10 h-10 text-red-400" />
                )}
              </div>
              <p className={`font-semibold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                {result.passed ? "O'tdi" : "O'tmadi"}
              </p>
              <p className="text-sm text-slate-400">
                O'tish balli: {result.passing_score}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-400">{correctCount}</p>
                <p className="text-sm text-slate-400">To'g'ri javob</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{incorrectCount}</p>
                <p className="text-sm text-slate-400">Noto'g'ri javob</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{result.questions.length}</p>
                <p className="text-sm text-slate-400">Jami savollar</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(result.completed_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Savollar va javoblar</h2>
          <div className="space-y-6">
            {result.questions.map((question, index) => (
              <div
                key={question.id}
                className={`p-4 rounded-lg border-2 ${
                  question.is_correct
                    ? 'border-green-500/50 bg-green-500/10'
                    : 'border-red-500/50 bg-red-500/10'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      question.is_correct
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {question.is_correct ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">
                      {index + 1}. {question.question_text}
                    </h3>
                    <p className="text-sm text-slate-400 mb-3">{question.points} ball</p>
                  </div>
                </div>

                <div className="ml-11 space-y-2">
                  {question.options?.map((option) => {
                    const isUserAnswer = question.user_answer?.includes(option.id);
                    const isCorrectAnswer = question.correct_answer?.includes(option.id);
                    let className = 'p-2 rounded border-2 ';

                    if (isCorrectAnswer) {
                      className += 'border-green-500 bg-green-500/20 text-green-300';
                    } else if (isUserAnswer && !isCorrectAnswer) {
                      className += 'border-red-500 bg-red-500/20 text-red-300';
                    } else {
                      className += 'border-slate-700 text-slate-400';
                    }

                    return (
                      <div key={option.id} className={className}>
                        <div className="flex items-center gap-2">
                          {isCorrectAnswer && (
                            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                          )}
                          <span>{option.option_text}</span>
                          {isCorrectAnswer && (
                            <span className="ml-auto text-xs text-green-400">(To'g'ri javob)</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

