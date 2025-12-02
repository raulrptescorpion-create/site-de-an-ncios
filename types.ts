export type UserRole = 'user' | 'shop' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  // Shop specific fields
  shopName?: string;
  address?: string;
  phone?: string;
  neighborhood?: string;
  openTime?: string;
  closeTime?: string;
  logoUrl?: string;
  // Subscription
  plan?: 'free_trial' | 'monthly' | 'package_60' | 'package_90' | 'pay_per_item';
  planExpiresAt?: string; // ISO date
  itemLimit?: number;
  itemsPosted?: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  shopId: string;
  shopName: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  brand?: string;
  model?: string;
  views: number;
  likes: number;
  createdAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  shopId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  price: number;
  status: 'pending' | 'sent' | 'delivered';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  productId: string;
  senderId: string; // User ID
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  itemLimit: number; // -1 for unlimited or high number
  description: string;
}