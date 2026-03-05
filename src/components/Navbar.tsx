import React, { useState, useEffect } from "react";
import { ShoppingCart, User as UserIcon, LogOut, Menu, X } from "lucide-react";
import { User } from "../types";

interface NavbarProps {
  user: User | null;
  onAuthClick: () => void;
  onLogout: () => void;
  cartCount: number;
  onCartClick: () => void;
  onProfileClick: () => void;
}

export default function Navbar({ user, onAuthClick, onLogout, cartCount, onCartClick, onProfileClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-serif text-xl">M</div>
            <span className="text-2xl font-serif font-bold tracking-tight text-primary">Milkman Pro</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#categories" className="text-sm font-medium hover:text-primary transition-colors">Categories</a>
            <a href="#subscriptions" className="text-sm font-medium hover:text-primary transition-colors">Subscriptions</a>
            <a href="#products" className="text-sm font-medium hover:text-primary transition-colors">Products</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onCartClick}
              className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-sunny text-slate-900 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={onProfileClick}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                    {user.email[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{user.email.split('@')[0]}</span>
                </button>
                <button 
                  onClick={onLogout}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-red-500"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={onAuthClick}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90 transition-all"
              >
                <UserIcon className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
