import { createClient } from '@supabase/supabase-js';

// NOTE: In a real scenario, you would use process.env.REACT_APP_SUPABASE_URL
// For this demo, we check if keys exist. If not, the app will fallback to mock data in the Context.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * SQL SCHEMA SUGGESTION FOR SUPABASE:
 * 
 * tables:
 * - profiles (
 *    id text primary key, 
 *    email text, 
 *    role text, 
 *    name text,
 *    shop_name text,
 *    address text,
 *    phone text,
 *    neighborhood text,
 *    open_time text,
 *    close_time text,
 *    logo_url text,
 *    plan text,
 *    created_at timestamp
 * )
 * - products (
 *    id text primary key, 
 *    shop_id text, 
 *    shop_name text,
 *    title text, 
 *    description text, 
 *    price numeric, 
 *    image_url text, 
 *    category text, 
 *    brand text,
 *    model text,
 *    views numeric, 
 *    likes numeric, 
 *    created_at timestamp
 * )
 * - orders (
 *    id text primary key,
 *    buyer_id text,
 *    shop_id text,
 *    product_id text,
 *    product_title text,
 *    product_image text,
 *    price numeric,
 *    status text,
 *    created_at timestamp
 * )
 * - categories (id text primary key, name text)
 * - chat_messages (id text primary key, product_id text, sender_id text, sender_name text, text text, created_at timestamp)
 */