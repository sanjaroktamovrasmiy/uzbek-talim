import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export function CreateTestPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    // Qo'shimcha sozlamalar
    randomize_questions: false,
    show_hints: false,
    allow_skip: false,
    show_results_immediately: true,
  });
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (user?.role !== 'teacher' && user?.role !== 'admin' && user?.role !== 'super_admin') {
      navigate('/dashboard');
      return;
    }
    
    loadCourses();
    
    // Load cached data from localStorage only on mount
    if (!isInitialized) {
      try {
        const cachedFormData = localStorage.getItem('create_test_form_data');
        const cachedQuestions = localStorage.getItem('create_test_questions');
        
        if (cachedFormData) {
          try {
            const data = JSON.parse(cachedFormData);
            setFormData(prev => ({ ...prev, ...data }));
          } catch (e) {
            console.error('Error parsing cached form data:', e);
          }
        }
        
        if (cachedQuestions) {
          try {
            const parsed = JSON.parse(cachedQuestions);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setQuestions(parsed);
            }
          } catch (e) {
            console.error('Error parsing cached questions:', e);
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading cached data:', error);
        setIsInitialized(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const loadCourses = async () => {
    try {
      const response = await coursesApi.getAll({ page: 1, size: 100 });
      setCourses(response.items || []);
    } catch (error: any) {
      toast.error('Kurslarni yuklashda xatolik');
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

      // Prepare questions data
      const questionsData = questions.map((q, idx) => ({
        question_text: q.question_text,
        question_type: q.question_type,
        points: q.points,
        order_index: idx,
        options: q.question_type === 'text' ? [] : q.options.map((o, optIdx) => ({
          option_text: o.option_text,
          is_correct: o.is_correct,
          order_index: optIdx,
        })),
      }));

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
        questions: questionsData,
      };

      // Include course_id for course_test type (required by backend)
      // Backend requires course_id when test_type is 'course_test'
      console.log('Checking course_id - test_type:', formData.test_type);
      console.log('Checking course_id - formData.course_id:', formData.course_id);
      
      if (formData.test_type === 'course_test') {
        const courseId = formData.course_id?.trim();
        console.log('course_test type detected, courseId:', courseId);
        
        if (!courseId) {
          console.error('course_id is missing for course_test type');
          toast.error('Kursni tanlang');
          setLoading(false);
          return;
        }
        
        requestData.course_id = courseId;
        console.log('course_id added to requestData:', requestData.course_id);
      } else {
        console.log('Not course_test type, skipping course_id');
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

      // Final validation before sending
      if (formData.test_type === 'course_test' && !requestData.course_id) {
        console.error('FINAL CHECK FAILED: course_id missing in requestData!');
        console.error('requestData:', requestData);
        toast.error('Xatolik: Kurs ID topilmadi. Iltimos, qaytadan urinib ko\'ring.');
        setLoading(false);
        return;
      }

      // Debug: Log request data before sending
      console.log('=== SENDING TEST CREATION REQUEST ===');
      console.log('Test type:', formData.test_type);
      console.log('Course ID from form:', formData.course_id);
      console.log('Course ID in requestData:', requestData.course_id);
      console.log('Full request data:', JSON.stringify(requestData, null, 2));
      console.log('=====================================');

      await testsApi.createTest(requestData);
      
      // Clear cache after successful creation
      localStorage.removeItem('create_test_form_data');
      localStorage.removeItem('create_test_questions');
      
      toast.success('Test muvaffaqiyatli yaratildi');
      
      // Navigate after a short delay to ensure toast is visible
      setTimeout(() => {
        navigate('/teacher/tests', { replace: true });
      }, 100);
    } catch (error: any) {
      console.error('=== ERROR CREATING TEST ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Request data that was sent:', requestData);
      console.error('===========================');
      
      // More detailed error message - show all validation errors clearly
      let errorMessage = 'Test yaratishda xatolik yuz berdi';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        console.log('Error data detail:', errorData.detail);
        
        // Handle Pydantic validation errors (array format)
        if (Array.isArray(errorData.detail)) {
          const errorMessages = errorData.detail.map((err: any) => {
            const field = err.loc?.join('.') || 'Noma\'lum maydon';
            const message = err.msg || 'Validatsiya xatosi';
            const type = err.type || '';
            return `• ${field}: ${message}${type ? ` (${type})` : ''}`;
          });
          errorMessage = 'Validatsiya xatolari:\n' + errorMessages.join('\n');
        } 
        // Handle single detail string
        else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        }
        // Handle detail object
        else if (errorData.detail && typeof errorData.detail === 'object') {
          errorMessage = JSON.stringify(errorData.detail, null, 2);
        }
        // Handle message field
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show error with longer duration to read and better formatting
      toast.error(errorMessage, { 
        duration: 10000,
        style: {
          whiteSpace: 'pre-line',
          maxWidth: '600px',
          fontSize: '14px',
          padding: '16px'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Cache form data to localStorage (debounced) - only after initialization
  useEffect(() => {
    if (!isInitialized) return;

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('create_test_form_data', JSON.stringify(formData));
      } catch (error) {
        console.error('Error saving form data to cache:', error);
      }
    }, 500); // Debounce: save after 500ms of no changes

    return () => clearTimeout(timeoutId);
  }, [formData, isInitialized]);

  // Cache questions to localStorage (debounced) - only after initialization
  useEffect(() => {
    if (!isInitialized) return;

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('create_test_questions', JSON.stringify(questions));
      } catch (error) {
        console.error('Error saving questions to cache:', error);
      }
    }, 500); // Debounce: save after 500ms of no changes

    return () => clearTimeout(timeoutId);
  }, [questions, isInitialized]);

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

  // Savollar boshqaruvi
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
            // Single choice uchun boshqa variantlarni no-to'g'ri qilish
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

  return (
    <div className="py-8 md:py-12">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/teacher/tests')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Orqaga
          </button>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Yangi test yaratish</h1>
          <p className="text-slate-400">Yangi test ma'lumotlarini kiriting</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
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
                <p className="text-xs text-slate-400 mt-1">
                  {formData.test_type === 'course_test' 
                    ? 'Test kursga bog\'liq bo\'ladi'
                    : 'Test kursdan mustaqil bo\'ladi'}
                </p>
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
              <p className="text-xs text-slate-400 mt-1">
                {formData.scoring_model === 'simple' 
                  ? 'Oddiy: Har bir to\'g\'ri javob bir ball'
                  : formData.scoring_model === 'weighted'
                  ? 'Vaznli: Har bir savolning baliga qarab hisoblanadi'
                  : 'IRT modellari: Qiyinlik darajasiga qarab ball beradi'}
              </p>
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
                  <p className="text-xs text-slate-400">Har bir o'quvchi uchun savollar turli tartibda ko'rsatiladi</p>
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
                  <p className="text-xs text-slate-400">O'quvchilar savollar uchun ko'rsatmalarni ko'rishlari mumkin</p>
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
                  <p className="text-xs text-slate-400">O'quvchilar javob bermasdan keyingi savolga o'tishlari mumkin</p>
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
                  <p className="text-xs text-slate-400">Test yakunlangandan so'ng natijalar darhol ko'rsatiladi</p>
                </div>
              </label>
            </div>
          </div>

          {/* Access Key - faqat kerakli test turlari uchun */}
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
                <p className="text-xs text-slate-400 mt-1">
                  Faqat bu kalitga ega bo'lgan o'quvchilar testni ishlashlari mumkin. Kalitni bo'sh qoldirsangiz, avtomatik yaratiladi.
                </p>
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

          {/* Questions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Savollar ({questions.length})</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Savol qo'shish
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-lg">
                <p className="text-slate-400 mb-4">Hozircha savollar yo'q</p>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Birinchi savolni qo'shish
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question, qIndex) => (
                  <div key={question.id} className="border border-slate-700 rounded-lg p-4 bg-slate-800/50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <GripVertical className="w-5 h-5" />
                        <span className="font-medium">Savol {qIndex + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Question Text */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Savol matni <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          value={question.question_text}
                          onChange={(e) => updateQuestion(question.id, 'question_text', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Savol matnini kiriting..."
                        />
                      </div>

                      {/* Question Type and Points */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Savol turi</label>
                          <select
                            value={question.question_type}
                            onChange={(e) => updateQuestion(question.id, 'question_type', e.target.value)}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="single_choice">Bitta tanlov</option>
                            <option value="multiple_choice">Ko'p tanlov</option>
                            <option value="text">Matnli javob</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Ball</label>
                          <input
                            type="number"
                            value={question.points}
                            onChange={(e) => updateQuestion(question.id, 'points', Number(e.target.value) || 1)}
                            min="1"
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      {/* Options (if not text type) */}
                      {question.question_type !== 'text' && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium">
                              Variantlar <span className="text-red-400">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => addOption(question.id)}
                              className="text-sm text-primary-400 hover:text-primary-300 inline-flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              Variant qo'shish
                            </button>
                          </div>

                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div key={option.id} className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg border border-slate-700">
                                <input
                                  type={question.question_type === 'multiple_choice' ? 'checkbox' : 'radio'}
                                  checked={option.is_correct}
                                  onChange={() => toggleCorrectOption(question.id, option.id)}
                                  className="w-5 h-5 text-primary-500 bg-slate-800 border-slate-600 focus:ring-primary-500"
                                />
                                <input
                                  type="text"
                                  value={option.option_text}
                                  onChange={(e) => updateOption(question.id, option.id, 'option_text', e.target.value)}
                                  placeholder={`Variant ${optIndex + 1}...`}
                                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                {question.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeOption(question.id, option.id)}
                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                  >
                                    <X className="w-4 h-4 text-red-400" />
                                  </button>
                                )}
                                {option.is_correct && (
                                  <span className="text-xs text-green-400 font-medium">To'g'ri</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  Yaratilmoqda...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Testni yaratish
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

