
import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { 
  ArrowUpRight, 
  Search, 
  ArrowDownToLine, 
  TrendingDown, 
  TrendingUp,
  Inbox,
  Clock,
  ArrowLeftRight,
  Target
} from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal' | 'transfer'>('all');

  const stats = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.type === 'withdrawal') acc.totalOut += curr.amount;
      else if (curr.type !== 'transfer') acc.totalIn += curr.amount;
      return acc;
    }, { totalIn: 0, totalOut: 0 });
  }, [transactions]);

  // حساب معدل "الصحة المالية" - نسبة الوفر
  const financialHealth = useMemo(() => {
    if (stats.totalIn === 0) return 0;
    const ratio = ((stats.totalIn - stats.totalOut) / stats.totalIn) * 100;
    return Math.max(0, Math.min(100, Math.round(ratio)));
  }, [stats]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.categoryName.includes(searchTerm) || 
                            (t.targetCategoryName || '').includes(searchTerm) ||
                            (t.note || '').includes(searchTerm);
      const matchesFilter = filterType === 'all' || 
                            (filterType === 'deposit' && (t.type === 'direct_deposit' || t.type === 'split_deposit')) ||
                            (filterType === 'withdrawal' && t.type === 'withdrawal') ||
                            (filterType === 'transfer' && t.type === 'transfer');
      return matchesSearch && matchesFilter;
    });
  }, [transactions, searchTerm, filterType]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredTransactions.forEach(t => {
      const dateKey = new Date(t.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-20">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">سجل العمليات</h2>
        <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] font-bold opacity-60">Financial Ledger & Progress</p>
      </div>

      {/* Financial Progress Indicator */}
      <div className="bg-slate-950 dark:bg-[#0c0c0c] p-6 rounded-[32px] text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="flex justify-between items-center mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
              <Target size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">مؤشر التقدم المالي</span>
          </div>
          <span className="text-xl font-black">{financialHealth}%</span>
        </div>
        
        <div className="w-full h-3 bg-white/5 rounded-full mb-3 relative z-10">
          <div 
            className="h-full bg-gradient-to-l from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
            style={{ width: `${financialHealth}%` }}
          ></div>
        </div>
        <p className="text-[9px] text-slate-400 font-bold relative z-10">
          {financialHealth > 50 ? 'أداء ممتاز! أنت توفر أكثر من نصف دخلك.' : 'تحتاج لتقليل المصاريف لزيادة نسبة الادخار.'}
        </p>

        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px]"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0c0c0c] p-5 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm">
          <TrendingUp size={18} className="text-emerald-500 mb-3" />
          <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">إجمالي الوارد</p>
          <p className="text-lg font-black text-emerald-600 tracking-tighter">{Math.round(stats.totalIn).toLocaleString()} <span className="text-[9px] font-normal opacity-50">ج.م</span></p>
        </div>
        <div className="bg-white dark:bg-[#0c0c0c] p-5 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm">
          <TrendingDown size={18} className="text-rose-500 mb-3" />
          <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">إجمالي المصروف</p>
          <p className="text-lg font-black text-rose-600 tracking-tighter">{Math.round(stats.totalOut).toLocaleString()} <span className="text-[9px] font-normal opacity-50">ج.م</span></p>
        </div>
        <div className="hidden md:block bg-slate-100 dark:bg-white/5 p-5 rounded-[24px] border border-transparent dark:border-white/5">
          <Inbox size={18} className="mb-3 text-indigo-500" />
          <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">العمليات المنفذة</p>
          <p className="text-lg font-black dark:text-white tracking-tighter">{transactions.length} <span className="text-[9px] opacity-40">عملية</span></p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" placeholder="ابحث عن عملية معينة..."
          className="w-full h-12 pr-12 pl-4 bg-white dark:bg-[#0c0c0c] border border-slate-100 dark:border-white/5 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 dark:text-white transition-all"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-8">
        {Object.entries(groupedTransactions).map(([date, items]) => (
          <div key={date} className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">{date}</span>
              <div className="h-[1px] bg-slate-100 dark:bg-white/5 flex-1"></div>
            </div>
            <div className="space-y-3">
              {items.map((t) => (
                <div key={t.id} className="bg-white dark:bg-[#0c0c0c] p-4 rounded-[24px] border border-slate-100 dark:border-white/5 flex items-center justify-between gap-4 transition-all hover:border-emerald-500/20 group">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-[16px] flex items-center justify-center transition-transform group-hover:scale-110 ${
                      t.type === 'withdrawal' ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : 
                      t.type === 'transfer' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' :
                      'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'
                    }`}>
                      {t.type === 'withdrawal' ? <ArrowUpRight size={20} /> : 
                       t.type === 'transfer' ? <ArrowLeftRight size={20} /> :
                       <ArrowDownToLine size={20} />}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-xs tracking-tight">{t.categoryName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5"><Clock size={12} /> {new Date(t.date).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className={`text-base font-black tracking-tighter ${t.type === 'withdrawal' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {t.type === 'withdrawal' ? '-' : '+'}{Math.round(t.amount).toLocaleString()} <span className="text-[10px]">ج.م</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <Inbox size={48} className="mb-4" />
            <p className="text-sm font-black uppercase">لا توجد عمليات مسجلة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};
