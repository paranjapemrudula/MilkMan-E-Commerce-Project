import React from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Subscription } from "../types";

interface SubscriptionSectionProps {
  subscriptions: Subscription[];
  onSubscribe: (sub: Subscription) => void;
}

export default function SubscriptionSection({ subscriptions, onSubscribe }: SubscriptionSectionProps) {
  return (
    <section id="subscriptions" className="py-24 bg-primary/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <span className="text-primary font-serif italic text-lg">Smart Savings</span>
          <h2 className="text-4xl md:text-5xl font-serif mt-2 text-slate-900">Subscription Plans</h2>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
            Choose a plan that fits your family's needs. Enjoy discounted rates and guaranteed daily delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {subscriptions.map((sub, idx) => (
            <motion.div 
              key={sub.id}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`relative p-8 rounded-[40px] border transition-all hover:shadow-xl ${idx === 1 ? 'bg-white border-primary shadow-lg scale-105 z-10' : 'bg-white border-slate-100 shadow-sm'}`}
            >
              {idx === 1 && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sunny text-slate-900 text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-serif mb-2 text-slate-900">{sub.name}</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-primary">₹{sub.total_price}</span>
                <span className="text-slate-400 text-sm">/ {sub.duration_days} days</span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span>₹{sub.price_per_liter} per liter</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span>Category: {sub.category}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span>Daily Doorstep Delivery</span>
                </div>
              </div>

              <button 
                onClick={() => onSubscribe(sub)}
                className={`w-full py-4 rounded-full font-medium transition-all ${idx === 1 ? 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
              >
                Choose Plan
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
