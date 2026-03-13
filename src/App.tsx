import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CategorySection from "./components/CategorySection";
import ProductSection from "./components/ProductSection";
import SubscriptionSection from "./components/SubscriptionSection";
import AuthModal from "./components/AuthModal";
import CartDrawer from "./components/CartDrawer";
import ProfileModal from "./components/ProfileModal";
import PaymentPage from "./pages/PaymentPage";
import { Category, Product, Subscription, User, CartItem } from "./types";
import { apiUrl } from "./lib/api";

function MainApp() {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore user session if present
    try {
      const saved = localStorage.getItem("milkman:user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
      if (localStorage.getItem("milkman:openProfileAfterPay")) {
        setIsProfileOpen(true);
        localStorage.removeItem("milkman:openProfileAfterPay");
      }
    } catch {}
    fetchData();
  }, []);

  useEffect(() => {
    try {
      if (user) localStorage.setItem("milkman:user", JSON.stringify(user));
      else localStorage.removeItem("milkman:user");
    } catch {}
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const fetchCategories = async () => {
        const res = await fetch(apiUrl("/api/categories/"));
        if (res.ok) setCategories(await res.json());
      };
      const fetchProducts = async () => {
        const res = await fetch(apiUrl("/api/products/"));
        if (res.ok) setProducts(await res.json());
      };
      const fetchSubscriptions = async () => {
        const res = await fetch(apiUrl("/api/subscriptions/"));
        if (res.ok) setSubscriptions(await res.json());
      };

      await Promise.allSettled([
        fetchCategories(),
        fetchProducts(),
        fetchSubscriptions()
      ]);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal > 500 ? 0 : 40;
    const total = subtotal + deliveryFee;

    try {
      // Create pending order
      const res = await fetch(apiUrl("/api/orders/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          items: cart,
          total_amount: total
        })
      });

      if (!res.ok) {
        alert("Failed to place order. Please try again.");
        return;
      }
      const order = await res.json(); // { id }

      // Redirect to payment page
      window.location.href = `/pay/${order.id}`;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to connect to server.");
    }
  };

  const handleSubscribe = async (sub: Subscription) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    try {
      // Create pending subscription order
      const res = await fetch(apiUrl("/api/subscriptions/purchase/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, subscription_id: sub.id }),
      });
      if (!res.ok) {
        alert("Failed to purchase subscription. Please try again.");
        return;
      }
      const order = await res.json(); // { id, total_amount }
      // Redirect to payment page
      window.location.href = `/pay/${order.id}`;
    } catch (e) {
      console.error("Subscription purchase error:", e);
      alert("Failed to connect to server.");
    }
  };

  const handleCategoryClick = (category: Category) => {
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
      // Scroll to products section
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filteredProducts = selectedCategory 
    ? products.filter(p => (p.category_id ?? p.category) === selectedCategory.id)
    : products;

  return (
    <div className="min-h-screen">
      <Navbar 
        user={user} 
        onAuthClick={() => setIsAuthOpen(true)} 
        onLogout={() => setUser(null)}
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <main>
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <Hero />
            <CategorySection 
              categories={categories} 
              onCategoryClick={handleCategoryClick}
              selectedCategoryId={selectedCategory?.id}
            />
            <SubscriptionSection subscriptions={subscriptions} onSubscribe={handleSubscribe} />
            <ProductSection 
              products={filteredProducts} 
              onAddToCart={handleAddToCart}
              selectedCategoryName={selectedCategory?.name}
              onClearFilter={() => setSelectedCategory(null)}
            />
          </>
        )}
      </main>

      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-serif">M</div>
            <span className="text-xl font-serif font-bold text-primary">Milkman Pro</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Milkman Pro. Freshness guaranteed.</p>
        </div>
      </footer>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={(u) => setUser(u)} 
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onViewCart={() => {
          setIsProfileOpen(false);
          setIsCartOpen(true);
        }}
        cartItemCount={cart.reduce((s, i) => s + i.quantity, 0)}
      />

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/pay/:orderId" element={<PaymentPage />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </Router>
  );
}
