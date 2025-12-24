import { Calendar, Clock } from 'lucide-react';

export function SchedulePage() {
  return (
    <div className="py-12">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">Dars jadvali</h1>

        {/* Empty state */}
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Jadval bo'sh</h2>
          <p className="text-slate-400">
            Kursga yozilganingizdan so'ng dars jadvali bu yerda ko'rinadi
          </p>
        </div>
      </div>
    </div>
  );
}

