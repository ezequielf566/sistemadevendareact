import React from 'react';
import { Product } from './types';
import { Candy, Coffee, Cookie, IceCream, Sandwich, Wine } from 'lucide-react';

export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Chocolate Premium', price: 12.50, icon: 'candy' },
  { id: 'p2', name: 'Café Expresso', price: 6.00, icon: 'coffee' },
  { id: 'p3', name: 'Trufa Artesanal', price: 8.00, icon: 'cookie' },
  { id: 'p4', name: 'Gelato Italiano', price: 18.00, icon: 'ice-cream' },
  { id: 'p5', name: 'Sanduíche Natural', price: 15.00, icon: 'sandwich' },
  { id: 'p6', name: 'Refrigerante Lata', price: 5.00, icon: 'wine' },
];

export const MOCK_CLIENTS = [
  { id: 'c1', name: 'Ana Silva', phone: '5511999999999', balance: 45.50 },
  { id: 'c2', name: 'Carlos Oliveira', phone: '5511988888888', balance: 120.00 },
  { id: 'c3', name: 'Mariana Souza', phone: '5511977777777', balance: 0.00 },
];

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