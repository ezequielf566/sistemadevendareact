export interface Client {
  id: string;
  name: string;
  phone: string;
  balance: number;
  lastPurchase?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  icon: string;
}

export interface Transaction {
  id: string;
  clientId: string;
  clientName: string;
  productId: string | 'custom';
  productName: string;
  amount: number;
  date: string; // ISO string
  dueDate: string; // Calculated based on logic
  isPaid: boolean;
}

export interface AppSettings {
  pixKey: string;
  ownerName: string;
  instantMessage: boolean; // True = Send immediately, False = Accumulate
  customGreeting: string; // Custom message template
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  PDV = 'PDV',
  CLIENTS = 'CLIENTS',
  SETTINGS = 'SETTINGS',
}