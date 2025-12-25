import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle,
  BookOpen,
  Calendar,
  Receipt,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

type PaymentStatus = 'paid' | 'pending' | 'overdue';

interface Payment {
  id: string;
  course_name: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: PaymentStatus;
}

// Placeholder to'lovlar (haqiqiy ma'lumotlar API'dan keladi)
const payments: Payment[] = [];

const getStatusConfig = (status: PaymentStatus) => {
  switch (status) {
    case 'paid':
      return { 
        icon: CheckCircle2, 
        label: "To'langan", 
        color: 'bg-green-500/20 text-green-400',
        iconColor: 'text-green-400'
      };
    case 'pending':
      return { 
        icon: Clock, 
        label: 'Kutilmoqda', 
        color: 'bg-yellow-500/20 text-yellow-400',
        iconColor: 'text-yellow-400'
      };
    case 'overdue':
      return { 
        icon: XCircle, 
        label: "Muddati o'tgan", 
        color: 'bg-red-500/20 text-red-400',
        iconColor: 'text-red-400'
      };
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount) + " so'm";
};

export function PaymentsPage() {
  const [filter, setFilter] = useState<'all' | PaymentStatus>('all');

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(p => p.status === filter);

  // Hisob-kitob
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="py-8 md:py-12">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">To'lovlar</h1>
          
          {payments.length > 0 && (
            <button className="btn-secondary">
              <Download className="w-4 h-4" />
              Hisobotni yuklab olish
            </button>
          )}
        </div>

        {payments.length > 0 ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="card bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">To'langan</p>
                    <p className="text-lg font-bold text-green-400">{formatCurrency(totalPaid)}</p>
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Kutilmoqda</p>
                    <p className="text-lg font-bold text-yellow-400">{formatCurrency(totalPending)}</p>
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Muddati o'tgan</p>
                    <p className="text-lg font-bold text-red-400">{formatCurrency(totalOverdue)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {[
                { value: 'all', label: 'Barchasi' },
                { value: 'paid', label: "To'langan" },
                { value: 'pending', label: 'Kutilmoqda' },
                { value: 'overdue', label: "Muddati o'tgan" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === option.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Payments List */}
            <div className="space-y-4">
              {filteredPayments.map((payment) => {
                const statusConfig = getStatusConfig(payment.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div key={payment.id} className="card-hover">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        payment.status === 'paid' ? 'bg-green-500/20' :
                        payment.status === 'pending' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                      }`}>
                        <Receipt className={`w-6 h-6 ${statusConfig.iconColor}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{payment.course_name}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            Muddat: {payment.due_date}
                          </span>
                          {payment.paid_date && (
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                              To'langan: {payment.paid_date}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Amount & Status */}
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold">{formatCurrency(payment.amount)}</span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* Pay Button */}
                      {payment.status !== 'paid' && (
                        <button className="btn-primary whitespace-nowrap">
                          <CreditCard className="w-4 h-4" />
                          To'lash
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredPayments.length === 0 && (
              <div className="card text-center py-8">
                <p className="text-slate-400">Bu filtr bo'yicha to'lovlar topilmadi</p>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="card text-center py-12">
            <CreditCard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">To'lovlar yo'q</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Hozircha to'lovlar tarixi mavjud emas. Kursga yozilganingizdan so'ng to'lov ma'lumotlari bu yerda ko'rinadi.
            </p>
            <Link to="/courses" className="btn-primary inline-flex">
              <BookOpen className="w-5 h-5" />
              Kurslarni ko'rish
            </Link>
          </div>
        )}

        {/* Payment Info */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h3 className="font-semibold mb-4">To'lov usullari</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card bg-slate-800/50">
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-primary-400" />
                <div>
                  <p className="font-medium">Bank kartasi</p>
                  <p className="text-sm text-slate-400">Visa, MasterCard, UzCard</p>
                </div>
              </div>
            </div>
            <div className="card bg-slate-800/50">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <div>
                  <p className="font-medium">Click / Payme</p>
                  <p className="text-sm text-slate-400">Onlayn to'lov</p>
                </div>
              </div>
            </div>
            <div className="card bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Receipt className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="font-medium">Naqd pul</p>
                  <p className="text-sm text-slate-400">Ofisda to'lash</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
