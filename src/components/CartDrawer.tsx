import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, Plus, Minus, ShoppingBag, CreditCard, Truck, CheckCircle2 } from "lucide-react";
import { CartItem } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  onCheckout: () => Promise<void>;
}

export default function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout }: CartDrawerProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 500 ? 0 : 40;
  const total = subtotal + deliveryFee;

  const handleCheckoutClick = async () => {
    setIsCheckingOut(true);
    try {
      await onCheckout();
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-serif text-slate-900">Your Basket</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {showSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-8"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-serif mb-2">Order Confirmed!</h3>
                  <p className="text-slate-500 mb-8">Your fresh dairy products are being prepared for delivery.</p>
                  <button 
                    onClick={onClose}
                    className="px-8 py-3 bg-primary text-white rounded-full font-medium"
                  >
                    Continue Shopping
                  </button>
                </motion.div>
              ) : items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 opacity-20" />
                  </div>
                  <p className="font-serif italic text-lg mb-2">Your basket is empty</p>
                  <p className="text-sm text-slate-400 mb-8">Add some fresh milk to get started!</p>
                  <button 
                    onClick={onClose}
                    className="px-8 py-3 border border-primary text-primary rounded-full font-medium hover:bg-primary hover:text-white transition-all"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <motion.div 
                      layout
                      key={item.id} 
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <h4 className="font-medium text-slate-900">{item.name}</h4>
                          <button onClick={() => onRemove(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-primary font-bold mb-3">₹{item.price}</p>
                        <div className="flex items-center gap-3 bg-white rounded-full px-2 py-1 w-fit border border-slate-200">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center text-slate-900">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && !showSuccess && (
              <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Order Summary</h3>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="text-slate-900 font-medium">₹{subtotal}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Delivery Fee</span>
                      {subtotal > 500 && <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-bold">PRO</span>}
                    </div>
                    <span className={deliveryFee === 0 ? "text-green-600 font-bold" : "text-slate-900 font-medium"}>
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                    </span>
                  </div>

                  {subtotal < 500 && (
                    <div className="p-3 bg-blue-50 rounded-xl flex items-start gap-3 mt-2">
                      <Truck className="w-4 h-4 text-primary mt-0.5" />
                      <p className="text-[10px] text-primary leading-tight">
                        Add <span className="font-bold">₹{500 - subtotal}</span> more to unlock <span className="font-bold">FREE Delivery</span>!
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-slate-900 font-bold">Total Amount</span>
                    <div className="text-right">
                      <span className="text-2xl font-serif font-bold text-primary">₹{total}</span>
                      <p className="text-[10px] text-slate-400">Inclusive of all taxes</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleCheckoutClick}
                  disabled={isCheckingOut}
                  className="w-full py-4 bg-primary text-white rounded-full font-bold hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCheckingOut ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Confirm & Pay ₹{total}</>
                  )}
                </button>
                
                <p className="text-center text-[10px] text-slate-400 mt-4">
                  By confirming, you agree to our Terms of Service
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
