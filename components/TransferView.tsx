
import React, { useState } from 'react';
import { WalletCategory } from '../types';
import { ArrowLeftRight, ArrowDown, ShieldCheck, Zap, User, Heart, Lock } from 'lucide-react';

const IconMap: Record<string, any> = { ShieldCheck, Zap, User, Heart };

interface TransferViewProps {
  wallets: WalletCategory[];
  onTransfer: (fromId: string, toId: string, amount: number) => void;
}

export const TransferView: React.FC<TransferViewProps> = ({ wallets, onTransfer }) => {
  const [fromId, setFromId] = useState(wallets[0].id);
  const [toId, setToId] = useState(wallets[1].id);
  const [amount, setAmount] = useState('');

  const fromWallet = wallets.find(w => w.id === fromId)!;
  const toWallet = wallets.find(w => w.id === toId)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(amount, 10);
    
    if (isNaN(amt) || amt <= 0) {
      alert("يرجى إدخال مبلغ صحيح للتحويل");
      return;
    }
    
    if (fromId === toId) { 
      alert("لا يمكن التحويل لنفس المحفظة!"); 
      return; 
    }
    
    if (fromWallet.isLocked || toWallet.isLocked) { 
      alert("إحدى المحافظ مقفلة حالياً ولا تقبل العمليات!"); 
      return; 
    }

    if (amt > fromWallet.balance) {
      alert("رصيد المحفظة المصدر غير كافٍ");
      return;
    }

    onTransfer(fromId, toId, amt);
    setAmount('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col gap-1 mb-2 text-center">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">التحويل البيني</h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold opacity-60">Internal Liquidity Transfer</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* From Wallet */}
        <div className="bg-white dark:bg-[#0c0c0c] p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-xl relative overflow-hidden">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">من محفظة (المصدر)</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {wallets.map(w => (
              <button 
                key={w.id} type="button" 
                onClick={() => setFromId(w.id)}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${fromId === w.id ? 'border-emerald-500 bg-emerald-500/5' : 'border-transparent bg-slate-50 dark:bg-white/5 opacity-40 hover:opacity-100'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${w.color} bg-opacity-20 text-emerald-500`}>
                  {React.createElement(IconMap[w.icon] || User, { size: 16, className: w.color.replace('bg-', 'text-') })}
                </div>
                <span className="text-[9px] font-black dark:text-white truncate w-full text-center">{w.name}</span>
                {w.isLocked && <Lock size={10} className="text-amber-500" />}
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 dark:border-white/5 flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">الرصيد المتاح:</span>
            <span className="text-sm font-black dark:text-emerald-400">{Math.round(fromWallet.balance || 0).toLocaleString()} ج.م</span>
          </div>
        </div>

        {/* Transfer Icon */}
        <div className="flex justify-center -my-4 relative z-10">
          <div className="w-12 h-12 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-full flex items-center justify-center shadow-2xl border-4 border-[#f8fafc] dark:border-[#050505]">
            <ArrowDown size={24} />
          </div>
        </div>

        {/* To Wallet */}
        <div className="bg-white dark:bg-[#0c0c0c] p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-xl relative overflow-hidden">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">إلى محفظة (الوجهة)</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {wallets.map(w => (
              <button 
                key={w.id} type="button" 
                onClick={() => setToId(w.id)}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${toId === w.id ? 'border-indigo-500 bg-indigo-500/5' : 'border-transparent bg-slate-50 dark:bg-white/5 opacity-40 hover:opacity-100'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${w.color} bg-opacity-20 text-emerald-500`}>
                   {React.createElement(IconMap[w.icon] || User, { size: 16, className: w.color.replace('bg-', 'text-') })}
                </div>
                <span className="text-[9px] font-black dark:text-white truncate w-full text-center">{w.name}</span>
                {w.isLocked && <Lock size={10} className="text-amber-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="bg-slate-950 dark:bg-white p-6 rounded-[32px] shadow-2xl">
          <input 
            type="number" step="1" placeholder="0" 
            className="w-full bg-transparent text-center text-3xl font-black text-white dark:text-slate-950 outline-none placeholder:text-white/20 dark:placeholder:text-slate-950/20"
            value={amount} onChange={(e) => setAmount(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!amount || parseInt(amount, 10) > fromWallet.balance || fromId === toId}
            className="w-full mt-6 h-14 bg-emerald-500 text-white dark:text-white font-black rounded-2xl shadow-xl active:scale-95 disabled:opacity-20 transition-all flex items-center justify-center gap-3"
          >
            <ArrowLeftRight size={20} /> تأكيد التحويل الآن
          </button>
        </div>
      </form>
    </div>
  );
};
