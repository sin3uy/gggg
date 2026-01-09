
export type TransactionType = 'split_deposit' | 'direct_deposit' | 'withdrawal' | 'transfer';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string | 'all';
  categoryName: string;
  targetCategoryId?: string;
  targetCategoryName?: string;
  date: number;
  note?: string;
}

export interface WalletCategory {
  id: string;
  name: string;
  percentage: number;
  balance: number;
  color: string;
  icon: string;
  isLocked?: boolean;
}

export interface InternalBackup {
  id: string;
  date: number;
  data: string; // Encrypted string
}

export interface PendingPinChange {
  newPin: string;
  requestTime: number;
  isReady: boolean;
  type: 'main' | 'recovery';
}

export interface AppState {
  wallets: WalletCategory[];
  transactions: Transaction[];
  lastBackupDate?: number;
  userPin: string;
  recoveryPin: string;
  pendingPinChange?: PendingPinChange;
  isDarkMode: boolean;
}
