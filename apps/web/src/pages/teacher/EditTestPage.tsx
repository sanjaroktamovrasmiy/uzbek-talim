import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Plus, X, GripVertical, Trash2 } from 'lucide-react';
import { testsApi, coursesApi } from '@/services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

interface Course {
  id: string;
  name: string;
}

interface QuestionOption {
  id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

interface Question {
  id: string;
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'text';
  points: number;
  order_index: number;
  options: QuestionOption[];
}

export function EditTestPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingTest, setLoadingTest] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    course_id: '',
    test_type: 'course_test',
    title: '',
    description: '',
    duration: 30,
    max_score: 100,
    passing_score: 60,
    is_active: true,
    available_from: '',
    available_until: '',
    access_key: '',
    scoring_model: 'simple',
    randomize_questions: false,
    show_hints: false,
    allow_skip: false,
    show_results_immediately: true,
  });
  
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (user?.role !== 'teacher' && user?.role !== 'admin' && user?.role !== 'super_admin') {
      navigate('/dashboard');
      return;
    }
    
    loadCourses();
    if (id) {
      loadTest(id);
    }
  }, [user, navigate, id]);

  const loadCourses = async () => {
    try {
      const response = await coursesApi.getAll({ page: 1, size: 100 });
      setCourses(response.items || []);
    } catch (error: any) {
      toast.error('Kurslarni yuklashda xatolik');
    }
  };

  const loadTest = async (testId: string) => {
    try {
      setLoadingTest(true);
      const test = await testsApi.getTest(testId);
      
      // Convert datetime strings to datetime-local format
      const formatDateTimeLocal = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        course_id: test.course_id || '',
        test_type: test.test_type || 'course_test',
        title: test.title || '',
        description: test.description || '',
        duration: test.duration || 30,
        max_score: test.max_score || 100,
        passing_score: test.passing_score || 60,
        is_active: test.is_active ?? true,
        available_from: formatDateTimeLocal(test.available_from),
        available_until: formatDateTimeLocal(test.available_until),
        access_key: test.access_key || '',
        scoring_model: test.scoring_model || 'simple',
        randomize_questions: test.test_config?.randomize_questions || false,
        show_hints: test.test_config?.show_hints || false,
        allow_skip: test.test_config?.allow_skip || false,
        show_results_immediately: test.test_config?.show_results_immediately ?? true,
      });

      // Load questions
      if (test.questions && Array.isArray(test.questions)) {
        const loadedQuestions: Question[] = test.questions.map((q: any) => ({
          id: q.id || `q-${Date.now()}-${Math.random()}`,
          question_text: q.question_text || '',
          question_type: q.question_type || 'single_choice',
          points: q.points || 1,
          order_index: q.order_index || 0,
          options: (q.options || []).map((opt: any, idx: number) => ({
            id: opt.id || `opt-${Date.now()}-${idx}`,
            option_text: opt.option_text || '',
            is_correct: opt.is_correct || false,
            order_index: opt.order_index || idx,
          })),
        }));
        setQuestions(loadedQuestions);
      }
    } catch (error: any) {
      console.error('Error loading test:', error);
      toast.error(error.response?.data?.detail || 'Testni yuklashda xatolik');
      navigate('/teacher/tests');
    } finally {
      setLoadingTest(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate course_id for course_test type - strict validation
    if (formData.test_type === 'course_test') {
      const courseId = formData.course_id?.trim();
      if (!courseId || courseId === '') {
        console.error('Validation failed: course_id is required for course_test type');
        console.error('Current course_id value:', formData.course_id);
        toast.error('Kursni tanlang');
        return;
      }
      console.log('Validation passed: course_id =', courseId);
    }

    if (!formData.title.trim()) {
      toast.error('Test nomini kiriting');
      return;
    }

    // Savollarni tekshirish
    if (questions.length === 0) {
      toast.error('Kamida bitta savol qo\'shing');
      return;
    }

    // Har bir savolni tekshirish
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        toast.error(`${i + 1}-savol matni bo'sh bo'lmasligi kerak`);
        return;
      }
      if (q.question_type !== 'text' && q.options.length < 2) {
        toast.error(`${i + 1}-savol kamida 2 ta variant bo'lishi kerak`);
        return;
      }
      if (q.question_type !== 'text') {
        const hasCorrect = q.options.some(o => o.is_correct);
        if (!hasCorrect) {
          toast.error(`${i + 1}-savol uchun kamida bitta to'g'ri javob belgilang`);
          return;
        }
        for (let j = 0; j < q.options.length; j++) {
          if (!q.options[j].option_text.trim()) {
            toast.error(`${i + 1}-savol, ${j + 1}-variant matni bo'sh bo'lmasligi kerak`);
            return;
          }
        }
      }
    }

    // Prepare request data outside try block so it's accessible in catch
    let requestData: any = null;
    
    try {
      setLoading(true);
      
      // Build test_config from simple settings
      const testConfig: Record<string, any> = {
        randomize_questions: formData.randomize_questions,
        show_hints: formData.show_hints,
        allow_skip: formData.allow_skip,
        show_results_immediately: formData.show_results_immediately,
      };

      // Prepare request data, ensuring empty strings are converted to undefined
      requestData = {
        test_type: formData.test_type,
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        duration: formData.duration,
        max_score: formData.max_score,
        passing_score: formData.passing_score,
        is_active: formData.is_active,
        scoring_model: formData.scoring_model,
        test_config: testConfig,
      };

      // Include course_id for course_test type (required by backend)
      if (formData.test_type === 'course_test') {
        const courseId = formData.course_id?.trim();
        if (!courseId || courseId === '') {
          console.error('CRITICAL: course_id is missing after validation passed!');
          toast.error('Xatolik: Kursni tanlang');
          setLoading(false);
          return;
        }
        requestData.course_id = courseId;
      }

      // Handle optional datetime fields - convert empty strings to undefined
      if (formData.available_from?.trim()) {
        requestData.available_from = formData.available_from;
      }
      if (formData.available_until?.trim()) {
        requestData.available_until = formData.available_until;
      }

      // Handle access_key - only include if it has a valid value (min 4 chars)
      if (formData.access_key?.trim() && formData.access_key.trim().length >= 4) {
        requestData.access_key = formData.access_key.trim();
      }

      console.log('Updating test with data:', JSON.stringify(requestData, null, 2));

      // Update test (without questions - questions are managed separately via addQuestion/deleteQuestion)
      if (!id) {
        toast.error('Test ID topilmadi');
        return;
      }

      await testsApi.updateTest(id, requestData);
      
      toast.success('Test muvaffaqiyatli yangilandi');
      
      setTimeout(() => {
        navigate('/teacher/tests', { replace: true });
      }, 100);
    } catch (error: any) {
      console.error('Error updating test:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Test yangilashda xatolik';
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // If test_type changes, clear course_id if not course_test
    if (name === 'test_type' && value !== 'course_test') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        course_id: '', // Clear course_id when switching to non-course_test type
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked
          : name === 'duration' || name === 'max_score' || name === 'passing_score'
          ? Number(value) || 0
          : value,
      }));
    }
  };

  // Question management functions (same as CreateTestPage)
  const addQuestion = () => {
    const newQuestion: Question = {
      id: `temp-${Date.now()}-${Math.random()}`,
      question_text: '',
      question_type: 'single_choice',
      points: 1,
      order_index: questions.length,
      options: [
        { id: `opt-${Date.now()}-1`, option_text: '', is_correct: false, order_index: 0 },
        { id: `opt-${Date.now()}-2`, option_text: '', is_correct: false, order_index: 1 },
      ],
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId).map((q, idx) => ({
      ...q,
      order_index: idx,
    })));
  };

  const updateQuestion = (questionId: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOption: QuestionOption = {
          id: `opt-${Date.now()}-${Math.random()}`,
          option_text: '',
          is_correct: false,
          order_index: q.options.length,
        };
        return { ...q, options: [...q.options, newOption] };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const filtered = q.options.filter(o => o.id !== optionId);
        return {
          ...q,
          options: filtered.map((o, idx) => ({ ...o, order_index: idx })),
        };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionId: string, field: keyof QuestionOption, value: any) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(o => 
            o.id === optionId ? { ...o, [field]: value } : o
          ),
        };
      }
      return q;
    }));
  };

  const toggleCorrectOption = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const isMultiple = q.question_type === 'multiple_choice';
        return {
          ...q,
          options: q.options.map(o => {
            if (o.id === optionId) {
              return { ...o, is_correct: !o.is_correct };
            }
            if (!isMultiple && o.is_correct) {
              return { ...o, is_correct: false };
            }
            return o;
          }),
        };
      }
      return q;
    }));
  };

  if (loadingTest) {
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

  // Use the same form structure as CreateTestPage but with "Yangilash" button
  // For brevity, I'll import and reuse most of the form JSX from CreateTestPage structure
  // But since we can't directly import JSX, I'll need to replicate it
  
  return (
    <div className="py-8 md:py-12">
      <div className="container-custom max-w-4xl">
        <div className="mb-8">
          <button
            onClick={() => navigate('/teacher/tests')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Orqaga
          </button>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Testni tahrirlash</h1>
          <p className="text-slate-400">Test ma'lumotlarini yangilang</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info - Same structure as CreateTestPage */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Asosiy ma'lumotlar</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Test turi <span className="text-red-400">*</span>
                </label>
                <select
                  name="test_type"
                  value={formData.test_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="course_test">Kurs testi</option>
                  <option value="public_test">Ommaviy test</option>
                  <option value="mock_test">Mock test</option>
                  <option value="sat_mock">SAT Mock test</option>
                  <option value="entrance_test">Kirish testi</option>
                  <option value="placement_test">Joylashtirish testi</option>
                  <option value="diagnostic_test">Diagnostika testi</option>
                  <option value="practice_test">Amaliy test</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Kurs {formData.test_type === 'course_test' && <span className="text-red-400">*</span>}
                </label>
                <select
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleChange}
                  required={formData.test_type === 'course_test'}
                  disabled={formData.test_type !== 'course_test'}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Kursni tanlang</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Test nomi <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Masalan: 1-dars testi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tavsif</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Test haqida qisqa ma'lumot"
                />
              </div>
            </div>
          </div>

          {/* Test Settings */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Test sozlamalari</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Davomiyligi (daqiqa)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  max="300"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Maksimal ball</label>
                <input
                  type="number"
                  name="max_score"
                  value={formData.max_score}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">O'tish balli</label>
                <input
                  type="number"
                  name="passing_score"
                  value={formData.passing_score}
                  onChange={handleChange}
                  min="0"
                  max={formData.max_score}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Hisoblash modeli</label>
              <select
                name="scoring_model"
                value={formData.scoring_model}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="simple">Oddiy (to'g'ri javoblar soni)</option>
                <option value="weighted">Vaznli (savol baliga qarab)</option>
                <option value="rasch">Rasch modeli (IRT)</option>
                <option value="two_pl">2PL IRT</option>
                <option value="three_pl">3PL IRT</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-primary-500 focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm">Test faol</span>
              </label>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Qo'shimcha sozlamalar</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="randomize_questions"
                  checked={formData.randomize_questions}
                  onChange={handleChange}
                  className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-primary-500 focus:ring-2 focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium">Savollar tartibini aralashtirish</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="show_hints"
                  checked={formData.show_hints}
                  onChange={handleChange}
                  className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-primary-500 focus:ring-2 focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium">Ko'rsatmalarni ko'rsatish</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="allow_skip"
                  checked={formData.allow_skip}
                  onChange={handleChange}
                  className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-primary-500 focus:ring-2 focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium">Savollarni o'tkazib yuborishga ruxsat</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="show_results_immediately"
                  checked={formData.show_results_immediately}
                  onChange={handleChange}
                  className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-primary-500 focus:ring-2 focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium">Natijalarni darhol ko'rsatish</span>
                </div>
              </label>
            </div>
          </div>

          {/* Access Key */}
          {(formData.test_type === 'mock_test' || 
            formData.test_type === 'sat_mock' || 
            formData.test_type === 'entrance_test' ||
            formData.test_type === 'placement_test') && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Maxsus kirish kaliti</h2>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Access Key (ixtiyoriy)
                </label>
                <input
                  type="text"
                  name="access_key"
                  value={formData.access_key}
                  onChange={handleChange}
                  placeholder="Bo'sh qoldirilsa avtomatik yaratiladi"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Mavjudlik</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Boshlanish sanasi</label>
                <input
                  type="datetime-local"
                  name="available_from"
                  value={formData.available_from}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tugash sanasi</label>
                <input
                  type="datetime-local"
                  name="available_until"
                  value={formData.available_until}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Note about questions */}
          <div className="card bg-blue-500/10 border-blue-500/30">
            <p className="text-sm text-blue-300">
              <strong>Eslatma:</strong> Savollarni tahrirlash funksiyasi keyingi versiyada qo'shiladi. 
              Hozircha faqat test sozlamalarini yangilashingiz mumkin.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/teacher/tests')}
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
                  Testni yangilash
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

