import { formatDate } from './dateLogic';
import { getSettings } from '../services/storage';

interface CartItem {
  name: string;
  qty: number;
  price: number;
}

interface SaleMessageProps {
  clientName: string;
  items: CartItem[];
  totalSale: number;
  dueDate: string;
  currentBalance: number; // Balance BEFORE this sale
  pixKey: string;
}

interface BillingTemplateProps {
  clientName: string;
  totalBalance: number;
  dueDate: string;
  pixKey: string;
}

const getGreeting = (clientName: string): string => {
  const settings = getSettings();
  
  if (settings.customGreeting && settings.customGreeting.trim() !== '') {
    // Replace placeholder {cliente} with actual name
    return settings.customGreeting.replace(/{cliente}/gi, `*${clientName}*`);
  }

  // Default Greeting
  return `💎 *BOMBONIERE PREMIUM* 💎\nOlá, *${clientName}*!`;
};

export const generateSaleLink = (phone: string, data: SaleMessageProps): string => {
  const itemsList = data.items
    .map(item => `• ${item.qty}x ${item.name} (R$ ${(item.price * item.qty).toFixed(2)})`)
    .join('\n');

  const finalBalance = data.currentBalance + data.totalSale;
  const greeting = getGreeting(data.clientName);

  const message = `
${greeting}
Nova compra registrada:

🛒 *Resumo do Pedido:*
${itemsList}
────────────────────
💵 *Total da Compra:* R$ ${data.totalSale.toFixed(2).replace('.', ',')}
📅 *Vencimento:* ${formatDate(data.dueDate)}
────────────────────
💰 *Total Acumulado:* R$ ${finalBalance.toFixed(2).replace('.', ',')}
🔗 *PIX:* ${data.pixKey || 'Consulte no balcão'}

_Obrigado!_
`.trim();

  return buildLink(phone, message);
};

export const generateBillingLink = (phone: string, data: BillingTemplateProps): string => {
  const greeting = getGreeting(data.clientName);
  
  const message = `
${greeting}
Esta é uma mensagem de fechamento de ciclo.

────────────────────
⚠️ *Resumo de Pendências*
💰 *Total a Pagar:* R$ ${data.totalBalance.toFixed(2).replace('.', ',')}
📅 *Vencimento:* ${formatDate(data.dueDate)}
────────────────────

🔗 *PIX para pagamento:* 
${data.pixKey || 'Solicite a chave PIX'}

_Por favor, envie o comprovante assim que possível. Obrigado!_
`.trim();

  return buildLink(phone, message);
};

// Deprecated single item generator
export const generateWhatsAppLink = (phone: string, data: any): string => {
  return generateSaleLink(phone, {
    clientName: data.clientName,
    items: [{ name: data.productName, qty: 1, price: data.productPrice }],
    totalSale: data.productPrice,
    dueDate: data.dueDate,
    currentBalance: data.totalBalance - data.productPrice,
    pixKey: data.pixKey
  });
};

const buildLink = (phone: string, message: string) => {
  const encodedMessage = encodeURIComponent(message);
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}