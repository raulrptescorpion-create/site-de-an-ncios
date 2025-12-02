
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { 
  ShoppingBag, User as UserIcon, LogOut, PlusCircle, 
  Store, MessageCircle, Heart, Eye, Menu, X, Trash2, MapPin, Clock, Phone,
  Image as ImageIcon, Loader2, TrendingUp, DollarSign, Package, Search, AlertTriangle, Lock,
  CreditCard, Check, Calendar, Timer, Upload, FileText, QrCode, Smartphone, Send, Mail, Edit,
  Navigation, Volume2, VolumeX, Bell, BellOff, Database
} from 'lucide-react';
import { PLANS, PLACEHOLDER_IMG, APP_NAME } from './constants';
import { Product, User, Plan } from './types';

// --- Helper for Sound ---
const playSuccessSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    oscillator.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.1); // C6
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    oscillator.frequency.linearRampToValueAtTime(440, audioCtx.currentTime + 0.1); // A4
    
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

// --- Helper for Distance (Haversine Formula) ---
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// --- Components ---

const Navbar = () => {
  const { user, logout } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-akira-black border-b border-akira-gray sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-display font-bold text-akira-yellow tracking-wider">
              {APP_NAME}
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-300 hover:text-akira-yellow transition">Marketplace</Link>
            <Link to="/shops" className="text-gray-300 hover:text-akira-yellow transition">Lojas</Link>
            
            {user ? (
              <>
                {user.role === 'shop' && (
                  <>
                    <Link to="/dashboard" className="flex items-center text-gray-300 hover:text-akira-yellow transition">
                      Painel Loja
                    </Link>
                    <Link to="/dashboard?tab=add" className="flex items-center text-akira-yellow hover:text-yellow-400 transition font-bold border border-akira-yellow rounded px-3 py-1 hover:bg-akira-yellow hover:text-black">
                      <PlusCircle className="w-4 h-4 mr-1" /> Adicionar Item
                    </Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-red-400 hover:text-red-300">Admin</Link>
                )}
                <div className="flex items-center space-x-2 text-sm text-gray-400 border-l border-gray-700 pl-4">
                  <UserIcon className="w-4 h-4" />
                  <Link to="/dashboard" className="hover:text-white transition">{user.shopName || user.name}</Link>
                  <button onClick={logout} className="ml-4 text-gray-500 hover:text-white">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="bg-akira-yellow text-black px-4 py-2 rounded font-bold hover:bg-akira-yellowHover transition">
                Acesso Loja
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-akira-dark border-b border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             <Link to="/" className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded">Marketplace</Link>
             <Link to="/shops" className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded">Lojas</Link>
             {user ? (
               <>
                {user.role === 'shop' && (
                  <>
                    <Link to="/dashboard" className="block px-3 py-2 text-gray-300">Painel Loja</Link>
                    <Link to="/dashboard?tab=add" className="block px-3 py-2 text-akira-yellow font-bold">Adicionar Item</Link>
                  </>
                )}
                {user.role === 'admin' && <Link to="/admin" className="block px-3 py-2 text-red-400">Admin</Link>}
                <Link to="/dashboard" className="block px-3 py-2 text-gray-300">Meu Perfil</Link>
                <button onClick={logout} className="block w-full text-left px-3 py-2 text-gray-400">Sair</button>
               </>
             ) : (
               <Link to="/login" className="block px-3 py-2 text-akira-yellow">Acesso Loja</Link>
             )}
          </div>
        </div>
      )}
    </nav>
  );
};

const ProductCard: React.FC<{ product: Product, onClick: () => void }> = ({ product, onClick }) => {
  const { likeProduct } = useStore();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    likeProduct(product.id);
  };

  return (
    <div 
      onClick={onClick}
      className="bg-akira-card rounded-lg overflow-hidden border border-gray-800 hover:border-akira-yellow transition duration-300 cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden bg-gray-900">
        <img 
          src={product.imageUrl || PLACEHOLDER_IMG} 
          alt={product.title} 
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
        />
        <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-akira-yellow font-bold backdrop-blur-sm">
          {product.category}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-white truncate">{product.title}</h3>
        <p className="text-sm text-gray-400 truncate">{product.shopName}</p>
        
        {/* Brand/Model Display */}
        {(product.brand || product.model) && (
           <div className="mt-2 flex items-center flex-wrap gap-2">
             {product.brand && <span className="bg-gray-800 border border-gray-700 text-gray-300 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">{product.brand}</span>}
             {product.model && <span className="text-xs text-gray-500">{product.model}</span>}
           </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-display font-bold text-akira-yellow">
            R$ {product.price.toFixed(2)}
          </span>
          <div className="flex items-center space-x-3 text-gray-500 text-sm">
            <span className="flex items-center"><Eye className="w-3 h-3 mr-1" /> {product.views}</span>
            <button onClick={handleLike} className="flex items-center hover:text-red-500 transition">
              <Heart className="w-3 h-3 mr-1" /> {product.likes}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShopCard: React.FC<{ shop: User }> = ({ shop }) => (
  <div className="bg-akira-card p-6 rounded-lg border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
    <div className="flex items-center gap-4">
      {/* Logo Display */}
      <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-700 bg-gray-900 flex-shrink-0">
        {shop.logoUrl ? (
          <img src={shop.logoUrl} alt={shop.shopName} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Store className="w-8 h-8 text-gray-600" />
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-display font-bold text-white mb-1">{shop.shopName || shop.name}</h3>
        <p className="text-gray-400 text-sm mb-2">{shop.neighborhood}</p>
        
        <div className="space-y-1 text-sm text-gray-300">
          <div className="flex items-center">
            <MapPin className="w-3 h-3 text-akira-yellow mr-2" />
            {shop.address || 'Endereço não informado'}
          </div>
          <div className="flex items-center">
            <Clock className="w-3 h-3 text-akira-yellow mr-2" />
            {shop.openTime} - {shop.closeTime}
          </div>
        </div>
      </div>
    </div>
    <div className="bg-gray-800 px-4 py-2 rounded-full border border-gray-700 self-start md:self-center">
       <span className="text-xs text-akira-yellow font-bold uppercase tracking-widest">Loja Anunciante</span>
    </div>
  </div>
);

const ChatModal: React.FC<{ product: Product, onClose: () => void }> = ({ product, onClose }) => {
  const { user, chats, sendMessage, shops } = useStore();
  const [msg, setMsg] = useState("");
  const [guestId] = useState(() => localStorage.getItem('chatGuestId') || 'guest_' + Math.random().toString(36).substr(2, 9));
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Geolocation State
  const [distance, setDistance] = useState<string | null>(null);
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Persist Guest ID
    if (!localStorage.getItem('chatGuestId')) {
      localStorage.setItem('chatGuestId', guestId);
    }

    // Get Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLoc({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }, (error) => {
        console.log("Geolocation error or denied:", error);
      });
    }
  }, []);

  const shop = shops.find(s => s.id === product.shopId);

  // Calculate Distance Effect
  useEffect(() => {
    if (userLoc && shop && shop.lat && shop.lng) {
      const dist = getDistanceFromLatLonInKm(userLoc.lat, userLoc.lng, shop.lat, shop.lng);
      setDistance(dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`);
    }
  }, [userLoc, shop]);
  
  const productChats = chats.filter(c => c.productId === product.id);

  // Determine Sender ID for logic
  const myId = user ? user.id : guestId;
  const myName = user ? (user.name || 'Eu') : 'Visitante';

  // Sound Effect for New Messages
  const prevChatsLength = useRef(productChats.length);
  useEffect(() => {
    if (productChats.length > prevChatsLength.current) {
        const lastMsg = productChats[productChats.length - 1];
        if (lastMsg.senderId !== myId && soundEnabled) {
            playNotificationSound();
        }
    }
    prevChatsLength.current = productChats.length;
  }, [productChats, myId, soundEnabled]);


  const handleSend = () => {
    if (!msg.trim()) return;
    sendMessage(product.id, msg, { id: myId, name: myName });
    setMsg("");
  };

  const toggleSound = () => {
      const newState = !soundEnabled;
      setSoundEnabled(newState);
      if(newState) playNotificationSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-akira-card w-full max-w-md rounded-lg border border-gray-700 shadow-2xl flex flex-col h-[600px] max-h-[90vh]">
        {/* Product Summary Header */}
        <div className="p-4 border-b border-gray-700 bg-akira-dark rounded-t-lg flex justify-between items-start">
          <div className="flex gap-3">
             <div className="w-12 h-12 rounded overflow-hidden bg-gray-900 flex-shrink-0">
               <img src={product.imageUrl} loading="lazy" className="w-full h-full object-cover" />
             </div>
             <div>
               <h3 className="font-bold text-white text-sm line-clamp-1">{product.title}</h3>
               <p className="text-xs text-akira-yellow font-bold">R$ {product.price.toFixed(2)}</p>
               <p className="text-xs text-gray-500">{product.shopName}</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleSound} className="text-gray-400 hover:text-akira-yellow transition">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
          </div>
        </div>
        
        {/* Messages / Details Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0f0f0f]">
          
          {/* Shop Address & Distance Display */}
          {shop && (
              <div className="bg-gray-800/50 p-3 rounded border border-gray-700 mb-4">
                  <h4 className="text-akira-yellow font-bold text-xs uppercase mb-2 flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> Endereço da Loja
                  </h4>
                  <p className="text-white text-sm font-bold">{shop.address || 'Endereço não informado'}</p>
                  <p className="text-gray-400 text-xs">{shop.neighborhood}</p>
                  <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-4">
                       <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {shop.openTime} às {shop.closeTime}</span>
                       {distance && (
                         <span className="flex items-center gap-1 text-green-400 font-bold bg-green-900/20 px-2 py-0.5 rounded border border-green-900/50">
                           <Navigation className="w-3 h-3" /> {distance} de você
                         </span>
                       )}
                  </div>
              </div>
          )}

          {/* Technical Details Block */}
          {(product.brand || product.model) && (
            <div className="grid grid-cols-2 gap-2 mb-4 mt-2">
              {product.brand && (
                <div className="bg-gray-900/80 p-2 rounded border border-gray-800">
                  <span className="text-[10px] text-gray-500 uppercase block">Marca</span>
                  <span className="text-sm font-bold text-white">{product.brand}</span>
                </div>
              )}
              {product.model && (
                <div className="bg-gray-900/80 p-2 rounded border border-gray-800">
                  <span className="text-[10px] text-gray-500 uppercase block">Modelo</span>
                  <span className="text-sm font-bold text-white">{product.model}</span>
                </div>
              )}
              <div className="bg-gray-900/80 p-2 rounded border border-gray-800 col-span-2">
                  <span className="text-[10px] text-gray-500 uppercase block">Categoria</span>
                  <span className="text-sm font-bold text-white">{product.category}</span>
              </div>
            </div>
          )}

          {product.description && (
            <div className="bg-gray-900/50 p-3 rounded text-xs text-gray-400 mb-4 border border-gray-800">
               <span className="font-bold text-gray-300 block mb-1">Descrição:</span>
               {product.description}
            </div>
          )}

          <div className="border-t border-gray-800 pt-3">
             <p className="text-xs text-gray-500 font-bold mb-2 flex items-center gap-2">
                 Chat com a Loja 
                 {soundEnabled && <span className="text-[10px] text-green-500 font-normal bg-green-900/20 px-1 rounded">Som Ativo</span>}
             </p>
             {productChats.length === 0 && <p className="text-center text-gray-600 text-sm mt-2">Envie uma mensagem para negociar.</p>}
          </div>
          
          {productChats.map(c => (
            <div key={c.id} className={`flex ${c.senderId === myId ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-xl text-sm ${c.senderId === myId ? 'bg-akira-yellow text-black rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none'}`}>
                <p className="font-bold text-[10px] mb-1 opacity-70 uppercase">{c.senderName}</p>
                {c.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area - Open to everyone now */}
        <div className="p-4 border-t border-gray-700 bg-akira-dark rounded-b-lg">
          <div className="flex space-x-2">
            <input 
              value={msg} 
              onChange={e => setMsg(e.target.value)}
              className="flex-1 bg-black border border-gray-700 rounded-full px-4 py-2 text-white focus:outline-none focus:border-akira-yellow text-sm"
              placeholder="Digite sua dúvida..."
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="bg-akira-yellow text-black p-2 rounded-full hover:bg-yellow-500 flex-shrink-0 w-10 h-10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentModal: React.FC<{ plan: Plan, onClose: () => void, onConfirm: () => void }> = ({ plan, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'card' | 'pix'>('card');
  
  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
        setLoading(false);
        onConfirm();
    }, 2000);
  };

  const nextChargeDate = new Date();
  nextChargeDate.setDate(nextChargeDate.getDate() + 30); // 30 days free trial

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
        <div className="bg-akira-card w-full max-w-md rounded-lg border border-gray-700 shadow-2xl p-6 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X /></button>
            
            <h2 className="text-2xl font-display font-bold text-white mb-2">Checkout Seguro</h2>
            <p className="text-sm text-gray-400 mb-6">Assinando plano <strong>{plan.name}</strong> por <span className="text-akira-yellow">R$ {plan.price.toFixed(2)}</span></p>

            <div className="flex gap-2 mb-6">
               <button 
                onClick={() => setMethod('card')}
                className={`flex-1 py-2 text-sm font-bold rounded border ${method === 'card' ? 'bg-akira-yellow text-black border-akira-yellow' : 'bg-transparent text-gray-400 border-gray-700'}`}
               >
                 Cartão de Crédito
               </button>
               <button 
                onClick={() => setMethod('pix')}
                className={`flex-1 py-2 text-sm font-bold rounded border ${method === 'pix' ? 'bg-akira-yellow text-black border-akira-yellow' : 'bg-transparent text-gray-400 border-gray-700'}`}
               >
                 PIX
               </button>
            </div>
            
            {method === 'card' ? (
                <>
                <div className="bg-yellow-900/30 border border-yellow-700/50 p-3 rounded mb-6 flex items-start gap-3">
                    <Timer className="w-5 h-5 text-akira-yellow flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-akira-yellow font-bold text-sm">30 Dias Grátis!</p>
                        <p className="text-xs text-yellow-200/80">
                            Cadastre seu cartão para validar. A cobrança só ocorre em {nextChargeDate.toLocaleDateString()}.
                        </p>
                    </div>
                </div>

                <form onSubmit={handlePay} className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Número do Cartão</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                            <input required placeholder="0000 0000 0000 0000" className="w-full bg-black border border-gray-700 rounded p-2 pl-9 text-white focus:border-akira-yellow focus:outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Validade</label>
                            <input required placeholder="MM/AA" className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-akira-yellow focus:outline-none" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">CVV</label>
                            <input required placeholder="123" maxLength={3} className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-akira-yellow focus:outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome do Titular</label>
                        <input required placeholder="Como no cartão" className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-akira-yellow focus:outline-none" />
                    </div>

                    <div className="pt-4">
                        <button disabled={loading} className="w-full bg-akira-yellow text-black font-bold py-3 rounded hover:bg-yellow-500 transition flex justify-center items-center gap-2">
                            {loading ? <Loader2 className="animate-spin" /> : <>Assinar e Ganhar 30 Dias Grátis</>}
                        </button>
                        <p className="text-[10px] text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" /> Pagamento criptografado e seguro.
                        </p>
                    </div>
                </form>
                </>
            ) : (
                <div className="text-center animate-fadeIn">
                   <div className="bg-white p-4 rounded-lg inline-block mb-4">
                      <QrCode className="w-32 h-32 text-black" />
                   </div>
                   <p className="text-sm text-gray-300 mb-4">Escaneie o QR Code ou use a chave abaixo:</p>
                   
                   <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg text-left space-y-2 mb-6">
                      <div>
                        <span className="text-xs text-gray-500 uppercase block">Chave CPF</span>
                        <div className="flex justify-between items-center">
                           <span className="text-akira-yellow font-mono text-lg font-bold">114.657.887-35</span>
                           <button className="text-xs text-gray-400 hover:text-white" onClick={() => navigator.clipboard.writeText('11465788735')}>Copiar</button>
                        </div>
                      </div>
                      <div className="border-t border-gray-800 pt-2">
                        <span className="text-xs text-gray-500 uppercase block">Beneficiário</span>
                        <span className="text-white font-bold">Raul Armando Lacerda</span>
                      </div>
                      <div className="border-t border-gray-800 pt-2">
                        <span className="text-xs text-gray-500 uppercase block">Banco</span>
                        <span className="text-white font-bold">PagSeguro</span>
                      </div>
                   </div>

                   <button onClick={onConfirm} className="w-full bg-akira-yellow text-black font-bold py-3 rounded hover:bg-yellow-500 transition">
                      Já fiz o pagamento
                   </button>
                   <p className="text-xs text-gray-500 mt-4">
                      Envie o comprovante na aba <strong>Financeiro</strong> após o pagamento.
                   </p>
                </div>
            )}
        </div>
    </div>
  );
};


// --- Pages ---

const HomePage = () => {
  const { products, categories, viewProduct } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const filtered = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      p.title.toLowerCase().includes(query) ||
      (p.brand?.toLowerCase().includes(query)) ||
      (p.model?.toLowerCase().includes(query));
    
    return matchesCategory && matchesSearch;
  });

  const handleProductClick = (p: Product) => {
    viewProduct(p.id);
    setViewingProduct(p);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero / Categories / Search */}
      <div className="bg-akira-dark border-b border-gray-800 pt-6 pb-4 px-4 sticky top-16 z-40 shadow-lg">
        
        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome do item, marca ou modelo..."
            className="w-full bg-black border border-gray-800 rounded-full py-2.5 pl-10 pr-4 text-white focus:border-akira-yellow focus:outline-none placeholder-gray-600 focus:ring-1 focus:ring-akira-yellow transition-all"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${selectedCategory === 'all' ? 'bg-akira-yellow text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${selectedCategory === cat.name ? 'bg-akira-yellow text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Nenhum item encontrado.</p>
            {searchQuery && <p className="text-sm mt-2">Sua busca por "{searchQuery}" não retornou resultados.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onClick={() => handleProductClick(p)} />
            ))}
          </div>
        )}
      </div>

      {viewingProduct && (
        <ChatModal product={viewingProduct} onClose={() => setViewingProduct(null)} />
      )}
    </div>
  );
};

const ShopsPage = () => {
  const { shops } = useStore();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
          <h2 className="text-3xl font-display font-bold text-white border-l-4 border-akira-yellow pl-4">Lojas Anunciantes</h2>
          <span className="bg-gray-800 text-akira-yellow border border-gray-700 px-3 py-1 rounded-full text-sm font-bold shadow-lg shadow-yellow-900/10">
            {shops.length} {shops.length === 1 ? 'Loja' : 'Lojas'}
          </span>
      </div>
      <div className="grid gap-6">
        {shops.map(shop => <ShopCard key={shop.id} shop={shop} />)}
      </div>
    </div>
  );
};

const UserProfile = () => {
  const { user, orders, isLoading } = useStore();
  
  if (isLoading) return <div className="min-h-screen flex justify-center items-center text-white"><Loader2 className="animate-spin" /></div>;
  if (!user) return <Navigate to="/login" />;

  // Even though buy is removed, we show history for potential legacy/future orders
  const myOrders = orders.filter(o => o.buyerId === user.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen">
      <div className="bg-akira-card p-6 rounded-lg border border-gray-800 mb-8 flex items-center gap-4">
        <div className="bg-gray-700 p-4 rounded-full">
          <UserIcon className="w-8 h-8 text-akira-yellow" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-gray-400">{user.email}</p>
          <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300 mt-2 inline-block capitalize">{user.role}</span>
        </div>
      </div>

      {myOrders.length > 0 && (
        <>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ShoppingBag className="text-akira-yellow" /> Histórico de Negociações
        </h2>
        <div className="space-y-4">
            {myOrders.map(order => (
                <div key={order.id} className="bg-akira-card p-4 rounded-lg border border-gray-800 flex flex-col md:flex-row gap-4 items-center">
                <div className="w-16 h-16 bg-gray-900 rounded overflow-hidden flex-shrink-0">
                    <img src={order.productImage} alt={order.productTitle} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 w-full text-center md:text-left">
                    <h3 className="font-bold text-white">{order.productTitle}</h3>
                    <p className="text-xs text-gray-500">Pedido #{order.id} • {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-akira-yellow">R$ {order.price.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                        order.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                        order.status === 'sent' ? 'bg-blue-900 text-blue-200' :
                        'bg-green-900 text-green-200'
                    }`}>
                        {order.status === 'pending' ? 'Pendente' : order.status === 'sent' ? 'Enviado' : 'Entregue'}
                    </span>
                </div>
                </div>
            ))}
        </div>
        </>
      )}
    </div>
  );
};

const LoginPage = () => {
  const { login, isLoading } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  const role = 'shop'; // Always 'shop' now
  
  // Unified Phone Auth State for both roles
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [sentCode, setSentCode] = useState(false);
  const [verified, setVerified] = useState(false);

  // Shop Info & Email (Registration only)
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('18:00');
  const [logoUrl, setLogoUrl] = useState('');
  const [shopEmail, setShopEmail] = useState('');
  const [shopEmailCode, setShopEmailCode] = useState('');
  const [shopEmailSent, setShopEmailSent] = useState(false);
  const [shopEmailVerified, setShopEmailVerified] = useState(false);

  // RESET state when switching
  useEffect(() => {
    setPhone(''); setSmsCode(''); setSentCode(false); setVerified(false);
    setShopEmail(''); setShopEmailCode(''); setShopEmailSent(false); setShopEmailVerified(false);
  }, [isRegister]);

  // Unified SMS Logic
  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setSentCode(true);
    // Simulating SMS arrival by showing it on UI, avoiding blocked alerts
  };

  const handleVerifySms = (e: React.FormEvent) => {
    e.preventDefault();
    if (smsCode === '1234') {
        setVerified(true);
        // Login immediately if Existing Shop
        if (role === 'shop' && !isRegister) {
            // Using phone as "email/ID"
            login(phone, role);
            setTimeout(() => window.location.hash = '/', 500);
        }
    } else {
        alert('Código SMS incorreto. Use 1234.');
    }
  };

  // Shop Email Verification (Only for Registration)
  const handleSendShopEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!shopEmail) return;
    setShopEmailSent(true);
  };

  const handleVerifyShopEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    if (shopEmailCode === '5555') {
        setShopEmailVerified(true);
        playSuccessSound();
    } else {
        alert('Código de email incorreto. Use 5555.');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verified) return alert('Verifique seu telefone.');
    if (!shopEmailVerified) return alert('Verifique seu email.');
    
    const shopData = {
        shopName, address, phone, neighborhood, openTime, closeTime, logoUrl, email: shopEmail
    };
    login(phone, role, shopData);
    setTimeout(() => window.location.hash = '/', 500); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="bg-akira-card border border-gray-800 p-8 rounded-lg shadow-2xl max-w-md w-full">
        <h2 className="text-2xl font-display font-bold text-center text-white mb-6">
          {isRegister ? 'Criar Loja Anunciante' : 'Acesso Loja Anunciante'}
        </h2>
        
        {/* Removed Role Toggle - Shop Only */}

        {/* --- FORM FOR BOTH ROLES --- */}
        <div className="space-y-4 animate-fadeIn">
            
            {/* Step 1: Phone Input & Verification */}
            {!verified && (
                <div className="space-y-4">
                    <div className="text-center mb-4">
                            <div className="bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Store className="text-white w-6 h-6" />
                            </div>
                            <p className="text-sm text-gray-300">Acesse com seu número de celular</p>
                    </div>

                    {!sentCode ? (
                        <form onSubmit={handleSendSms} className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Celular / WhatsApp</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                                    <input 
                                        type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                                        className="w-full bg-black border border-gray-700 rounded p-2 pl-9 text-white focus:border-akira-yellow focus:outline-none"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>
                            <button className="w-full bg-akira-yellow text-black font-bold py-3 rounded hover:bg-yellow-500 transition flex justify-center items-center gap-2">
                                Enviar Código SMS <Send className="w-4 h-4" />
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifySms} className="space-y-4">
                            {/* SIMULATED SMS NOTIFICATION */}
                            <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-lg text-center animate-pulse">
                                <p className="text-xs text-blue-300 uppercase font-bold mb-1">Simulação de SMS</p>
                                <p className="text-white">Seu código de verificação é:</p>
                                <p className="text-3xl font-mono font-bold text-akira-yellow my-2 tracking-widest">1234</p>
                            </div>

                            <div className="text-center">
                                <p className="text-xs text-gray-400 mb-2">Digite o código enviado para <span className="text-white">{phone}</span></p>
                                <button type="button" onClick={() => setSentCode(false)} className="text-[10px] text-akira-yellow underline mb-4">Alterar número</button>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Código de 4 Dígitos</label>
                                <input 
                                    type="text" required value={smsCode} onChange={e => setSmsCode(e.target.value)} maxLength={4}
                                    className="w-full bg-black border border-gray-700 rounded p-2 text-center text-xl tracking-widest text-white focus:border-akira-yellow focus:outline-none"
                                    placeholder="0000"
                                />
                            </div>
                            <button className="w-full bg-akira-yellow text-black font-bold py-3 rounded hover:bg-yellow-500 transition">
                                Verificar e {isRegister ? 'Continuar' : 'Acessar'}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Step 2: Shop Registration Details (Only if Verified and Registering as Shop) */}
            {verified && isRegister && role === 'shop' && (
                <form onSubmit={handleSubmitShop} className="space-y-4 pt-4 border-t border-gray-800 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-2 text-green-500 text-sm font-bold justify-center mb-4">
                        <Check className="w-4 h-4" /> Telefone Verificado
                    </div>
                    
                    <p className="text-akira-yellow text-xs font-bold uppercase tracking-widest mb-2">Dados da Loja Anunciante</p>
                    
                    {/* Email Verification Section for Shop */}
                    <div className="bg-gray-900 p-3 rounded border border-gray-700 mb-4">
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Email Comercial</label>
                        <div className="flex gap-2 mb-2">
                            <input 
                                type="email" required 
                                className="flex-1 bg-black border border-gray-700 rounded p-2 text-white text-sm" 
                                value={shopEmail} onChange={e => setShopEmail(e.target.value)}
                                disabled={shopEmailVerified}
                                placeholder="loja@email.com"
                            />
                            {!shopEmailVerified && (
                                <button 
                                    type="button"
                                    onClick={handleSendShopEmail} 
                                    className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 rounded whitespace-nowrap"
                                >
                                    {shopEmailSent ? 'Reenviar' : 'Verificar'}
                                </button>
                            )}
                        </div>
                        
                        {shopEmailSent && !shopEmailVerified && (
                            <div className="animate-fadeIn">
                                <div className="bg-blue-900/20 border border-blue-800 p-2 rounded mb-3 text-center">
                                    <p className="text-[10px] text-blue-300">Código de Teste: <span className="text-white font-bold text-sm">5555</span></p>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <input 
                                        type="text" maxLength={4} placeholder="Cód." 
                                        className="w-20 bg-black border border-gray-700 rounded p-2 text-white text-center text-sm"
                                        value={shopEmailCode} onChange={e => setShopEmailCode(e.target.value)}
                                    />
                                    <button 
                                        type="button"
                                        onClick={handleVerifyShopEmail}
                                        className="bg-akira-yellow text-black text-xs px-3 py-2 rounded font-bold hover:bg-yellow-500"
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        )}

                        {shopEmailVerified && (
                            <p className="text-green-500 text-xs flex items-center gap-1 font-bold">
                                <Check className="w-3 h-3" /> Email verificado com sucesso
                            </p>
                        )}
                    </div>

                    <input placeholder="Nome da Loja" required className="w-full bg-black border border-gray-700 rounded p-2 text-white" value={shopName} onChange={e => setShopName(e.target.value)} />
                    <input placeholder="Bairro" required className="w-full bg-black border border-gray-700 rounded p-2 text-white" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} />
                    <input placeholder="Endereço Completo" required className="w-full bg-black border border-gray-700 rounded p-2 text-white" value={address} onChange={e => setAddress(e.target.value)} />
                    
                    <div className="flex space-x-2">
                        <div className="w-1/2">
                            <label className="text-[10px] text-gray-500">Abertura</label>
                            <input type="time" required className="w-full bg-black border border-gray-700 rounded p-2 text-white" value={openTime} onChange={e => setOpenTime(e.target.value)} />
                        </div>
                        <div className="w-1/2">
                            <label className="text-[10px] text-gray-500">Fechamento</label>
                            <input type="time" required className="w-full bg-black border border-gray-700 rounded p-2 text-white" value={closeTime} onChange={e => setCloseTime(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500">Adicionar Logo</label>
                        <div className="border border-gray-700 rounded p-2 bg-black flex items-center justify-center cursor-pointer hover:border-akira-yellow transition relative">
                            <input 
                              type="file" 
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              onChange={handleLogoUpload}
                            />
                            {logoUrl ? (
                              <div className="flex items-center gap-2">
                                <img src={logoUrl} alt="Logo Preview" loading="lazy" className="w-8 h-8 object-cover rounded" />
                                <span className="text-xs text-green-500 font-bold">Logo Carregada</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-500">
                                <Upload className="w-4 h-4" />
                                <span className="text-xs">Clique para enviar logo</span>
                              </div>
                            )}
                        </div>
                    </div>

                    <button disabled={isLoading || !shopEmailVerified} className="w-full bg-akira-yellow text-black font-bold py-3 rounded hover:bg-yellow-500 transition mt-4 disabled:opacity-50 disabled:bg-gray-700 disabled:text-gray-500">
                        {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Finalizar Cadastro'}
                    </button>
                </form>
            )}
        </div>

        {/* Footer Toggle */}
        <p className="text-center text-sm text-gray-400 mt-6 cursor-pointer hover:text-white" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Já possui conta? Fazer Login.' : 'Não tem conta? Cadastrar Loja.'}
        </p>
      </div>
    </div>
  );
};

const ShopDashboard = () => {
  const { user, addProduct, categories, products, orders, isLoading, upgradePlan, updateUser } = useStore();
  const [activeTab, setActiveTab] = useState<'products'|'add'|'subscription'|'analytics'|'financial'|'profile'>('products');
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<Plan | null>(null);
  const location = useLocation();

  // Individual product sound settings (mocked state for session)
  const [mutedProducts, setMutedProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'add') {
      setActiveTab('add');
    }
  }, [location]);
  
  // Product Form
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || '');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form (Initialize with user data)
  const [profileName, setProfileName] = useState(user?.shopName || user?.name || '');
  const [profileAddress, setProfileAddress] = useState(user?.address || '');
  const [profileNeighborhood, setProfileNeighborhood] = useState(user?.neighborhood || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || user?.email || '');
  const [profileOpen, setProfileOpen] = useState(user?.openTime || '09:00');
  const [profileClose, setProfileClose] = useState(user?.closeTime || '18:00');
  const [profileLogo, setProfileLogo] = useState(user?.logoUrl || '');

  // Update profile form state when user changes (e.g. initial load)
  useEffect(() => {
      if(user) {
          setProfileName(user.shopName || user.name || '');
          setProfileAddress(user.address || '');
          setProfileNeighborhood(user.neighborhood || '');
          setProfilePhone(user.phone || user.email || ''); // Fallback to email/ID if phone missing
          setProfileOpen(user.openTime || '09:00');
          setProfileClose(user.closeTime || '18:00');
          setProfileLogo(user.logoUrl || '');
      }
  }, [user]);

  // Financial Form
  const [proofFile, setProofFile] = useState<string>('');
  const [proofMessage, setProofMessage] = useState('');

  if (isLoading) return <div className="min-h-screen flex justify-center items-center text-white"><Loader2 className="animate-spin" /></div>;
  if (!user || user.role !== 'shop') return <Navigate to="/" />;

  const myProducts = products.filter(p => p.shopId === user.id);
  const myOrders = orders.filter(o => o.shopId === user.id);

  // Plan Calculation
  const currentPlanId = user.plan || 'free_trial';
  const planInfo = PLANS.find(p => p.id === currentPlanId) || { name: 'Período Gratuito', itemLimit: 20, price: 0, durationDays: 30, description: 'Plano inicial' };
  const itemsUsed = myProducts.length;
  const itemsLimit = planInfo.itemLimit;
  const isLimitReached = itemsLimit !== -1 && itemsUsed >= itemsLimit;
  const isNearLimit = itemsLimit !== -1 && !isLimitReached && (itemsLimit - itemsUsed <= 5);

  // Expiration Calculation
  let daysUntilExpiration = 0;
  if (user.planExpiresAt) {
      const today = new Date();
      const expireDate = new Date(user.planExpiresAt);
      const diffTime = expireDate.getTime() - today.getTime();
      daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  const isExpired = daysUntilExpiration < 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) return;

    await addProduct({ 
      title, 
      price: parseFloat(price), 
      imageUrl: image || PLACEHOLDER_IMG, // Use uploaded or placeholder
      category,
      description,
      brand,
      model
    });

    // Reset Form
    setTitle(''); setPrice(''); setImage(''); setDescription(''); setBrand(''); setModel('');
    if(fileInputRef.current) fileInputRef.current.value = '';
    
    // Play Sound
    playSuccessSound();
    // Switch to list
    setActiveTab('products');
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      await updateUser({
          shopName: profileName,
          name: profileName, // Sync generic name
          address: profileAddress,
          neighborhood: profileNeighborhood,
          phone: profilePhone,
          openTime: profileOpen,
          closeTime: profileClose,
          logoUrl: profileLogo
      });
      alert('Perfil atualizado com sucesso!');
      playSuccessSound();
  };
  
  const handleProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, send proofFile and proofMessage to backend
    setProofFile('');
    setProofMessage('');
    alert('Comprovante enviado com sucesso! Aguarde a validação do administrador.');
    playSuccessSound();
  };

  const handlePaymentSuccess = async () => {
    if (selectedPlanForPayment) {
        await upgradePlan(selectedPlanForPayment.id);
        setSelectedPlanForPayment(null);
        playSuccessSound();
        // Optional: show a success toast or alert
    }
  };

  // Toggle sound for specific product
  const toggleProductSound = (id: string) => {
     const newMuted = new Set(mutedProducts);
     if (newMuted.has(id)) {
         newMuted.delete(id);
         playNotificationSound(); // Play sound to confirm UNMUTE
     } else {
         newMuted.add(id);
     }
     setMutedProducts(newMuted);
  };

  // Analytics
  // Removed Sales and Orders KPI logic as requested
  const totalViews = myProducts.reduce((acc, curr) => acc + curr.views, 0);
  const totalLikes = myProducts.reduce((acc, curr) => acc + curr.likes, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      
      {/* Expiration Banner */}
      {!isExpired && daysUntilExpiration <= 7 && (
         <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-200 p-4 rounded-lg mb-6 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
               <Timer className="w-5 h-5" />
               <span className="font-bold">Atenção: Seu plano expira em {daysUntilExpiration} dias!</span>
            </div>
            <button onClick={() => setActiveTab('subscription')} className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm font-bold">Renovar Agora</button>
         </div>
      )}
      {isExpired && (
         <div className="bg-red-900/40 border border-red-700 text-red-200 p-4 rounded-lg mb-6 flex items-center gap-3">
             <Lock className="w-5 h-5" />
             <span className="font-bold">Seu plano expirou. Renove para continuar vendendo.</span>
         </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-akira-card p-4 rounded-lg border border-gray-800 sticky top-24">
             <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-900 border border-gray-700 mb-3">
                    {user.logoUrl ? (
                        <img src={user.logoUrl} alt="Logo" loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                        <Store className="w-10 h-10 text-gray-500 m-auto mt-4" />
                    )}
                </div>
                <h2 className="font-bold text-white text-lg">{user.shopName || user.name}</h2>
                {/* Phone removed as requested */}
             </div>
             <nav className="space-y-2">
               <button onClick={() => setActiveTab('products')} className={`w-full text-left px-4 py-2 rounded transition flex items-center gap-2 ${activeTab === 'products' ? 'bg-akira-yellow text-black font-bold' : 'text-gray-400 hover:bg-gray-800'}`}>
                 <Package className="w-4 h-4" /> Meus Anúncios
               </button>
               <button onClick={() => setActiveTab('add')} className={`w-full text-left px-4 py-2 rounded transition flex items-center gap-2 ${activeTab === 'add' ? 'bg-akira-yellow text-black font-bold' : 'text-gray-400 hover:bg-gray-800'}`}>
                 <PlusCircle className="w-4 h-4" /> Adicionar Item
               </button>
               <button onClick={() => setActiveTab('analytics')} className={`w-full text-left px-4 py-2 rounded transition flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-akira-yellow text-black font-bold' : 'text-gray-400 hover:bg-gray-800'}`}>
                 <TrendingUp className="w-4 h-4" /> Analytics
               </button>
               <button onClick={() => setActiveTab('subscription')} className={`w-full text-left px-4 py-2 rounded transition flex items-center gap-2 ${activeTab === 'subscription' ? 'bg-akira-yellow text-black font-bold' : 'text-gray-400 hover:bg-gray-800'}`}>
                 <CreditCard className="w-4 h-4" /> Meu Plano
               </button>
               <button onClick={() => setActiveTab('financial')} className={`w-full text-left px-4 py-2 rounded transition flex items-center gap-2 ${activeTab === 'financial' ? 'bg-akira-yellow text-black font-bold' : 'text-gray-400 hover:bg-gray-800'}`}>
                 <DollarSign className="w-4 h-4" /> Financeiro
               </button>
               <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-4 py-2 rounded transition flex items-center gap-2 ${activeTab === 'profile' ? 'bg-akira-yellow text-black font-bold' : 'text-gray-400 hover:bg-gray-800'}`}>
                 <Edit className="w-4 h-4" /> Dados da Loja
               </button>
             </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          
          {activeTab === 'products' && (
             <div>
                <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Meus Anúncios ({myProducts.length})</h2>
                {myProducts.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">Você ainda não tem itens cadastrados.</div>
                ) : (
                    <div className="grid gap-4">
                        {myProducts.map(p => (
                            <div key={p.id} className="bg-akira-card p-4 rounded border border-gray-800 flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-900 rounded overflow-hidden">
                                    <img src={p.imageUrl} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-bold">{p.title}</h3>
                                    <p className="text-sm text-gray-500">R$ {p.price.toFixed(2)} • {p.views} views • {p.likes} likes</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                      onClick={() => toggleProductSound(p.id)}
                                      className={`p-2 rounded border transition ${!mutedProducts.has(p.id) ? 'bg-gray-800 border-gray-600 text-akira-yellow' : 'bg-transparent border-gray-800 text-gray-600'}`}
                                      title={!mutedProducts.has(p.id) ? "Som Ativo" : "Som Mudo"}
                                    >
                                        {!mutedProducts.has(p.id) ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded"><Eye className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
          )}

          {activeTab === 'add' && (
            <div className="bg-akira-card p-6 rounded-lg border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6">Adicionar Item</h2>
              
              {isLimitReached ? (
                 <div className="bg-red-900/20 border border-red-800 p-8 rounded-lg text-center animate-in fade-in zoom-in duration-300">
                    <div className="bg-red-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Limite do Plano Atingido</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      Você atingiu o limite de {itemsLimit} itens do seu plano <strong>{planInfo.name}</strong>. 
                      Para continuar expandindo sua loja, faça um upgrade agora.
                    </p>
                    <button 
                      onClick={() => setActiveTab('subscription')} 
                      className="bg-akira-yellow text-black px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-400 hover:scale-105 transition transform shadow-lg shadow-yellow-900/20"
                    >
                      Fazer Upgrade do Plano
                    </button>
                 </div>
              ) : (
                <>
                {isNearLimit && (
                    <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg mb-6 flex items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-yellow-900/50 p-2 rounded-full">
                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-yellow-200 font-bold">Limite Próximo</p>
                                <p className="text-yellow-400/80 text-sm">
                                    Restam apenas <strong>{itemsLimit - itemsUsed}</strong> vagas para anúncios.
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setActiveTab('subscription')}
                            className="text-xs bg-yellow-900/50 hover:bg-yellow-900 text-yellow-200 px-3 py-1.5 rounded border border-yellow-700/50 transition whitespace-nowrap"
                        >
                            Ver Planos
                        </button>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                    <label className="block text-xs text-gray-400 mb-1">Nome do Item</label>
                    <input required className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-akira-yellow focus:outline-none" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Marca</label>
                            <input className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-akira-yellow focus:outline-none" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Ex: Sony" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Modelo</label>
                            <input className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-akira-yellow focus:outline-none" value={model} onChange={e => setModel(e.target.value)} placeholder="Ex: PS5 Slim" />
                        </div>
                    </div>

                    <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Preço (R$)</label>
                        <input type="number" step="0.01" required className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-akira-yellow focus:outline-none" value={price} onChange={e => setPrice(e.target.value)} />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Categoria</label>
                        <select className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-akira-yellow focus:outline-none" value={category} onChange={e => setCategory(e.target.value)}>
                        {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                        </select>
                    </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Imagem do Produto</label>
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 hover:border-akira-yellow transition-colors group cursor-pointer text-center relative bg-black">
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, setImage)} 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {image ? (
                          <div className="relative w-full h-48">
                            <img src={image} loading="lazy" className="w-full h-full object-contain mx-auto" alt="Preview" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                               <p className="text-white font-bold text-sm">Clique para alterar</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="w-8 h-8 text-gray-500 group-hover:text-akira-yellow mb-2" />
                            <p className="text-gray-400 text-sm">Clique para enviar uma foto</p>
                            <p className="text-gray-600 text-xs mt-1">PNG, JPG até 5MB</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Descrição Detalhada</label>
                        <textarea rows={4} className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-akira-yellow focus:outline-none" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>

                    <button className="w-full bg-akira-yellow text-black font-bold py-3 rounded hover:bg-yellow-500 transition">
                    Publicar Agora
                    </button>
                </form>
                </>
              )}
            </div>
          )}

          {activeTab === 'subscription' && (
              <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Meu Plano</h2>
                  
                  {/* Current Plan Card */}
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700 mb-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                          <CreditCard className="w-32 h-32 text-white" />
                      </div>
                      <div className="relative z-10">
                          <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Plano Atual</p>
                          <h1 className="text-4xl font-display font-bold text-white mb-2">{planInfo.name}</h1>
                          <p className="text-xl text-akira-yellow font-bold mb-6">R$ {planInfo.price.toFixed(2)} <span className="text-xs text-gray-400 font-normal">/ {planInfo.durationDays} dias</span></p>
                          
                          <div className="mb-4">
                              <div className="flex justify-between text-sm text-gray-300 mb-1">
                                  <span>Uso de Anúncios</span>
                                  <span>{itemsUsed} / {itemsLimit === -1 ? 'Ilimitado' : itemsLimit}</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2.5">
                                  <div 
                                    className={`h-2.5 rounded-full ${isLimitReached ? 'bg-red-500' : 'bg-akira-yellow'}`} 
                                    style={{ width: `${itemsLimit === -1 ? 0 : Math.min((itemsUsed / itemsLimit) * 100, 100)}%` }}>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="flex gap-4">
                             <button onClick={() => window.scrollTo(0, 500)} className="bg-white text-black px-4 py-2 rounded font-bold hover:bg-gray-200">Mudar de Plano</button>
                             <button className="text-red-400 hover:text-red-300 px-4 py-2 text-sm">Cancelar Assinatura</button>
                          </div>
                      </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4">Planos Disponíveis</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                      {PLANS.filter(p => p.id !== 'pay_per_item').map(plan => (
                          <div key={plan.id} className={`p-4 rounded border ${user.plan === plan.id ? 'bg-gray-800 border-akira-yellow ring-1 ring-akira-yellow' : 'bg-akira-card border-gray-800'}`}>
                              <h4 className="font-bold text-white text-lg">{plan.name}</h4>
                              <p className="text-2xl font-bold text-akira-yellow my-2">R$ {plan.price.toFixed(2)}</p>
                              <p className="text-xs text-gray-400 mb-4">{plan.description}</p>
                              <ul className="text-sm text-gray-300 space-y-2 mb-4">
                                  <li className="flex items-center"><Check className="w-3 h-3 text-green-500 mr-2" /> {plan.itemLimit} itens</li>
                                  <li className="flex items-center"><Check className="w-3 h-3 text-green-500 mr-2" /> Suporte VIP</li>
                              </ul>
                              <button 
                                onClick={() => setSelectedPlanForPayment(plan)}
                                disabled={user.plan === plan.id}
                                className={`w-full py-2 rounded font-bold text-sm ${user.plan === plan.id ? 'bg-gray-700 text-gray-400 cursor-default' : 'bg-akira-yellow text-black hover:bg-yellow-500'}`}
                              >
                                  {user.plan === plan.id ? 'Plano Atual' : 'Escolher'}
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {activeTab === 'financial' && (
             <div>
                <h2 className="text-2xl font-bold text-white mb-6">Financeiro & Comprovantes</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {/* Info Block */}
                   <div>
                      <div className="bg-akira-card p-6 rounded-lg border border-gray-800 mb-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                           <DollarSign className="text-akira-yellow" /> Dados para Pagamento PIX
                        </h3>
                        <div className="bg-black/50 p-4 rounded border border-gray-700 space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Chave PIX (CPF)</p>
                                <div className="flex justify-between items-center">
                                    <p className="text-xl font-mono text-akira-yellow tracking-wider">11465788735</p>
                                    <button onClick={() => navigator.clipboard.writeText('11465788735')} className="text-xs text-gray-400 hover:text-white">Copiar</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Beneficiário</p>
                                    <p className="text-white font-bold">Raul Armando Lacerda</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Banco</p>
                                    <p className="text-white font-bold">PagSeguro</p>
                                </div>
                            </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-lg">
                         <h4 className="font-bold text-blue-200 mb-2 text-sm">Como funciona?</h4>
                         <ul className="text-xs text-blue-300 space-y-2 list-disc pl-4">
                             <li>Escolha seu plano na aba <strong>Meu Plano</strong>.</li>
                             <li>Faça o PIX para a chave informada acima.</li>
                             <li>Tire um print ou foto do comprovante.</li>
                             <li>Envie o arquivo no formulário ao lado.</li>
                             <li>A liberação ocorre em até 30 minutos após a verificação.</li>
                         </ul>
                      </div>
                   </div>

                   {/* Upload Form */}
                   <div className="bg-akira-card p-6 rounded-lg border border-gray-800 h-fit">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                         <Upload className="text-akira-yellow" /> Enviar Comprovante
                      </h3>
                      
                      <form onSubmit={handleProofSubmit} className="space-y-4">
                         <div>
                            <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Mensagem / Observação</label>
                            <input 
                              value={proofMessage} 
                              onChange={e => setProofMessage(e.target.value)} 
                              className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-akira-yellow focus:outline-none" 
                              placeholder="Ex: Pagamento referente ao Plano Trimestral"
                            />
                         </div>

                         <div>
                            <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Anexo do Comprovante</label>
                            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-akira-yellow transition-colors relative bg-black cursor-pointer">
                                <input 
                                  type="file" 
                                  accept="image/*,application/pdf"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  onChange={(e) => handleImageUpload(e, setProofFile)}
                                />
                                {proofFile ? (
                                    <div className="flex flex-col items-center">
                                       <FileText className="w-10 h-10 text-green-500 mb-2" />
                                       <p className="text-white font-bold text-sm">Arquivo Selecionado</p>
                                       <p className="text-xs text-gray-500">Clique para alterar</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                       <Upload className="w-10 h-10 text-gray-600 mb-2" />
                                       <p className="text-gray-400 text-sm">Clique ou arraste o comprovante</p>
                                       <p className="text-xs text-gray-600 mt-1">JPG, PNG ou PDF</p>
                                    </div>
                                )}
                            </div>
                         </div>
                         
                         <button disabled={!proofFile} className="w-full bg-akira-yellow disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-3 rounded hover:bg-yellow-500 transition mt-2">
                            Enviar para Análise
                         </button>
                      </form>
                   </div>
                </div>
             </div>
          )}
          
          {activeTab === 'profile' && (
              <div className="bg-akira-card p-6 rounded-lg border border-gray-800">
                  <h2 className="text-2xl font-bold text-white mb-6">Dados da Loja</h2>
                  
                  <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-2xl">
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Nome da Loja</label>
                          <input 
                              required 
                              className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-akira-yellow focus:outline-none" 
                              value={profileName} onChange={e => setProfileName(e.target.value)} 
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs text-gray-400 mb-1">Telefone / WhatsApp</label>
                              <input 
                                  className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-akira-yellow focus:outline-none" 
                                  value={profilePhone} onChange={e => setProfilePhone(e.target.value)} 
                              />
                          </div>
                          <div>
                              <label className="block text-xs text-gray-400 mb-1">Bairro</label>
                              <input 
                                  className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-akira-yellow focus:outline-none" 
                                  value={profileNeighborhood} onChange={e => setProfileNeighborhood(e.target.value)} 
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Endereço Completo</label>
                          <input 
                              className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-akira-yellow focus:outline-none" 
                              value={profileAddress} onChange={e => setProfileAddress(e.target.value)} 
                          />
                      </div>

                      <div className="flex space-x-2">
                          <div className="w-1/2">
                              <label className="text-[10px] text-gray-500">Abertura</label>
                              <input 
                                  type="time" 
                                  className="w-full bg-black border border-gray-700 rounded p-2 text-white" 
                                  value={profileOpen} onChange={e => setProfileOpen(e.target.value)} 
                              />
                          </div>
                          <div className="w-1/2">
                              <label className="text-[10px] text-gray-500">Fechamento</label>
                              <input 
                                  type="time" 
                                  className="w-full bg-black border border-gray-700 rounded p-2 text-white" 
                                  value={profileClose} onChange={e => setProfileClose(e.target.value)} 
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Adicionar Logo</label>
                          <div className="border border-gray-700 rounded p-2 bg-black flex items-center justify-center cursor-pointer hover:border-akira-yellow transition relative">
                              <input 
                                type="file" 
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                onChange={(e) => handleImageUpload(e, setProfileLogo)}
                              />
                              {profileLogo ? (
                                <div className="flex items-center gap-2">
                                  <img src={profileLogo} alt="Logo Preview" loading="lazy" className="w-16 h-16 object-cover rounded" />
                                  <span className="text-xs text-green-500 font-bold">Alterar Logo</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-gray-500">
                                  <Upload className="w-4 h-4" />
                                  <span className="text-xs">Clique para enviar logo</span>
                                </div>
                              )}
                          </div>
                      </div>

                      <div className="pt-4">
                          <button className="bg-akira-yellow text-black font-bold py-3 px-8 rounded hover:bg-yellow-500 transition">
                              Salvar Alterações
                          </button>
                      </div>
                  </form>
              </div>
          )}

          {activeTab === 'analytics' && (
              <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Analytics</h2>
                  
                  {/* KPI Cards (Cleaned up as requested: No Sales, No Orders) */}
                  <div className="grid grid-cols-2 gap-6 mb-8 max-w-2xl">
                      <div className="bg-akira-card p-6 rounded border border-gray-800 flex flex-col justify-center items-center text-center">
                          <p className="text-xs text-gray-500 uppercase mb-2">Visualizações</p>
                          <p className="text-4xl font-bold text-white">{totalViews}</p>
                      </div>
                      <div className="bg-akira-card p-6 rounded border border-gray-800 flex flex-col justify-center items-center text-center">
                          <p className="text-xs text-gray-500 uppercase mb-2">Likes</p>
                          <p className="text-4xl font-bold text-red-500 flex items-center gap-2">
                             <Heart className="w-6 h-6 fill-current" /> {totalLikes}
                          </p>
                      </div>
                  </div>
                  
                  <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-800 text-sm text-gray-400">
                     <p className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-akira-yellow" /> Suas estatísticas de engajamento são atualizadas em tempo real.</p>
                  </div>
              </div>
          )}

        </div>
      </div>
      
      {selectedPlanForPayment && (
          <PaymentModal 
             plan={selectedPlanForPayment} 
             onClose={() => setSelectedPlanForPayment(null)} 
             onConfirm={handlePaymentSuccess} 
          />
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const { categories, addCategory, removeCategory, user } = useStore();
  const [newCat, setNewCat] = useState('');
  const [showSql, setShowSql] = useState(false);

  if (user?.role !== 'admin') return <Navigate to="/" />;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if(newCat) {
      addCategory(newCat);
      setNewCat('');
    }
  };

  const sqlSchema = `
-- Execute este SQL no Editor SQL do seu Supabase para criar as tabelas necessárias

-- Extensão para UUIDs
create extension if not exists "uuid-ossp";

-- 1. Tabela de Perfis (Lojas e Usuários)
create table public.profiles (
  id text primary key,
  email text,
  role text,
  name text,
  shop_name text,
  address text,
  phone text,
  neighborhood text,
  open_time text,
  close_time text,
  logo_url text,
  plan text,
  plan_expires_at text,
  lat float8,
  lng float8,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Tabela de Categorias
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text unique
);

-- 3. Tabela de Produtos
create table public.products (
  id text primary key, -- Usando text para compatibilidade com IDs mistos (mock/real)
  shop_id text references public.profiles(id),
  shop_name text,
  title text,
  description text,
  price numeric,
  image_url text,
  category text,
  brand text,
  model text,
  views numeric default 0,
  likes numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Tabela de Pedidos
create table public.orders (
  id text primary key,
  buyer_id text references public.profiles(id),
  shop_id text references public.profiles(id),
  product_id text references public.products(id),
  product_title text,
  product_image text,
  price numeric,
  status text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Tabela de Chat
create table public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  product_id text references public.products(id),
  sender_id text,
  sender_name text,
  text text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Políticas de Segurança (RLS) Básicas
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (true);
create policy "Users can update own profile" on public.profiles for update using (true);

alter table public.products enable row level security;
create policy "Public products are viewable by everyone" on public.products for select using (true);
create policy "Shops can insert products" on public.products for insert with check (true);
create policy "Shops can update own products" on public.products for update using (true);
  `;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-display font-bold text-white mb-6">Painel Administrativo</h2>
      
      <div className="bg-akira-card p-6 rounded-lg border border-gray-800 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Gerenciar Categorias</h3>
        <ul className="space-y-2 mb-6">
          {categories.map(cat => (
            <li key={cat.id} className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-800">
              <span className="text-gray-300">{cat.name}</span>
              <button onClick={() => removeCategory(cat.id)} className="text-red-500 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={handleAdd} className="flex gap-2">
          <input 
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            placeholder="Nova Categoria"
            className="flex-1 bg-black border border-gray-700 rounded p-2 text-white"
          />
          <button className="bg-akira-yellow text-black px-4 py-2 rounded font-bold hover:bg-yellow-500">
            Adicionar
          </button>
        </form>
      </div>

      {/* Database Setup Section */}
      <div className="bg-akira-card p-6 rounded-lg border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Database className="text-akira-yellow" /> Configuração do Banco de Dados (Supabase)
        </h3>
        <p className="text-gray-400 text-sm mb-4">
            Para conectar o aplicativo ao Supabase, defina as variáveis de ambiente <code>REACT_APP_SUPABASE_URL</code> e <code>REACT_APP_SUPABASE_ANON_KEY</code>.
            Abaixo está o código SQL para criar a estrutura de tabelas necessária.
        </p>
        
        <button 
            onClick={() => setShowSql(!showSql)} 
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-bold border border-gray-700 mb-4"
        >
            {showSql ? 'Ocultar SQL' : 'Ver SQL de Criação'}
        </button>

        {showSql && (
            <div className="relative">
                <pre className="bg-black p-4 rounded border border-gray-700 text-green-400 text-xs overflow-x-auto whitespace-pre-wrap">
                    {sqlSchema}
                </pre>
                <button 
                    onClick={() => navigator.clipboard.writeText(sqlSchema)}
                    className="absolute top-2 right-2 bg-akira-yellow text-black text-[10px] font-bold px-2 py-1 rounded hover:bg-yellow-500"
                >
                    Copiar
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <StoreProvider>
      <Router>
        <div className="bg-akira-black min-h-screen text-akira-text font-sans">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shops" element={<ShopsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<ShopDashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </StoreProvider>
  );
}

export default App;
