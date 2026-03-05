import React from "react";
import { motion } from "framer-motion";
import { Category } from "../types";

import buffaloMilk from "../assets/images/categories/buffelo-milk.jpg";
import cowMilk from "../assets/images/categories/cow-milk.jpg";
import a2Organic from "../assets/images/categories/a2-organic.jpeg";
import curdGhee from "../assets/images/categories/curd-ghee.webp";
import paneer from "../assets/images/categories/paneer.jpg";
import dairyEssentials from "../assets/images/categories/dairy-essentials.jpg";
import sweets from "../assets/images/categories/sweets.webp";

interface CategorySectionProps {
  categories: Category[];
  onCategoryClick: (category: Category) => void;
  selectedCategoryId?: number | null;
}

export default function CategorySection({
  categories,
  onCategoryClick,
  selectedCategoryId,
}: CategorySectionProps) {
  const localImageMap: Record<string, string> = {
    "Buffalo Milk": buffaloMilk,
    "Cow Milk": cowMilk,
    "A2 Organic": a2Organic,
    "Curd & Ghee": curdGhee,
    "Paneer": paneer,
    "Dairy Essentials": dairyEssentials,
    "Sweets": sweets,
  };

  return (
    <section id="categories" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-primary font-serif italic text-lg">
            Our Offerings
          </span>
          <h2 className="text-4xl md:text-5xl font-serif mt-2">
            Explore Categories
          </h2>
          <p className="text-slate-500 mt-4">
            Click on a category to view its products
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              onClick={() => onCategoryClick(category)}
              className={`group cursor-pointer transition-all duration-300 ${
                selectedCategoryId === category.id
                  ? "ring-4 ring-primary ring-offset-4 rounded-[40px]"
                  : ""
              }`}
            >
              <div className="relative overflow-hidden rounded-[40px] aspect-[3/4] mb-4">
                <img
                  src={localImageMap[category.name] ?? category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute bottom-8 left-8 right-8">
                  <h3 className="text-white text-2xl font-serif">
                    {category.name}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
