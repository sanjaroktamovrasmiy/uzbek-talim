import { CreditCard } from 'lucide-react';

export function PaymentsPage() {
  return (
    <div className="py-12">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">To'lovlar</h1>

        {/* Empty state */}
        <div className="card text-center py-12">
          <CreditCard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">To'lovlar yo'q</h2>
          <p className="text-slate-400">
            Hozircha to'lovlar tarixi mavjud emas
          </p>
        </div>
      </div>
    </div>
  );
}

