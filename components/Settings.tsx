
import React, { useState, useRef } from 'react';
import { WalletCategory, Transaction, PendingPinChange, AppState } from '../types';
import { encryptData, decryptData } from '../cryptoUtils';
import { 
  CheckCircle2, Save, Download, Upload, 
  Settings as SettingsIcon, 
  ShieldAlert, Moon, Sun, Plus, Minus, ShieldCheck
} from 'lucide-react';

interface SettingsProps {
  wallets: WalletCategory[];
  transactions: Transaction[];
  currentPin: string;
  recoveryPin: string;
  pendingPinChange?: PendingPinChange;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onUpdatePercentages: (newPercentages: Record<string, number>) => void;
  onRestoreData: (fullState: Partial<AppState>) => void;
  onUpdatePin: (newPin: string) => void;
  onSetPendingPin: (newPin: string, type: 'main' | 'recovery') => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  wallets, transactions, currentPin, recoveryPin, isDarkMode, onToggleTheme, 
  onUpdatePercentages, onRestoreData 
}) => {
  const [percentages, setPercentages] = useState<Record<string, number>>(() => {
    const p: Record<string, number> = {};
    wallets.forEach(w => p[w.id] = w.percentage);
    return p;
  });
  const [saveStatus, setSaveStatus] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const total = Math.round(Object.values(percentages).reduce((acc, val) => acc + (val || 0), 0));
  const isValid = total === 100;

  const updateValue = (id: string, newVal: number) => {
    const safeVal = Math.min(100, Math.max(0, newVal));
    setPercentages(prev => ({ ...prev, [id]: safeVal }));
  };

  const handleExport = async () => {
    const pin = prompt("🔐 أدخل رمز الحماية (0986) لتنزيل نسخة قاعدة البيانات:");
    
    if (pin === null) return; // المستخدم ألغى العملية
    
    if (pin !== "0986") {
      alert("❌ رمز الحماية الذي أدخلته غير صحيح. لا يمكن تنزيل البيانات.");
      return;
    }
    
    setIsProcessing(true);
    try {
      // تجهيز كامل قاعدة البيانات
      const fullAppData: AppState = {
        wallets: wallets.map(w => ({ ...w, balance: Math.round(w.balance) })),
        transactions: transactions,
        userPin: currentPin,
        recoveryPin: recoveryPin,
        isDarkMode: isDarkMode,
        lastBackupDate: Date.now()
      };
      
      const jsonData = JSON.stringify(fullAppData);
      const encrypted = await encryptData(jsonData, pin);
      
      // إنشاء الملف للتنزيل
      const blob = new Blob([encrypted], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const fileName = `SmartWallet_Elite_Backup_${new Date().toISOString().slice(0,10)}.enc`;
      
      // إنشاء رابط تنزيل مخفي وتفعيله
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      
      // إضافة الرابط للمستند، الضغط عليه، ثم حذفه
      document.body.appendChild(a);
      a.click();
      
      // تأخير بسيط للتنظيف لضمان استجابة المتصفح في الهواتف
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 200);
      
      alert("✅ جاري تنزيل نسخة قاعدة البيانات على جهازك الآن...");
    } catch (e) { 
      console.error("Export error:", e);
      alert("❌ فشل تصدير البيانات. يرجى المحاولة مرة أخرى."); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleImport = async (file: File) => {
    const pin = prompt("🔑 أدخل الرمز (0986) لفك تشفير واستعادة البيانات:");
    if (pin === null) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const encryptedContent = e.target?.result as string;
        try {
          const decryptedJson = await decryptData(encryptedContent, pin);
          const backup: AppState = JSON.parse(decryptedJson);
          
          if (!backup.wallets || !backup.transactions) {
            throw new Error("Invalid Format");
          }

          // استعادة النظام بالكامل
          onRestoreData(backup);
          
          alert("✅ تم استعادة كافة الأرصدة والعمليات والإعدادات بنجاح!");
        } catch (err) { 
          alert("❌ فشل فك التشفير: الرمز غير صحيح أو الملف تالف."); 
        } finally {
          setIsProcessing(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setIsProcessing(false);
      alert("❌ حدث خطأ أثناء قراءة ملف النسخة الاحتياطية.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-slate-950 dark:bg-white rounded-[20px] flex items-center justify-center text-white dark:text-slate-950 shadow-2xl">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black dark:text-white">إعدادات النظام</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] opacity-60">Elite Financial Controller</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <section className="bg-white dark:bg-[#0c0c0c] p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
            <h3 className="text-[11px] font-black mb-6 flex items-center gap-2 dark:text-white uppercase tracking-widest text-slate-400">
              <Sun size={16} className="text-amber-500" /> الطابع البصري
            </h3>
            <button onClick={onToggleTheme} className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-md">
                  {isDarkMode ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-amber-500" />}
                </div>
                <span className="text-sm font-bold dark:text-white">الوضع الداكن (Onyx)</span>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
            </button>
          </section>

          <section className="bg-white dark:bg-[#0c0c0c] p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
            <h3 className="text-[11px] font-black mb-6 flex items-center gap-2 dark:text-white uppercase tracking-widest text-slate-400">
              <ShieldCheck size={16} className="text-indigo-500" /> قاعدة البيانات (الرمز: 0986)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleExport} 
                disabled={isProcessing} 
                className="p-5 bg-slate-950 text-white rounded-[24px] font-black text-[10px] flex flex-col items-center gap-3 shadow-2xl disabled:opacity-50 active:scale-95 group transition-all"
              >
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                  <Download size={20} />
                </div>
                تصدير نسخة كاملة
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isProcessing} 
                className="p-5 bg-slate-50 dark:bg-white/5 dark:text-white rounded-[24px] font-black text-[10px] flex flex-col items-center gap-3 border border-slate-100 dark:border-white/10 active:scale-95 group transition-all"
              >
                <div className="w-10 h-10 bg-slate-900/5 dark:bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                  <Upload size={20} />
                </div>
                استيراد واستعادة
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".enc" onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])} />
            </div>
            <p className="mt-4 text-[8px] text-slate-400 text-center font-bold uppercase opacity-50">يتم تنزيل نسخة مشفرة ومؤمنة بالكامل</p>
          </section>
        </div>

        <section className="bg-white dark:bg-[#0c0c0c] p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black flex items-center gap-2 dark:text-white uppercase tracking-widest text-slate-400">
              <ShieldAlert size={16} className="text-emerald-500" /> التحكم في النِسَب
            </h3>
            <div className={`px-4 py-1.5 rounded-full text-[11px] font-black ${isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {total}%
            </div>
          </div>

          <div className="space-y-7">
            {wallets.map(w => (
              <div key={w.id} className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{w.name}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateValue(w.id, percentages[w.id] - 1)} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-white hover:bg-rose-500"><Minus size={14} /></button>
                    <span className="text-base font-black dark:text-white w-10 text-center">{percentages[w.id]}%</span>
                    <button onClick={() => updateValue(w.id, percentages[w.id] + 1)} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-white hover:bg-emerald-500"><Plus size={14} /></button>
                  </div>
                </div>
                <input type="range" min="0" max="100" value={percentages[w.id]} onChange={(e) => updateValue(w.id, parseInt(e.target.value))} className="w-full accent-emerald-500 h-2" />
              </div>
            ))}
          </div>

          <button 
            disabled={!isValid || saveStatus} 
            onClick={() => { onUpdatePercentages(percentages); setSaveStatus(true); setTimeout(() => setSaveStatus(false), 2000); }} 
            className={`w-full h-16 rounded-[24px] font-black text-sm flex items-center justify-center gap-3 transition-all ${
              saveStatus ? 'bg-emerald-600 text-white shadow-2xl' : 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 disabled:opacity-20 shadow-2xl'
            }`}
          >
            {saveStatus ? <CheckCircle2 size={20} /> : <Save size={20} />}
            {saveStatus ? 'تم الحفظ' : 'تأكيد النسب الجديدة'}
          </button>
        </section>
      </div>
    </div>
  );
};
