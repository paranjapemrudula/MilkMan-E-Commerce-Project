import React from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { Product } from "../types";
import freshCowMilk from "../assets/images/categories/Cow Milk/Fresh Cow Milk.jpg";
import fullCreamMilk from "../assets/images/categories/Cow Milk/Full Cream Milk.jpg";
import subscriptionMonthlyStarter from "../assets/images/categories/Cow Milk/Subscription Monthly Starter - Cow Milk.webp";
import richBuffaloMilk from "../assets/images/categories/Buffalo Milk/Rich Buffalo Milk.jpg";
import buffaloMilk from "../assets/images/categories/Buffalo Milk/Buffalo Milk.jpg";
import a2CowMilk from "../assets/images/categories/A2 Organic/A2 Cow Milk.webp";
import a2Curd from "../assets/images/categories/A2 Organic/A2 Curd.png";
import a2Ghee from "../assets/images/categories/A2 Organic/A2 Ghee.webp";
import desiGhee from "../assets/images/categories/Curd &Ghee/Desi Ghee.webp";
import pureDesiGhee from "../assets/images/categories/Curd &Ghee/Pure Desi Ghee.webp";
import freshCurd from "../assets/images/categories/Curd &Ghee/Fresh Curd.png";
import freshMalaiPaneer from "../assets/images/categories/Paneer/Fresh Malai Paneer.jpg";
import malaiPaneer from "../assets/images/categories/Paneer/Malai Paneer.jpg";
import gulabJamun from "../assets/images/categories/Sweets/Gulab Jamun.jpg";
import kajuKatali from "../assets/images/categories/Sweets/Kaju Katali.jpg";
import kesarPedha from "../assets/images/categories/Sweets/Kesar Pedha.webp";
import rasgulla from "../assets/images/categories/Sweets/Rasgulla.jpg";
import cheddarCheese from "../assets/images/categories/Dairy Essentials/Cheddar cheese.webp";
import saltedButter from "../assets/images/categories/Dairy Essentials/Salted Butter.webp";
import yoghurt from "../assets/images/categories/Dairy Essentials/Yoghurt.jpg";

interface ProductSectionProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  selectedCategoryName?: string | null;
  onClearFilter?: () => void;
}

export default function ProductSection({ products, onAddToCart, selectedCategoryName, onClearFilter }: ProductSectionProps) {
  const productImageFor = (name: string) => {
    const key = name.toLowerCase();
    if (key.includes("fresh cow milk")) return freshCowMilk;
    if (key.includes("full cream milk")) return fullCreamMilk;
    if (key.includes("subscription") && key.includes("monthly starter")) return subscriptionMonthlyStarter;
    if (key.includes("rich buffalo milk")) return richBuffaloMilk;
    if (key.includes("buffalo  milk") || key.includes("buffalo milk")) return buffaloMilk;
    if (key.includes("a2 cow milk")) return a2CowMilk;
    if (key.includes("a2 curd")) return a2Curd;
    if (key.includes("a2 ghee")) return a2Ghee;
    if (key.includes("pure desi ghee")) return pureDesiGhee;
    if (key.includes("desi ghee")) return desiGhee;
    if (key.includes("fresh curd")) return freshCurd;
    if (key.includes("fresh malai paneer")) return freshMalaiPaneer;
    if (key.includes("malali paneer") || key.includes("malai paneer")) return malaiPaneer;
    if (key.includes("gulab jamun")) return gulabJamun;
    if (key.includes("kaju katali") || key.includes("kaju katli")) return kajuKatali;
    if (key.includes("kesar pedha") || key.includes("kesar peda")) return kesarPedha;
    if (key.includes("rasgulla")) return rasgulla;
    if (key.includes("cheddar")) return cheddarCheese;
    if (key.includes("salted butter")) return saltedButter;
    if (key.includes("yogurt") || key.includes("yoghurt")) return yoghurt;
    return undefined;
  };
  return (
    <section id="products" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-16">
          <div>
            <span className="text-primary font-serif italic text-lg">
              {selectedCategoryName ? `Category: ${selectedCategoryName}` : "Fresh Harvest"}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif mt-2 text-slate-900">
              {selectedCategoryName ? `${selectedCategoryName} Products` : "Daily Essentials"}
            </h2>
          </div>
          {selectedCategoryName ? (
            <button 
              onClick={onClearFilter}
              className="text-primary font-medium border-b-2 border-primary/20 hover:border-primary transition-all pb-1"
            >
              Show All Products
            </button>
          ) : (
            <button className="text-primary font-medium border-b-2 border-primary/20 hover:border-primary transition-all pb-1">
              View All Products
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[40px]">
            <p className="text-slate-500 font-serif text-xl italic">No products found in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map((product, idx) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="card-rounded p-6 group"
              >
                <div className="relative overflow-hidden rounded-2xl aspect-video mb-6">
                  <img 
                    src={productImageFor(product.name) ?? product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-serif">{product.name}</h3>
                  <span className="text-lg font-medium text-primary">₹{product.price}</span>
                </div>
                <p className="text-stone-500 text-sm mb-6 line-clamp-2">{product.description}</p>
                <button 
                  onClick={() => onAddToCart(product)}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-stone-200 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add to Cart
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
