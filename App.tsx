
import React, { useState, useEffect, useMemo } from 'react';
import { WalletCategory, Transaction, TransactionType, PendingPinChange, AppState } from './types';
import { INITIAL_WALLETS, CATEGORY_NAMES_MAP, SYSTEM_PIN, RECOVERY_PIN, PIN_WAIT_TIME } from './constants';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { TransactionHistory } from './components/TransactionHistory';
import { MonthlyAnalysis } from './components/MonthlyAnalysis';
import { TransferView } from './components/TransferView';
import { 
  LayoutDashboard, 
  History, 
  Settings as SettingsIcon, 
  BarChart3,
  ShieldCheck,
  Moon,
  Sun,
  ArrowLeftRight
} from 'lucide-react';

// دالة عالمية لضمان التعامل مع الأرقام الصحيحة فقط (بدون كسور)
const safeRound = (val: number): number => {
  return Math.round(val);
};

// دالة تحويل النص إلى رقم صحيح بأمان تام
const safeParse = (val: string): number => {
  const parsed = parseInt(val, 10);
  return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'analysis' | 'settings' | 'transfer'>('dashboard');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [wallets, setWallets] = useState<WalletCategory[]>(INITIAL_WALLETS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastBackupDate, setLastBackupDate] = useState<number | undefined>();
  const [userPin, setUserPin] = useState(SYSTEM_PIN);
  const [recoveryPin, setRecoveryPin] = useState(RECOVERY_PIN);
  const [pendingPinChange, setPendingPinChange] = useState<PendingPinChange | undefined>();

  useEffect(() => {
    const saved = localStorage.getItem('smart_wallet_v4_pro');
    if (saved) {
      try {
        const data: AppState = JSON.parse(saved);
        setWallets(data.wallets || INITIAL_WALLETS);
        setTransactions(data.transactions || []);
        setLastBackupDate(data.lastBackupDate);
        setUserPin(data.userPin || SYSTEM_PIN);
        setRecoveryPin(data.recoveryPin || RECOVERY_PIN);
        setPendingPinChange(data.pendingPinChange);
        if (data.isDarkMode !== undefined) {
          setIsDarkMode(data.isDarkMode);
        }
      } catch (e) { console.error(e); }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      const state: AppState = { 
        wallets, transactions, lastBackupDate, userPin, recoveryPin, pendingPinChange, isDarkMode 
      };
      localStorage.setItem('smart_wallet_v4_pro', JSON.stringify(state));
      if (isDarkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  }, [wallets, transactions, lastBackupDate, userPin, recoveryPin, pendingPinChange, isDarkMode, isInitialized]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const totalBalance = useMemo(() => safeRound(wallets.reduce((acc, w) => acc + w.balance, 0)), [wallets]);

  const handleSplitDeposit = (amountStr: any) => {
    const amount = typeof amountStr === 'number' ? amountStr : safeParse(String(amountStr));
    if (amount <= 0) return;

    const activeWallets = wallets.filter(w => !w.isLocked);
    if (activeWallets.length === 0) {
      alert("جميع المحافظ مقفلة حالياً!");
      return;
    }

    setWallets(prev => {
      const newWallets = [...prev];
      let remainingAmount = amount;
      
      const activeIndices = newWallets.reduce((acc: number[], w, idx) => {
        if (!w.isLocked) acc.push(idx);
        return acc;
      }, []);

      activeIndices.forEach((walletIdx, i) => {
        const wallet = newWallets[walletIdx];
        let share: number;
        
        if (i === activeIndices.length - 1) {
          share = remainingAmount;
        } else {
          share = Math.round(amount * (wallet.percentage / 100));
          remainingAmount -= share;
        }
        
        newWallets[walletIdx] = { 
          ...wallet, 
          balance: safeRound(wallet.balance + share) 
        };
      });

      return newWallets;
    });
    addTransaction(amount, 'split_deposit', 'all');
  };

  const handleCategoryDeposit = (categoryId: string, amountInput: any) => {
    const amount = safeParse(String(amountInput));
    if (amount <= 0) return;
    setWallets(prev => prev.map(w => w.id === categoryId ? { ...w, balance: safeRound(w.balance + amount) } : w));
    addTransaction(amount, 'direct_deposit', categoryId);
  };

  const handleCategoryWithdraw = (categoryId: string, amountInput: any) => {
    const amount = safeParse(String(amountInput));
    const wallet = wallets.find(w => w.id === categoryId);
    if (!wallet) return;
    
    if (amount <= 0 || wallet.balance < amount) { 
      alert('الرصيد غير كافٍ أو المبلغ غير صحيح!'); 
      return; 
    }

    setWallets(prev => prev.map(w => w.id === categoryId ? { ...w, balance: safeRound(w.balance - amount) } : w));
    addTransaction(amount, 'withdrawal', categoryId);
  };

  const handleTransfer = (fromId: string, toId: string, amountInput: any) => {
    const amount = safeParse(String(amountInput));
    const fromWallet = wallets.find(w => w.id === fromId);
    
    if (!fromWallet || amount <= 0 || fromWallet.balance < amount) { 
      alert('رصيد المصدر غير كافٍ!'); 
      return; 
    }
    
    setWallets(prev => prev.map(w => {
      if (w.id === fromId) return { ...w, balance: safeRound(w.balance - amount) };
      if (w.id === toId) return { ...w, balance: safeRound(w.balance + amount) };
      return w;
    }));

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      amount: amount,
      type: 'transfer',
      categoryId: fromId,
      categoryName: CATEGORY_NAMES_MAP[fromId],
      targetCategoryId: toId,
      targetCategoryName: CATEGORY_NAMES_MAP[toId],
      date: Date.now()
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setActiveTab('history');
  };

  const handleToggleLock = (categoryId: string) => {
    setWallets(prev => prev.map(w => w.id === categoryId ? { ...w, isLocked: !w.isLocked } : w));
  };

  const addTransaction = (amount: number, type: TransactionType, categoryId: string) => {
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      amount: safeRound(amount),
      type,
      categoryId,
      categoryName: CATEGORY_NAMES_MAP[categoryId] || 'فئة غير معروفة',
      date: Date.now()
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleFullRestore = (data: Partial<AppState>) => {
    if (data.wallets) setWallets(data.wallets);
    if (data.transactions) setTransactions(data.transactions);
    if (data.userPin) setUserPin(data.userPin);
    if (data.recoveryPin) setRecoveryPin(data.recoveryPin);
    if (data.isDarkMode !== undefined) setIsDarkMode(data.isDarkMode);
    if (data.lastBackupDate) setLastBackupDate(data.lastBackupDate);
  };

  if (!isInitialized) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-900 dark:text-slate-100 transition-all duration-500 pb-32 md:pb-0 md:pr-64">
      <aside className="hidden md:flex fixed right-0 top-0 h-full w-64 bg-white dark:bg-[#0a0a0a] border-l border-slate-200 dark:border-white/5 flex-col p-6 z-40 shadow-2xl">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={18} />
            </div>
            <h1 className="text-lg font-black tracking-tighter dark:text-white uppercase italic">Elite Pro</h1>
          </div>
          <button onClick={toggleTheme} className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-500 dark:text-slate-400">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={19} />} label="الرئيسية" />
          <NavItem active={activeTab === 'transfer'} onClick={() => setActiveTab('transfer')} icon={<ArrowLeftRight size={19} />} label="تحويل" />
          <NavItem active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} icon={<BarChart3 size={19} />} label="التقارير" />
          <NavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={19} />} label="السجل" />
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={19} />} label="الإعدادات" />
        </nav>

        <div className="mt-auto">
          <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/10">
            <p className="text-[8px] text-emerald-600 dark:text-emerald-400 font-black uppercase mb-1 tracking-widest opacity-60">Wealth Assets</p>
            <h2 className="text-lg font-black dark:text-white">{totalBalance.toLocaleString()} <span className="text-[10px] opacity-40">EGP</span></h2>
          </div>
        </div>
      </aside>

      <main className="p-4 md:p-8 max-w-5xl mx-auto page-transition">
        <header className="md:hidden flex items-center justify-between mb-8 px-1">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-slate-950 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 shadow-xl">
               <ShieldCheck size={20} />
             </div>
             <h1 className="text-lg font-black italic tracking-tighter dark:text-white uppercase">ELITE</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2.5 bg-white dark:bg-white/5 rounded-xl shadow-sm text-slate-900 dark:text-white border border-slate-100 dark:border-white/10">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-4 py-2 rounded-xl text-[10px] font-black shadow-xl">
               {totalBalance.toLocaleString()} <span className="opacity-40">ج.م</span>
            </div>
          </div>
        </header>

        <div key={activeTab} className="page-transition">
          {activeTab === 'dashboard' && (
            <Dashboard 
              wallets={wallets} 
              totalBalance={totalBalance} 
              recentTransactions={transactions.slice(0, 5)}
              onSplitDeposit={handleSplitDeposit} 
              onCategoryDeposit={handleCategoryDeposit}
              onCategoryWithdraw={handleCategoryWithdraw} 
              onToggleLock={handleToggleLock}
              onTransfer={handleTransfer} 
            />
          )}
          {activeTab === 'transfer' && (
            <TransferView wallets={wallets} onTransfer={handleTransfer} />
          )}
          {activeTab === 'analysis' && <MonthlyAnalysis transactions={transactions} wallets={wallets} isDarkMode={isDarkMode} />}
          {activeTab === 'history' && <TransactionHistory transactions={transactions} />}
          {activeTab === 'settings' && (
            <Settings 
              wallets={wallets} 
              transactions={transactions} 
              currentPin={userPin} 
              recoveryPin={recoveryPin}
              pendingPinChange={pendingPinChange} 
              isDarkMode={isDarkMode} 
              onToggleTheme={toggleTheme}
              onUpdatePercentages={(p) => setWallets(prev => prev.map(w => ({...w, percentage: p[w.id]})))} 
              onRestoreData={handleFullRestore}
              onUpdatePin={setUserPin} 
              onSetPendingPin={(newPin, type) => setPendingPinChange({ newPin, requestTime: Date.now(), isReady: false, type })}
            />
          )}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 glass-nav border border-white/20 dark:border-white/5 flex justify-around items-center p-2 z-50 rounded-[24px] shadow-2xl">
        <MobileNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="الرئيسية" />
        <MobileNavItem active={activeTab === 'transfer'} onClick={() => setActiveTab('transfer')} icon={<ArrowLeftRight size={20} />} label="تحويل" />
        <MobileNavItem active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} icon={<BarChart3 size={20} />} label="التقارير" />
        <MobileNavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={20} />} label="السجل" />
        <MobileNavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={20} />} label="الإعدادات" />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${active ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>{icon}<span className="text-sm">{label}</span></button>
);

const MobileNavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`relative flex flex-col items-center gap-1 transition-all duration-300 px-3 py-1.5 rounded-2xl ${active ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400'}`}>
    {icon}
    <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
