import { Category, Plan } from './types';

export const APP_NAME = "AkiraSeven.online";

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Informática' },
  { id: '2', name: 'Pet Shop' },
  { id: '3', name: 'Smartphones' },
  { id: '4', name: 'Farmácia' },
  { id: '5', name: 'Produtos Naturais' },
  { id: '6', name: 'Auto Peças Carro' },
  { id: '7', name: 'Auto Peças Moto' },
  { id: '8', name: 'Auto Peças Refrigeração' },
  { id: '9', name: 'Outros' },
];

export const PLANS: Plan[] = [
  { id: 'pay_per_item', name: 'Avulso', price: 2.90, durationDays: 365, itemLimit: 1, description: 'R$ 2,90 por item' },
  { id: 'monthly', name: 'Mensal', price: 49.90, durationDays: 30, itemLimit: 20, description: '20 itens por mês' },
  { id: 'package_60', name: 'Bimestral', price: 149.00, durationDays: 60, itemLimit: 100, description: '100 itens por 60 dias' },
  { id: 'package_90', name: 'Trimestral', price: 600.00, durationDays: 90, itemLimit: 300, description: '300 itens por 90 dias' },
];

// Placeholder images
export const PLACEHOLDER_IMG = "https://picsum.photos/400/400";