import { Client, Transaction, AppSettings, Product } from '../types';
import { DEFAULT_PRODUCTS } from '../constants';

const KEYS = {
  CLIENTS: 'bomboniere_clients',
  TRANSACTIONS: 'bomboniere_transactions',
  SETTINGS: 'bomboniere_settings',
  PRODUCTS: 'bomboniere_products',
};

const DEFAULT_SETTINGS: AppSettings = {
  pixKey: '',
  ownerName: 'Admin',
  instantMessage: true,
  customGreeting: '',
};

// --- Products ---

export const getProducts = (): Product[] => {
  const data = localStorage.getItem(KEYS.PRODUCTS);
  if (!data) {
    // Se estiver vazio, salva um array vazio em vez de injetar mock data
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }
  return JSON.parse(data);
};

export const saveProduct = (product: Product): void => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
};

export const deleteProduct = (id: string): void => {
  const products = getProducts().filter(p => p.id !== id);
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
};

// --- Clients ---

export const getClients = (): Client[] => {
  const data = localStorage.getItem(KEYS.CLIENTS);
  if (!data) {
    // Retorna array vazio para um início limpo
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify([]));
    return [];
  }
  return JSON.parse(data);
};

export const saveClient = (client: Client): void => {
  const clients = getClients();
  const index = clients.findIndex(c => c.id === client.id);
  if (index >= 0) {
    clients[index] = client;
  } else {
    clients.push(client);
  }
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
};

export const deleteClient = (id: string): void => {
  const clients = getClients().filter(c => c.id !== id);
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
};

export const updateClientBalance = (clientId: string, amount: number): number => {
  const clients = getClients();
  const client = clients.find(c => c.id === clientId);
  if (client) {
    client.balance += amount;
    client.lastPurchase = new Date().toISOString();
    saveClient(client);
    return client.balance;
  }
  return 0;
};

// --- Transactions ---

export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : [];
};

export const addTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  
  // Update client balance
  updateClientBalance(transaction.clientId, transaction.amount);
};

export const settleClientDebt = (clientId: string): void => {
  const clients = getClients();
  const client = clients.find(c => c.id === clientId);
  
  if (client && client.balance > 0) {
    // Record Payment Transaction
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      clientId: client.id,
      clientName: client.name,
      productId: 'payment',
      productName: 'Pagamento de Fatura',
      amount: -client.balance, // Negative amount to represent payment in history
      date: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      isPaid: true
    };
    
    // Add transaction and update balance (addTransaction handles updateClientBalance)
    addTransaction(transaction);
  }
};

// --- Settings ---

export const getSettings = (): AppSettings => {
  const data = localStorage.getItem(KEYS.SETTINGS);
  return data ? JSON.parse(data) : DEFAULT_SETTINGS;
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};