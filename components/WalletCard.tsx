
import React, { useState } from 'react';
import { WalletCategory } from '../types';
import { Plus, ChevronUp, ShieldCheck, Zap, User, Heart, Lock, Unlock } from 'lucide-react';

const IconMap: Record<string, any> = { ShieldCheck, Zap, User, Heart };

export const WalletCard: React.FC<{ wallet: WalletCategory, onDeposit: (a: number) => void, onWithdraw: (a: number) => void, onToggleLock: () => void }> = ({ wallet, onDeposit, onWithdraw, onToggleLock }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [amount, setAmount] = useState('');
  const IconComponent = IconMap[wallet.icon] || User;

  const handleAction = (type: 'in' | 'out') => {
    const amt = parseInt(amount, 10);
    if (isNaN(amt) || amt <= 0) {
      alert("يرجى إدخال مبلغ صحيح");
      return;
    }
    if (type === 'out' && amt > wallet.balance) {
      alert("الرصيد غير كافٍ في هذه المحفظة");
      return;
    }
    
    if (type === 'in') onDeposit(amt);
    else onWithdraw(amt);
    
    setAmount('');
    setIsExpanded(false);
  };

  return (
    <div className={`bg-white dark:bg-[#0c0c0c] p-5 rounded-[28px] border border-slate-100 dark:border-white/5 transition-all duration-300 hover:shadow-xl shadow-sm relative overflow-hidden ${wallet.isLocked ? 'opacity-80' : ''}`}>
      {wallet.isLocked && (
        <div className="absolute inset-0 bg-slate-50/50 dark:bg-black/40 backdrop-blur-[1px] z-10 pointer-events-none"></div>
      )}
      
      <div className="flex justify-between items-start mb-5 relative z-20">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${wallet.color} bg-opacity-10 text-emerald-500`}>
          <IconComponent className={wallet.color.replace('bg-', 'text-')} size={20} />
        </div>
        <div className="flex gap-2 items-center">
           <button 
             onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
             className={`p-1.5 rounded-lg transition-colors z-30 pointer-events-auto ${wallet.isLocked ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 dark:bg-white/5 text-slate-400'}`}
           >
             {wallet.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
           </button>
           <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-lg">{wallet.percentage}%</span>
        </div>
      </div>

      <div className="space-y-0.5 relative z-20">
        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{wallet.name}</h4>
        <h3 className="text-xl font-black dark:text-white tracking-tighter">
          {Math.round(wallet.balance || 0).toLocaleString()} <span className="text-[9px] opacity-20">ج.م</span>
        </h3>
      </div>

      <button 
        onClick={() => !wallet.isLocked && setIsExpanded(!isExpanded)}
        disabled={wallet.isLocked}
        className={`mt-5 w-full py-2.5 rounded-xl text-[9px] font-black transition-all flex items-center justify-center gap-2 relative z-20 
          ${wallet.isLocked 
            ? 'bg-slate-100 dark:bg-white/5 text-slate-300 cursor-not-allowed' 
            : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 active:scale-95'}`}
      >
        {isExpanded ? <ChevronUp size={14} /> : <Plus size={14} />}
        تعديل الرصيد
      </button>

      {isExpanded && !wallet.isLocked && (
        <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 relative z-20">
          <input 
            type="number" step="1" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)}
            className="w-full h-10 bg-slate-50 dark:bg-white/5 border-none rounded-lg text-center text-base font-black dark:text-white outline-none"
          />
          <div className="flex gap-2">
            <button onClick={() => handleAction('in')} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black shadow-lg shadow-emerald-500/20">إيداع</button>
            <button onClick={() => handleAction('out')} className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg text-[9px] font-black shadow-lg shadow-rose-500/20">سحب</button>
          </div>
        </div>
      )}
    </div>
  );
};
