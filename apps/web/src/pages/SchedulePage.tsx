import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  User,
  MapPin
} from 'lucide-react';

// Hafta kunlari
const weekDays = [
  { short: 'Du', full: 'Dushanba' },
  { short: 'Se', full: 'Seshanba' },
  { short: 'Ch', full: 'Chorshanba' },
  { short: 'Pa', full: 'Payshanba' },
  { short: 'Ju', full: 'Juma' },
  { short: 'Sh', full: 'Shanba' },
  { short: 'Ya', full: 'Yakshanba' },
];

// Hozirgi hafta kunlarini olish
const getWeekDates = (weekOffset: number = 0) => {
  const today = new Date();
  const firstDayOfWeek = new Date(today);
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1) + (weekOffset * 7);
  firstDayOfWeek.setDate(diff);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(firstDayOfWeek);
    date.setDate(firstDayOfWeek.getDate() + i);
    return date;
  });
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
};

const isToday = (date: Date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export function SchedulePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const weekDates = getWeekDates(weekOffset);

  // Placeholder darslar (haqiqiy ma'lumotlar API'dan keladi)
  const lessons: any[] = [];

  return (
    <div className="py-8 md:py-12">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Dars jadvali</h1>
          
          {/* Week Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="btn-secondary p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="btn-secondary px-4"
              disabled={weekOffset === 0}
            >
              Bu hafta
            </button>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="btn-secondary p-2"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {weekDays.map((day, index) => {
            const date = weekDates[index];
            const isTodayDate = isToday(date);
            const isSelected = selectedDay === index;

            return (
              <button
                key={day.short}
                onClick={() => setSelectedDay(index)}
                className={`p-3 rounded-xl text-center transition-all ${
                  isSelected
                    ? 'bg-primary-500 text-white'
                    : isTodayDate
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <span className="block text-xs text-slate-400 mb-1">{day.short}</span>
                <span className="block font-semibold">{date.getDate()}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Day Header */}
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-primary-400" />
          <span className="font-medium">
            {weekDays[selectedDay].full}, {formatDate(weekDates[selectedDay])}
          </span>
        </div>

        {/* Schedule Content */}
        {lessons.length > 0 ? (
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <div key={index} className="card-hover">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Time */}
                  <div className="flex items-center gap-2 md:w-32 flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary-400" />
                    <span className="font-mono font-medium">
                      {lesson.start_time} - {lesson.end_time}
                    </span>
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{lesson.course_name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        {lesson.teacher_name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {lesson.room}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="md:text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      lesson.status === 'upcoming'
                        ? 'bg-blue-500/20 text-blue-400'
                        : lesson.status === 'ongoing'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {lesson.status === 'upcoming' ? 'Kelgusi' : 
                       lesson.status === 'ongoing' ? 'Davom etmoqda' : 'Tugagan'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Jadval bo'sh</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Bu kun uchun darslar mavjud emas. Kursga yozilganingizdan so'ng dars jadvali bu yerda ko'rinadi.
            </p>
            <Link to="/courses" className="btn-primary inline-flex">
              <BookOpen className="w-5 h-5" />
              Kurslarni ko'rish
            </Link>
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Belgilar:</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              Kelgusi dars
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              Davom etmoqda
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-500"></span>
              Tugagan
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
