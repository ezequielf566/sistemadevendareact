import { Product } from './types';

// Iniciando sem produtos pré-definidos para permitir personalização total desde o início
export const DEFAULT_PRODUCTS: Product[] = [];

// Iniciando sem clientes para que o usuário cadastre apenas clientes reais
export const MOCK_CLIENTS: any[] = [];

export const THEME = {
  colors: {
    bg: 'bg-[#0B0C10]',
    card: 'bg-[#1F2833]',
    primary: 'text-[#66FCF1]',
    primaryBg: 'bg-[#66FCF1]',
    secondary: 'text-[#45A29E]',
    secondaryBg: 'bg-[#45A29E]',
    text: 'text-[#C5C6C7]',
    white: 'text-white',
    gold: 'text-amber-400',
    goldBg: 'bg-amber-400',
  }
};