
import React, { useState, useMemo } from 'react';
import { WalletCategory, Transaction } from '../types';
import { WalletCard } from './WalletCard';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChevronRight, Sparkles } from 'lucide-react';

interface DashboardProps {
  wallets: WalletCategory[];
  totalBalance: number;
  recentTransactions: Transaction[];
  onSplitDeposit: (amount: number) => void;
  onCategoryDeposit: (categoryId: string, amount: number) => void;
  onCategoryWithdraw: (categoryId: string, amount: number) => void;
  onToggleLock: (categoryId: string) => void;
  onTransfer: (fromId: string, toId: string, amount: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  wallets, totalBalance, onSplitDeposit, 
  onCategoryDeposit, onCategoryWithdraw, onToggleLock
}) => {
  const [splitAmount, setSplitAmount] = useState('');

  const chartData = useMemo(() => wallets.map(w => ({
    name: w.name,
    value: Math.max(0, Math.round(w.balance)) || 1,
    color: w.id === 'obligations' ? '#6366f1' : w.id === 'investment' ? '#10b981' : w.id === 'personal' ? '#3b82f6' : '#f43f5e'
  })), [wallets]);

  const handleSplitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanValue = splitAmount.trim();
    if (!cleanValue) return;

    const amt = parseInt(cleanValue, 10);
    if (isNaN(amt) || amt <= 0) {
      alert("يرجى إدخال مبلغ صحيح");
      return;
    }
    
    onSplitDeposit(amt);
    setSplitAmount('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Elite Master Card */}
        <div className="lg:col-span-8 h-56 md:h-64 bg-slate-950 dark:bg-[#0c0c0c] rounded-[32px] relative overflow-hidden p-8 text-white shadow-2xl group border border-white/5">
          <div className="relative z-10 flex justify-between items-start">
             <div className="space-y-1">
               <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Financial Core V5.0 Integer</span>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Pure Logic Active</span>
               </div>
             </div>
             <Sparkles size={20} className="opacity-20 group-hover:opacity-100 transition-opacity text-amber-400" />
          </div>

          <div className="mt-6 relative z-10">
             <p className="text-[9px] font-black opacity-30 uppercase mb-1 tracking-widest">إجمالي الرصيد</p>
             <div className="flex items-baseline gap-2">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                  {(totalBalance || 0).toLocaleString()}
                </h2>
                <span className="text-lg font-light opacity-20 italic">ج.م</span>
             </div>
          </div>

          <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end border-t border-white/5 pt-4">
             <div className="flex gap-6">
                <div>
                  <p className="text-[7px] opacity-20 uppercase font-black mb-1 tracking-widest">Security Pin</p>
                  <p className="text-[9px] font-black text-slate-400 tracking-widest">0 9 8 6</p>
                </div>
                <div>
                  <p className="text-[7px] opacity-20 uppercase font-black mb-1 tracking-widest">Status</p>
                  <p className="text-[9px] font-black text-emerald-400">INTEGER MODE</p>
                </div>
             </div>
          </div>
          
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
        </div>

        {/* Chart View */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0c0c0c] rounded-[32px] shadow-sm border border-slate-100 dark:border-white/5 p-6 flex flex-col items-center justify-center">
           <div className="w-full h-40">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={chartData} innerRadius={50} outerRadius={65} paddingAngle={5} dataKey="value" stroke="none">
                   {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-full px-2 mt-4">
             {chartData.map((d, i) => (
               <div key={i} className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                 <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase truncate">{d.name}</span>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Action Hub */}
      <section className="bg-white dark:bg-[#0c0c0c] p-3 rounded-[24px] shadow-lg border border-slate-100 dark:border-white/5">
        <form onSubmit={handleSplitSubmit} className="flex gap-3">
           <input 
            type="number" step="1" min="1" placeholder="أدخل مبلغاً صحيحاً للتوزيع..." 
            className="flex-1 h-12 px-6 rounded-xl bg-slate-50 dark:bg-white/5 border-none outline-none font-bold text-base placeholder:text-slate-300 dark:placeholder:text-slate-700 dark:text-white"
            value={splitAmount} onChange={(e) => setSplitAmount(e.target.value)}
          />
          <button 
            type="submit" disabled={!splitAmount}
            className="px-6 h-12 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black rounded-xl shadow-xl active:scale-95 disabled:opacity-20 flex items-center gap-2"
          >
            توزيع <ChevronRight size={16} />
          </button>
        </form>
      </section>

      {/* Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {wallets.map(wallet => (
          <WalletCard 
            key={wallet.id} wallet={wallet} 
            onDeposit={(amt) => onCategoryDeposit(wallet.id, amt)}
            onWithdraw={(amt) => onCategoryWithdraw(wallet.id, amt)}
            onToggleLock={() => onToggleLock(wallet.id)}
          />
        ))}
      </div>
    </div>
  );
};
