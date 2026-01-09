
import { WalletCategory } from './types';

export const LOW_BALANCE_THRESHOLD = 100;
export const SYSTEM_PIN = "0986"; 
export const RECOVERY_PIN = "JR4647986"; // مفتاح الطوارئ المشفر
export const PIN_WAIT_TIME = 24 * 60 * 60 * 1000; // 24 ساعة بالملي ثانية

export const INITIAL_WALLETS: WalletCategory[] = [
  {
    id: 'obligations',
    name: 'التزامات',
    percentage: 32,
    balance: 0,
    color: 'bg-indigo-500',
    icon: 'ShieldCheck'
  },
  {
    id: 'investment',
    name: 'استثمار',
    percentage: 32,
    balance: 0,
    color: 'bg-emerald-500',
    icon: 'Zap'
  },
  {
    id: 'personal',
    name: 'شخصي',
    percentage: 31,
    balance: 0,
    color: 'bg-blue-500',
    icon: 'User'
  },
  {
    id: 'charity',
    name: 'تبرع/زكاة',
    percentage: 5,
    balance: 0,
    color: 'bg-rose-500',
    icon: 'Heart'
  }
];

export const CATEGORY_NAMES_MAP: Record<string, string> = {
  'obligations': 'التزامات',
  'investment': 'استثمار',
  'personal': 'شخصي',
  'charity': 'تبرع/زكاة',
  'all': 'توزيع تلقائي'
};
