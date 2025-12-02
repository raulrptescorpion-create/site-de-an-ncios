
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, Category, ChatMessage, UserRole, Order } from '../types';
import { INITIAL_CATEGORIES, PLANS } from '../constants';
import { supabase } from '../services/supabase';

interface StoreContextType {
  user: User | null;
  products: Product[];
  categories: Category[];
  shops: User[]; // Users with role 'shop'
  chats: ChatMessage[];
  orders: Order[];
  isLoading: boolean;
  login: (email: string, role: UserRole, shopData?: Partial<User>) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'views' | 'likes' | 'createdAt' | 'shopId' | 'shopName'>) => void;
  likeProduct: (id: string) => void;
  viewProduct: (id: string) => void;
  buyProduct: (product: Product) => Promise<void>;
  addCategory: (name: string) => void;
  removeCategory: (id: string) => void;
  sendMessage: (productId: string, text: string, guestInfo?: { id: string, name: string }) => void;
  upgradePlan: (planId: string) => Promise<void>;
  isSupabaseConnected: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State acting as database
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [shops, setShops] = useState<User[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Load (Mock or Supabase)
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      if (supabase) {
        try {
          // Load from Supabase
          const { data: catData } = await supabase.from('categories').select('*');
          if (catData && catData.length > 0) setCategories(catData);

          const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
          if (prodData) {
              const mappedProds = prodData.map((p: any) => ({
                  id: p.id,
                  shopId: p.shop_id || p.shopId,
                  shopName: p.shop_name || p.shopName,
                  title: p.title,
                  description: p.description,
                  price: p.price,
                  imageUrl: p.image_url || p.imageUrl,
                  category: p.category,
                  brand: p.brand,
                  model: p.model,
                  views: p.views,
                  likes: p.likes,
                  createdAt: p.created_at || p.createdAt
              }));
              setProducts(mappedProds);
          }

          const { data: shopData } = await supabase.from('profiles').select('*').eq('role', 'shop');
          if (shopData) {
               const mappedShops = shopData.map((s: any) => ({
                   id: s.id,
                   email: s.email,
                   name: s.name,
                   role: s.role,
                   shopName: s.shop_name || s.shopName,
                   address: s.address,
                   phone: s.phone,
                   neighborhood: s.neighborhood,
                   openTime: s.open_time || s.openTime,
                   closeTime: s.close_time || s.closeTime,
                   logoUrl: s.logo_url || s.logoUrl,
                   plan: s.plan,
                   planExpiresAt: s.plan_expires_at,
                   lat: s.lat,
                   lng: s.lng
               }));
               setShops(mappedShops as User[]);
          }

          const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
          if (orderData) {
            const mappedOrders = orderData.map((o: any) => ({
               id: o.id,
               buyerId: o.buyer_id,
               shopId: o.shop_id,
               productId: o.product_id,
               productTitle: o.product_title,
               productImage: o.product_image,
               price: o.price,
               status: o.status,
               createdAt: o.created_at
            }));
            setOrders(mappedOrders);
          }

        } catch (error) {
          console.error("Error loading Supabase data:", error);
        }
      } else {
        // Load Mocks
        const mockShops: User[] = [
          { 
            id: 'shop1', email: 'tech@akira.com', name: 'CyberTech Store', role: 'shop',
            shopName: 'CyberTech Store', address: 'Av. Paulista, 1000', phone: '(11) 9999-8888',
            neighborhood: 'Bela Vista', openTime: '08:00', closeTime: '22:00',
            logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=CyberTech',
            plan: 'monthly',
            planExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            lat: -23.5657, lng: -46.6514 // Av Paulista approx
          },
          { 
            id: 'shop2', email: 'fashion@akira.com', name: 'Neon Fashion', role: 'shop',
            shopName: 'Neon Fashion', address: 'Rua Augusta, 500', phone: '(11) 7777-6666',
            neighborhood: 'Consolação', openTime: '10:00', closeTime: '20:00',
            logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=Neon',
            plan: 'package_90',
            planExpiresAt: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(),
            lat: -23.5505, lng: -46.6559 // Rua Augusta approx
          }
        ];
        setShops(mockShops);

        setProducts([
          {
            id: 'p1', shopId: 'shop1', shopName: 'CyberTech Store', title: 'Cyber Deck 2024',
            description: 'Computador portátil de alta performance.', price: 4500.00,
            imageUrl: 'https://picsum.photos/400/300?random=1', category: 'Informática',
            brand: 'Arasaka', model: 'MK-IV',
            views: 120, likes: 45, createdAt: new Date().toISOString()
          },
          {
            id: 'p2', shopId: 'shop2', shopName: 'Neon Fashion', title: 'Jaqueta Led',
            description: 'Jaqueta com iluminação RGB controlada por app.', price: 350.00,
            imageUrl: 'https://picsum.photos/400/300?random=2', category: 'Moda Masculina',
            brand: 'Tyrell', model: 'Nexus-6',
            views: 89, likes: 22, createdAt: new Date().toISOString()
          }
        ]);
        
        // Mock orders
        setOrders([
          {
             id: 'o1', buyerId: 'user1', shopId: 'shop1', productId: 'p1', 
             productTitle: 'Cyber Deck 2024', productImage: 'https://picsum.photos/400/300?random=1',
             price: 4500.00, status: 'delivered', createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
          }
        ]);
      }
      setIsLoading(false);
    };

    initData();
  }, []);

  // 'email' parameter acts as identifier (phone) in the new flow
  const login = async (email: string, role: UserRole, shopData?: Partial<User>) => {
    setIsLoading(true);
    
    // Default expiration for new shops/mock login: 30 days from now
    const defaultExpiration = role === 'shop' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
      : undefined;

    const fallbackName = shopData?.shopName || 'Loja Anunciante';
    
    // Create temp user object
    const newUser: User = {
      id: supabase ? undefined as any : (role === 'shop' ? `shop_${Math.random().toString(36).substr(2,5)}` : `user_${Math.random().toString(36).substr(2,5)}`),
      email, // This is the phone number
      name: fallbackName,
      shopName: fallbackName, // Explicitly set shopName
      role,
      plan: role === 'shop' ? 'free_trial' : undefined,
      planExpiresAt: defaultExpiration,
      phone: email,
      ...shopData
    };
    
    // Admin backdoor for demo
    if(email.includes('admin')) {
      newUser.role = 'admin';
      newUser.name = 'Administrador';
    }

    if (supabase) {
        try {
          // Check by phone if using phone auth logic, or email if legacy
          const { data } = await supabase.from('profiles').select('*').or(`email.eq.${email},phone.eq.${email}`).single();
          
          if (data) {
               setUser({
                   ...data,
                   shopName: data.shop_name,
                   openTime: data.open_time,
                   closeTime: data.close_time,
                   logoUrl: data.logo_url,
                   planExpiresAt: data.plan_expires_at,
                   name: data.shop_name || data.name,
                   lat: data.lat,
                   lng: data.lng
               });
          } else {
              const dbUser = {
                  email: newUser.email,
                  role: newUser.role,
                  name: newUser.name,
                  shop_name: newUser.shopName,
                  address: newUser.address,
                  phone: newUser.phone || newUser.email, // Ensure phone is saved
                  neighborhood: newUser.neighborhood,
                  open_time: newUser.openTime,
                  close_time: newUser.closeTime,
                  logo_url: newUser.logoUrl,
                  plan: newUser.plan,
                  plan_expires_at: newUser.planExpiresAt,
                  created_at: new Date().toISOString(),
                  lat: newUser.lat,
                  lng: newUser.lng
              };
              const { data: created, error } = await supabase.from('profiles').insert([dbUser]).select().single();
              if (created) {
                  newUser.id = created.id;
                  setUser(newUser);
                  if(role === 'shop') setShops(prev => [...prev, newUser]);
              } else {
                  console.error("Supabase Error:", error);
                  newUser.id = Math.random().toString();
                  setUser(newUser);
              }
          }
        } catch (e) {
          console.error(e);
          newUser.id = Math.random().toString();
          setUser(newUser);
        }
    } else {
        // Mock Login logic
        // Check if shop already exists in mock list by PHONE (passed as email param) or Email
        if (role === 'shop') {
          const existingShop = shops.find(s => s.phone === email || s.email === email);
          if (existingShop) {
            setUser(existingShop);
          } else {
            // New session / unregistered mock shop
            // If registering, we have shopData. If not, we use fallbackName "Loja Anunciante"
            setUser(newUser);
            // Add to mock shops so it appears in the list
            setShops(prev => [...prev, newUser]);
          }
        } else {
          setUser(newUser);
        }
    }
    setIsLoading(false);
  };

  const logout = () => setUser(null);

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    
    // Merge updates
    const updatedUser = { ...user, ...data };
    // If shopName is updated, ensure name is also synced if it was the same
    if (data.shopName) updatedUser.name = data.shopName;

    setUser(updatedUser);
    
    // Update local shops list
    setShops(prev => prev.map(s => s.id === user.id ? updatedUser : s));

    if (supabase) {
        const dbUpdate: any = {};
        if (data.name) dbUpdate.name = data.name;
        if (data.shopName) dbUpdate.shop_name = data.shopName;
        if (data.phone) dbUpdate.phone = data.phone;
        if (data.address) dbUpdate.address = data.address;
        if (data.neighborhood) dbUpdate.neighborhood = data.neighborhood;
        if (data.openTime) dbUpdate.open_time = data.openTime;
        if (data.closeTime) dbUpdate.close_time = data.closeTime;
        if (data.logoUrl) dbUpdate.logo_url = data.logoUrl;
        if (data.lat) dbUpdate.lat = data.lat;
        if (data.lng) dbUpdate.lng = data.lng;
        
        await supabase.from('profiles').update(dbUpdate).eq('id', user.id);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'views' | 'likes' | 'createdAt' | 'shopId' | 'shopName'>) => {
    if (!user || user.role !== 'shop') return;
    
    const tempId = Math.random().toString(36).substr(2, 9);
    const newProduct: Product = {
      ...productData,
      id: tempId,
      shopId: user.id,
      shopName: user.shopName || user.name,
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString()
    };

    if (supabase) {
        const dbProduct = {
            shop_id: user.id,
            shop_name: user.shopName || user.name,
            title: productData.title,
            description: productData.description,
            price: productData.price,
            image_url: productData.imageUrl,
            category: productData.category,
            brand: productData.brand,
            model: productData.model,
            views: 0,
            likes: 0,
            created_at: new Date().toISOString()
        };
        try {
          const { data, error } = await supabase.from('products').insert([dbProduct]).select().single();
          if (data) {
              newProduct.id = data.id;
              setProducts(prev => [newProduct, ...prev]);
          } else {
              console.warn("Supabase insert failed, falling back to local:", error);
              setProducts(prev => [newProduct, ...prev]);
          }
        } catch (e) {
          console.error("Supabase exception:", e);
          setProducts(prev => [newProduct, ...prev]);
        }
    } else {
        setProducts(prev => [newProduct, ...prev]);
    }
  };

  const likeProduct = async (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    if (supabase) {
        const p = products.find(p => p.id === id);
        if(p) {
            await supabase.from('products').update({ likes: p.likes + 1 }).eq('id', id);
        }
    }
  };

  const viewProduct = async (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, views: p.views + 1 } : p));
    if (supabase) {
        const p = products.find(p => p.id === id);
        if(p) {
            await supabase.from('products').update({ views: p.views + 1 }).eq('id', id);
        }
    }
  };

  const buyProduct = async (product: Product) => {
    if (!user) return;
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      buyerId: user.id,
      shopId: product.shopId,
      productId: product.id,
      productTitle: product.title,
      productImage: product.imageUrl,
      price: product.price,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);

    if (supabase) {
      await supabase.from('orders').insert([{
        buyer_id: user.id,
        shop_id: product.shopId,
        product_id: product.id,
        product_title: product.title,
        product_image: product.imageUrl,
        price: product.price,
        status: 'pending',
        created_at: newOrder.createdAt
      }]);
    }
  };

  const addCategory = async (name: string) => {
    if (user?.role !== 'admin') return;
    const newCat = { id: Math.random().toString(), name };
    setCategories(prev => [...prev, newCat]);
    if (supabase) {
        await supabase.from('categories').insert([{ name }]);
    }
  };

  const removeCategory = async (id: string) => {
    if (user?.role !== 'admin') return;
    setCategories(prev => prev.filter(c => c.id !== id));
    if (supabase) {
        await supabase.from('categories').delete().eq('id', id);
    }
  };

  const sendMessage = async (productId: string, text: string, guestInfo?: { id: string, name: string }) => {
    const senderId = user ? user.id : guestInfo?.id;
    const senderName = user ? user.name : guestInfo?.name;

    if (!senderId || !senderName) return;

    const msg: ChatMessage = {
      id: Math.random().toString(),
      productId,
      senderId,
      senderName,
      text,
      timestamp: new Date().toISOString()
    };
    setChats(prev => [...prev, msg]);
    
    if (supabase) {
        await supabase.from('chat_messages').insert([{
            product_id: productId,
            sender_id: senderId,
            sender_name: senderName,
            text,
            created_at: msg.timestamp
        }]);
    }
  };

  const upgradePlan = async (planId: string) => {
    if (!user) return;
    
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return;

    let additionalDays = plan.durationDays;
    if (user.plan === 'free_trial' || !user.plan) {
        additionalDays += 30; // 30 days bonus/free
    }

    const newExpiration = new Date(Date.now() + additionalDays * 24 * 60 * 60 * 1000).toISOString();

    const updatedUser = { 
        ...user, 
        plan: planId as any, 
        planExpiresAt: newExpiration 
    };

    setUser(updatedUser);
    
    // Update local shops list
    setShops(prev => prev.map(s => s.id === user.id ? updatedUser : s));

    if (supabase) {
        await supabase.from('profiles').update({
            plan: planId,
            plan_expires_at: newExpiration
        }).eq('id', user.id);
    }
  };

  return (
    <StoreContext.Provider value={{
      user, products, categories, shops, chats, orders, isLoading,
      login, logout, updateUser, addProduct, likeProduct, viewProduct, buyProduct,
      addCategory, removeCategory, sendMessage, upgradePlan,
      isSupabaseConnected: !!supabase
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
