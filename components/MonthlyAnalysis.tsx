
import React, { useState, useMemo } from 'react';
import { Transaction, WalletCategory } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, TrendingUp, TrendingDown, Wallet, BellRing, AlertCircle } from 'lucide-react';
import { LOW_BALANCE_THRESHOLD } from '../constants';

interface MonthlyAnalysisProps {
  transactions: Transaction[];
  wallets: WalletCategory[];
  isDarkMode: boolean;
}

export const MonthlyAnalysis: React.FC<MonthlyAnalysisProps> = ({ transactions, wallets, isDarkMode }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const changeMonth = (offset: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setMonth(nextDate.getMonth() + offset);
    setSelectedDate(nextDate);
  };

  const monthName = selectedDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });

  const lowBalanceWallets = useMemo(() => wallets.filter(w => w.balance < LOW_BALANCE_THRESHOLD), [wallets]);

  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [transactions, year, month]);

  const stats = useMemo(() => {
    const categoryStats: Record<string, { in: number, out: number, name: string }> = {};
    wallets.forEach(w => { categoryStats[w.id] = { in: 0, out: 0, name: w.name }; });
    monthlyTransactions.forEach(t => {
      if (t.categoryId === 'all') {
        wallets.forEach(w => { categoryStats[w.id].in += (t.amount * (w.percentage / 100)); });
      } else if (categoryStats[t.categoryId]) {
        if (t.type === 'withdrawal') categoryStats[t.categoryId].out += t.amount;
        else categoryStats[t.categoryId].in += t.amount;
      }
    });
    return categoryStats;
  }, [monthlyTransactions, wallets]);

  const totalMonthlyIn = Math.round(Object.values(stats).reduce((acc, curr) => acc + curr.in, 0));
  const totalMonthlyOut = Math.round(Object.values(stats).reduce((acc, curr) => acc + curr.out, 0));

  const chartData = Object.entries(stats).map(([id, data]) => ({
    name: data.name,
    "إيداع": Math.round(data.in),
    "سحب": Math.round(data.out)
  }));

  return (
    <div className="animate-in fade-in duration-700 space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">مركز التقارير</h2>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Deep Financial Insights</p>
        </div>
        <div className="flex items-center bg-white dark:bg-[#0c0c0c] p-1 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-slate-400">
            <ChevronRight size={18} />
          </button>
          <div className="px-4 flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-300 min-w-[130px] justify-center">
            <CalendarIcon size={14} className="text-indigo-500" /> {monthName}
          </div>
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-slate-400">
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>

      {lowBalanceWallets.length > 0 && (
        <section className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-5 rounded-[24px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-rose-100 dark:bg-rose-500/20 text-rose-600 rounded-xl flex items-center justify-center">
              <BellRing size={20} />
            </div>
            <div>
              <h3 className="font-bold text-rose-900 dark:text-rose-400 text-sm">تنبيهات حرجة</h3>
              <p className="text-[9px] text-rose-600 opacity-80">محافظ قاربت على النفاد وتحتاج تغذية.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {lowBalanceWallets.map(w => (
              <div key={w.id} className="bg-white dark:bg-black/20 p-3 rounded-xl border border-rose-100 dark:border-rose-500/10 flex items-center justify-between">
                <span className="text-[10px] font-bold dark:text-slate-300">{w.name}</span>
                <AlertCircle size={12} className="text-rose-500" />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#0c0c0c] p-5 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm">
          <p className="text-[8px] text-slate-400 font-bold uppercase mb-2">الدخل الشهري</p>
          <p className="text-xl font-black text-emerald-600">{totalMonthlyIn.toLocaleString()} <span className="text-[9px] font-normal">ج.م</span></p>
        </div>
        <div className="bg-white dark:bg-[#0c0c0c] p-5 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm">
          <p className="text-[8px] text-slate-400 font-bold uppercase mb-2">المصروف الشهري</p>
          <p className="text-xl font-black text-rose-600">{totalMonthlyOut.toLocaleString()} <span className="text-[9px] font-normal">ج.م</span></p>
        </div>
        <div className="bg-slate-950 dark:bg-white p-5 rounded-[24px] text-white dark:text-slate-900 shadow-xl">
          <p className="text-[8px] opacity-40 font-bold uppercase mb-2">صافي الربح</p>
          <p className="text-xl font-black">{(totalMonthlyIn - totalMonthlyOut).toLocaleString()} <span className="text-[9px] font-normal">ج.م</span></p>
        </div>
      </div>

      <section className="bg-white dark:bg-[#0c0c0c] p-6 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
           تحليل التوزيع لكل فئة
        </h3>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#ffffff10" : "#f1f5f9"} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9 }} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', background: isDarkMode ? '#1a1a1a' : '#fff', color: isDarkMode ? '#fff' : '#000' }} />
              <Bar dataKey="إيداع" radius={[4, 4, 4, 4]} fill="#10b981" barSize={10} />
              <Bar dataKey="سحب" radius={[4, 4, 4, 4]} fill="#f43f5e" barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};
