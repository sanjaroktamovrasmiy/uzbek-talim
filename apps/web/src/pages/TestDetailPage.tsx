import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  Loader2,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { testsApi } from '@/services/api';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  points: number;
  order_index: number;
  options?: Array<{
    id: string;
    option_text: string;
    is_correct: boolean;
    order_index: number;
  }>;
}

interface Test {
  id: string;
  title: string;
  description?: string;
  course_id?: string;
  course_name?: string;
  test_type: string;
  duration: number;
  max_score: number;
  passing_score: number;
  scoring_model: string;
  questions: Question[];
}

export function TestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const [, setStartedAt] = useState<Date | null>(null);
  const [accessKey, setAccessKey] = useState<string>('');
  const [showAccessKeyModal, setShowAccessKeyModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitTest = useCallback(async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await testsApi.submitTest(id, answers);
      
      // Clear test session from localStorage
      const testSessionKey = `test_session_${id}`;
      localStorage.removeItem(testSessionKey);
      
      toast.success('Test muvaffaqiyatli yuborildi!');
      navigate(`/tests/${id}/results`);
    } catch (error: any) {
      console.error('Error submitting test:', error);
      toast.error(error.response?.data?.detail || 'Testni yuborishda xatolik');
    } finally {
      setIsSubmitting(false);
    }
  }, [id, answers, navigate]);

  const loadTest = useCallback(async (providedAccessKey?: string) => {
    if (!id) {
      console.error('TestDetailPage: No ID provided');
      setIsLoading(false);
      return;
    }
    
    console.log('TestDetailPage: loadTest called with id:', id, 'accessKey:', providedAccessKey);
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await testsApi.getTest(id, providedAccessKey);
      console.log('TestDetailPage: Test loaded successfully:', data);
      
      if (!data || !data.id) {
        console.error('TestDetailPage: Invalid test data received:', data);
        setError('Test ma\'lumotlari noto\'g\'ri');
        setTest(null);
      } else {
        setTest(data);
        setShowAccessKeyModal(false);
      }
    } catch (error: any) {
      console.error('TestDetailPage: Error loading test:', error);
      console.error('TestDetailPage: Error response:', error.response?.data);
      console.error('TestDetailPage: Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.detail || error.message || 'Testni yuklashda xatolik';
      
      // If error is about access key, show modal
      if (errorMessage.toLowerCase().includes('access key') || 
          errorMessage.toLowerCase().includes('kalit') ||
          errorMessage.toLowerCase().includes('invalid access')) {
        setShowAccessKeyModal(true);
        setError('Test kirish kaliti talab qilinadi');
      } else {
        setError(errorMessage);
        setTest(null);
        toast.error(errorMessage, { duration: 5000 });
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Load test on mount
  useEffect(() => {
    console.log('TestDetailPage: Component mounted, id:', id);
    
    if (!id) {
      console.error('TestDetailPage: No ID in URL params');
      setError('Test ID topilmadi');
      setIsLoading(false);
      return;
    }

    // Check if test was already started (from localStorage)
    const testSessionKey = `test_session_${id}`;
    const savedSession = localStorage.getItem(testSessionKey);
    
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const startedAt = new Date(session.startedAt);
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
        const totalSeconds = session.duration * 60;
        const remaining = totalSeconds - elapsedSeconds;
        
        if (remaining > 0) {
          console.log('TestDetailPage: Resuming test session, remaining time:', remaining);
          setTestStarted(true);
          setStartedAt(startedAt);
          setTimeRemaining(remaining);
        } else {
          console.log('TestDetailPage: Test session expired');
          localStorage.removeItem(testSessionKey);
        }
      } catch (e) {
        console.error('TestDetailPage: Error loading test session:', e);
        localStorage.removeItem(testSessionKey);
      }
    }
    
    // Load test data
    loadTest();
  }, [id, loadTest]);

  // Timer effect
  useEffect(() => {
    if (testStarted && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            if (id) {
              toast('Vaqt tugadi! Javoblar avtomatik yuborilmoqda...', { icon: '⏱️' });
              submitTest();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testStarted, timeRemaining, id, submitTest]);

  const handleAccessKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey.trim()) {
      loadTest(accessKey.trim());
    }
  };

  const handleStartTest = async () => {
    if (!id || !test) {
      console.error('TestDetailPage: Cannot start test - missing id or test data');
      return;
    }
    
    setIsStarting(true);
    try {
      console.log('TestDetailPage: Starting test:', id);
      const data = await testsApi.startTest(id);
      console.log('TestDetailPage: Test start response:', data);
      
      const startedAtTime = new Date();
      const testData = (data && data.id) ? data : test;
      const duration = testData.duration ? testData.duration * 60 : null;
      
      console.log('TestDetailPage: Setting test started, duration:', duration);
      
      // Update test data first
      if (data && data.id) {
        console.log('TestDetailPage: Updating test data from response');
        setTest(data);
      }
      
      // Set test as started
      setTestStarted(true);
      setStartedAt(startedAtTime);
      setTimeRemaining(duration);
      
      // Save to localStorage
      if (duration !== null && testData.duration) {
        const testSessionKey = `test_session_${id}`;
        localStorage.setItem(testSessionKey, JSON.stringify({
          startedAt: startedAtTime.toISOString(),
          duration: testData.duration,
        }));
        console.log('TestDetailPage: Test session saved to localStorage');
      }
      
      toast.success('Test boshlandi!');
    } catch (error: any) {
      console.error('TestDetailPage: Error starting test:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Testni boshlashda xatolik';
      toast.error(errorMessage);
      
      // If error says test already started, load the test session
      if (errorMessage.includes('already started') || errorMessage.includes('уже начат')) {
        const testSessionKey = `test_session_${id}`;
        const savedSession = localStorage.getItem(testSessionKey);
        if (savedSession) {
          try {
            const session = JSON.parse(savedSession);
            const startedAt = new Date(session.startedAt);
            const now = new Date();
            const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
            const totalSeconds = session.duration * 60;
            const remaining = totalSeconds - elapsedSeconds;
            
            if (remaining > 0) {
              setTestStarted(true);
              setStartedAt(startedAt);
              setTimeRemaining(remaining);
              toast.success('Test davom etmoqda');
            }
          } catch (e) {
            console.error('TestDetailPage: Error loading test session:', e);
          }
        }
      }
    } finally {
      setIsStarting(false);
    }
  };

  const handleAnswerChange = (questionId: string, optionId: string, isMultiple: boolean) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...current, optionId] };
        }
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: text.trim() ? [text] : [],
    }));
  };

  const handleSubmit = async () => {
    if (!id || !test) return;
    
    const unanswered = test.questions.filter(
      (q) => !answers[q.id] || answers[q.id].length === 0
    );
    
    if (unanswered.length > 0) {
      const confirm = window.confirm(
        `${unanswered.length} ta savolga javob berilmagan. Yuborishni davom ettirasizmi?`
      );
      if (!confirm) return;
    }

    await submitTest();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (isLoading && !showAccessKeyModal) {
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

  // Access key modal
  if (showAccessKeyModal || (error && (error.includes('access key') || error.includes('kalit')))) {
    return (
      <div className="py-8 md:py-12">
        <div className="container-custom">
          <div className="max-w-md mx-auto">
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Test kirish kaliti</h2>
              <p className="text-slate-300 mb-6">
                Bu test kirish kaliti talab qiladi. Iltimos, kalitni kiriting.
              </p>
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              <form onSubmit={handleAccessKeySubmit}>
                <div className="mb-4">
                  <label htmlFor="accessKey" className="block text-sm font-medium text-slate-300 mb-2">
                    Kirish kaliti
                  </label>
                  <input
                    id="accessKey"
                    type="text"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Kirish kalitini kiriting"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={!accessKey.trim() || isLoading}
                    className="btn-primary flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Yuklanmoqda...
                      </>
                    ) : (
                      'Kirish'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/tests')}
                    className="btn-secondary"
                  >
                    Bekor qilish
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state - no test found
  if (!test) {
    return (
      <div className="py-8 md:py-12">
        <div className="container-custom">
          <div className="card text-center py-12">
            <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Test topilmadi</h3>
            {error && (
              <p className="text-red-400 mb-4">{error}</p>
            )}
            <Link to="/tests" className="btn-primary inline-flex items-center gap-2 mt-4">
              <ArrowLeft className="w-4 h-4" />
              Testlar ro'yxatiga qaytish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Test not started - show test info and start button
  if (!testStarted) {
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

          <div className="max-w-2xl mx-auto">
            <div className="card">
              <h1 className="text-3xl font-bold mb-4">{test.title}</h1>
              {test.description && (
                <p className="text-slate-300 mb-6">{test.description}</p>
              )}

              <div className="space-y-4 mb-8">
                {test.course_name && (
                  <div className="flex items-center gap-3 text-slate-300">
                    <span className="font-medium">Kurs:</span>
                    <span>{test.course_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-slate-300">
                  <span className="font-medium">Test turi:</span>
                  <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-sm rounded-full">
                    {test.test_type === 'course_test' ? 'Kurs testi' :
                     test.test_type === 'public_test' ? 'Ommaviy test' :
                     test.test_type === 'mock_test' ? 'Mock test' :
                     test.test_type === 'sat_mock' ? 'SAT Mock' :
                     test.test_type === 'entrance_test' ? 'Kirish testi' :
                     test.test_type === 'placement_test' ? 'Joylashtirish testi' :
                     test.test_type === 'diagnostic_test' ? 'Diagnostika testi' :
                     test.test_type === 'practice_test' ? 'Amaliy test' : test.test_type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Vaqt:</span>
                  <span>{test.duration} daqiqa</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <span className="font-medium">Jami ball:</span>
                  <span>{test.max_score}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <span className="font-medium">O'tish balli:</span>
                  <span>{test.passing_score}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <span className="font-medium">Savollar soni:</span>
                  <span>{test.questions?.length || 0}</span>
                </div>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
                <p className="text-yellow-400 text-sm">
                  <strong>Eslatma:</strong> Testni boshlaganingizdan so'ng, vaqt tugaguncha yoki javoblarni yuborguncha testni tark etib bo'lmaydi.
                </p>
              </div>

              <button
                onClick={handleStartTest}
                disabled={isStarting}
                className="btn-primary w-full inline-flex items-center justify-center gap-2"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Boshlanmoqda...
                  </>
                ) : (
                  <>
                    Testni boshlash
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Test started - show questions
  return (
    <div className="py-8 md:py-12">
      <div className="container-custom">
        {/* Header with timer */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{test.title}</h1>
              {test.course_name && (
                <p className="text-slate-400">{test.course_name}</p>
              )}
            </div>
            {timeRemaining !== null && (
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="w-5 h-5" />
                <span className={timeRemaining <= 300 ? 'text-red-400' : 'text-primary-400'}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {test.questions?.map((question, index) => (
            <div key={question.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  {index + 1}. {question.question_text}
                </h3>
                <span className="text-sm text-slate-400">
                  {question.points} ball
                </span>
              </div>

              {question.question_type === 'text' ? (
                <div>
                  <textarea
                    value={answers[question.id]?.[0] || ''}
                    onChange={(e) => handleTextAnswerChange(question.id, e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={4}
                    placeholder="Javobingizni kiriting..."
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {question.options?.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        answers[question.id]?.includes(option.id)
                          ? 'bg-primary-500/20 border border-primary-500/50'
                          : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type={question.question_type === 'multiple_choice' ? 'checkbox' : 'radio'}
                        checked={answers[question.id]?.includes(option.id) || false}
                        onChange={() =>
                          handleAnswerChange(
                            question.id,
                            option.id,
                            question.question_type === 'multiple_choice'
                          )
                        }
                        className="w-4 h-4 text-primary-500"
                      />
                      <span className="flex-1">{option.option_text}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit button */}
        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary w-full inline-flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Yuborilmoqda...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Testni yuborish
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
