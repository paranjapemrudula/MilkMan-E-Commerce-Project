import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Package, Calendar, ChevronRight } from "lucide-react";
import { User, Order } from "../types";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onViewCart: () => void;
  cartItemCount: number;
}

export default function ProfileModal({ isOpen, onClose, user, onViewCart, cartItemCount }: ProfileModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchOrders();
    }
  }, [isOpen, user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${user?.id}`);
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[32px] p-8 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full">
              <X className="w-5 h-5" />
            </button>

            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-serif mb-2 text-slate-900">My Profile</h2>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-serif text-xl">
                    {user?.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{user?.email}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Customer Account</p>
                  </div>
                </div>
              </div>
              
              {cartItemCount > 0 && (
                <button 
                  onClick={onViewCart}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-sunny text-slate-900 rounded-full text-xs font-bold hover:opacity-90 transition-all"
                >
                  View Cart ({cartItemCount})
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              <h3 className="text-xl font-serif mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Order History
              </h3>

              {loading ? (
                <div className="py-12 text-center text-slate-400">Loading your orders...</div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                  <p className="text-slate-400 italic">You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-slate-100 rounded-2xl p-4 hover:border-primary/20 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Order #{order.id}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">₹{order.total_amount}</p>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 text-sm">
                            <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
                            <span className="flex-1 text-slate-700">{item.name}</span>
                            <span className="text-slate-400">x{item.quantity}</span>
                            <span className="font-medium text-slate-900">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
