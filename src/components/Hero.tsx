import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-secondary)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--color-secondary)_0%,_transparent_50%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-6">
              Pure • Fresh • Daily
            </span>
            <h1 className="text-6xl md:text-8xl font-serif leading-[0.9] mb-8">
              Freshness <br />
              <span className="italic text-primary">Delivered</span> <br />
              to Your Door.
            </h1>
            <p className="text-xl text-stone-600 mb-10 leading-relaxed max-w-xl">
              Experience the taste of pure, farm-fresh milk and dairy products. 
              Sourced directly from local farms and delivered with love every morning.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="#subscriptions" 
                className="px-8 py-4 bg-primary text-white rounded-full font-medium flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/20"
              >
                Explore Plans
                <ArrowRight className="w-4 h-4" />
              </a>
              <a 
                href="#products" 
                className="px-8 py-4 bg-white text-primary border border-stone-200 rounded-full font-medium hover:bg-stone-50 transition-all"
              >
                Shop Products
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        className="absolute right-[-10%] top-[20%] hidden xl:block w-[600px] h-[800px]"
      >
        <img 
          src="https://images.unsplash.com/photo-1528498033373-3c6c08e93d79?auto=format&fit=crop&q=80&w=800" 
          alt="Dairy Farm" 
          className="pill-image w-full h-full shadow-2xl"
          referrerPolicy="no-referrer"
        />
      </motion.div>
    </section>
  );
}
