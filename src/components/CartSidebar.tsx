import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Plus, Minus, CreditCard, Palmtree, Loader2, CheckCircle2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        alert("Debes iniciar sesión para realizar una reserva.");
        setIsProcessing(false);
        return;
      }

      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create reservations for each item
      const { error } = await supabase
        .from('reservations')
        .insert(items.map(item => ({
          user_id: userId,
          business_id: item.id,
          business_name: item.name,
          business_image: item.image,
          status: 'confirmada',
          total_price: (parseInt(item.price.replace(/[^0-9]/g, '')) || 0) * item.quantity,
          guests: item.quantity, // Assuming quantity as guests for now
          payment_status: 'pagado'
        })));

      if (error) throw error;
      
      setShowSuccess(true);
      clearCart();
      
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        navigate('/reservas');
      }, 3000);
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Hubo un error al procesar tu pago. Por favor intenta de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-[200]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[450px] bg-white z-[210] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 bg-navy text-white flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-none flex items-center justify-center border border-white/20">
                  <ShoppingBag className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tighter uppercase leading-none">Tu Carrito</h2>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">{totalItems} Artículos</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 bg-white/10 rounded-none flex items-center justify-center hover:bg-white/20 transition-all relative z-10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 bg-gray-50 rounded-none flex items-center justify-center">
                    <Palmtree className="w-12 h-12 text-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-black text-dark uppercase tracking-widest">Tu carrito está vacío</p>
                    <p className="text-xs font-bold text-muted uppercase tracking-widest leading-relaxed">
                      ¡Explora Acapulco y añade<br />experiencias increíbles!
                    </p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="px-8 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20"
                  >
                    Empezar a Explorar
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-6 group">
                    <div className="w-24 h-24 bg-gray-100 rounded-none overflow-hidden shrink-0 border border-gray-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">{item.category}</p>
                          <h3 className="text-sm font-black text-dark uppercase tracking-tight truncate">{item.name}</h3>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-muted hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-gray-50 border border-gray-100 rounded-none">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-sm font-black text-dark">{item.price}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-8 border-t border-gray-100 space-y-6 bg-gray-50/50">
                <div className="space-y-3">
                  <div className="flex justify-between text-muted">
                    <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                    <span className="text-sm font-bold">${totalPrice.toLocaleString()} MXN</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span className="text-[10px] font-black uppercase tracking-widest">Comisión (5%)</span>
                    <span className="text-sm font-bold">${(totalPrice * 0.05).toLocaleString()} MXN</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="text-xs font-black text-dark uppercase tracking-widest">Total</span>
                    <span className="text-xl font-black text-primary">${(totalPrice * 1.05).toLocaleString()} MXN</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full py-5 bg-primary text-white rounded-none font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Proceder al Pago
                      </>
                    )}
                  </button>
                  <button 
                    onClick={clearCart}
                    disabled={isProcessing}
                    className="w-full py-4 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all disabled:opacity-30"
                  >
                    Vaciar Carrito
                  </button>
                </div>
              </div>
            )}

            {/* Success Overlay */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-primary z-[220] flex flex-col items-center justify-center text-white p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.5, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-24 h-24 bg-white/20 rounded-none flex items-center justify-center mb-8 backdrop-blur-xl"
                  >
                    <CheckCircle2 className="w-12 h-12" />
                  </motion.div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">¡Pago Exitoso!</h3>
                  <p className="text-white/80 font-bold uppercase tracking-widest text-xs leading-relaxed">
                    Tus reservas han sido confirmadas.<br />Redirigiendo a tus tickets...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
