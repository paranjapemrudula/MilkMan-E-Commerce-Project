import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("milkman.db");

// Initialize DB schema
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image TEXT,
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    duration_days INTEGER,
    price_per_liter REAL,
    total_price REAL,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'customer'
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total_amount REAL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(order_id) REFERENCES orders(id)
  );
`);

// Seed data if empty
console.log("Checking database for seed data...");
const categoryCount = db.prepare("SELECT count(*) as count FROM categories").get() as { count: number };
if (categoryCount.count === 0) {
  console.log("Database empty. Seeding initial data...");
  try {
    db.prepare("INSERT INTO categories (name, image) VALUES (?, ?)").run("Cow Milk", "https://picsum.photos/seed/cowmilk/400/300");
    db.prepare("INSERT INTO categories (name, image) VALUES (?, ?)").run("Buffalo Milk", "https://picsum.photos/seed/buffalo/400/300");
    db.prepare("INSERT INTO categories (name, image) VALUES (?, ?)").run("A2 Organic", "https://picsum.photos/seed/organic/400/300");
    db.prepare("INSERT INTO categories (name, image) VALUES (?, ?)").run("Curd & Ghee", "https://picsum.photos/seed/ghee/400/300");
    db.prepare("INSERT INTO categories (name, image) VALUES (?, ?)").run("Paneer", "https://picsum.photos/seed/paneer/400/300");
    db.prepare("INSERT INTO categories (name, image) VALUES (?, ?)").run("Sweets", "https://picsum.photos/seed/sweets/400/300");
    db.prepare("INSERT INTO categories (name, image) VALUES (?, ?)").run("Dairy Essentials", "https://picsum.photos/seed/essentials/400/300");

    db.prepare("INSERT INTO products (category_id, name, price, description, image) VALUES (?, ?, ?, ?, ?)")
      .run(1, "Fresh Cow Milk (1L)", 65, "Pure farm-fresh cow milk delivered daily.", "https://picsum.photos/seed/milk1/400/300");
    db.prepare("INSERT INTO products (category_id, name, price, description, image) VALUES (?, ?, ?, ?, ?)")
      .run(2, "Rich Buffalo Milk (1L)", 85, "Creamy and rich buffalo milk for your family.", "https://picsum.photos/seed/milk2/400/300");
    db.prepare("INSERT INTO products (category_id, name, price, description, image) VALUES (?, ?, ?, ?, ?)")
      .run(4, "Pure Desi Ghee (500ml)", 450, "Traditional bilona method ghee.", "https://picsum.photos/seed/ghee1/400/300");
    db.prepare("INSERT INTO products (category_id, name, price, description, image) VALUES (?, ?, ?, ?, ?)")
      .run(5, "Fresh Malai Paneer (200g)", 120, "Soft and fresh paneer made from pure milk.", "https://picsum.photos/seed/paneer1/400/300");
    db.prepare("INSERT INTO products (category_id, name, price, description, image) VALUES (?, ?, ?, ?, ?)")
      .run(6, "Gulab Jamun (500g)", 250, "Soft and delicious milk-based sweets.", "https://picsum.photos/seed/sweets1/400/300");
    db.prepare("INSERT INTO products (category_id, name, price, description, image) VALUES (?, ?, ?, ?, ?)")
      .run(6, "Rasgulla (500g)", 220, "Spongy and sweet white rasgullas.", "https://picsum.photos/seed/sweets2/400/300");
    db.prepare("INSERT INTO products (category_id, name, price, description, image) VALUES (?, ?, ?, ?, ?)")
      .run(7, "Fresh Curd (500g)", 45, "Thick and creamy curd for your meals.", "https://picsum.photos/seed/curd1/400/300");
    db.prepare("INSERT INTO products (category_id, name, price, description, image) VALUES (?, ?, ?, ?, ?)")
      .run(7, "Salted Butter (100g)", 55, "Farm fresh salted butter.", "https://picsum.photos/seed/butter1/400/300");

    db.prepare("INSERT INTO subscriptions (name, duration_days, price_per_liter, total_price, category) VALUES (?, ?, ?, ?, ?)")
      .run("Monthly Starter", 30, 60, 1800, "Cow Milk");
    db.prepare("INSERT INTO subscriptions (name, duration_days, price_per_liter, total_price, category) VALUES (?, ?, ?, ?, ?)")
      .run("Quarterly Family", 90, 58, 5220, "Cow Milk");
    db.prepare("INSERT INTO subscriptions (name, duration_days, price_per_liter, total_price, category) VALUES (?, ?, ?, ?, ?)")
      .run("Monthly Premium", 30, 80, 2400, "Buffalo Milk");
    console.log("Database seeded successfully.");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
} else {
  console.log(`Database already contains ${categoryCount.count} categories.`);
}

// Helpers to idempotently add products and support subscription purchase billing
function getCategoryIdByName(name: string): number | null {
  const row = db.prepare("SELECT id FROM categories WHERE name = ?").get(name) as { id: number } | undefined;
  return row?.id ?? null;
}

function ensureProduct(name: string, categoryName: string, price: number, description: string, image: string): number {
  const existing = db.prepare("SELECT id FROM products WHERE name = ?").get(name) as { id: number } | undefined;
  if (existing?.id) return existing.id;
  const categoryId = getCategoryIdByName(categoryName);
  if (!categoryId) {
    const info = db.prepare("INSERT INTO categories (name, image) VALUES (?, ?)").run(categoryName, image);
    const newId = Number(info.lastInsertRowid);
    db.prepare("INSERT INTO products (category_id, name, price, description, image) VALUES (?, ?, ?, ?, ?)")
      .run(newId, name, price, description, image);
    return db.prepare("SELECT id FROM products WHERE name = ?").get(name).id;
  }
  db.prepare("INSERT INTO products (category_id, name, price, description, image) VALUES (?, ?, ?, ?, ?)")
    .run(categoryId, name, price, description, image);
  return db.prepare("SELECT id FROM products WHERE name = ?").get(name).id;
}

// Enrich catalog with more relatable items (idempotent by name)
try {
  const add = (name: string, cat: string, price: number, desc: string, imgSeed: string) => {
    const img = `https://images.unsplash.com/${imgSeed}?auto=format&fit=crop&q=80&w=800`;
    ensureProduct(name, cat, price, desc, img);
  };
  // Cow Milk
  add("Fresh Cow Milk (500ml)", "Cow Milk", 38, "Pure farm-fresh cow milk.", "photo-1550583724-b2692b85b150");
  add("Fresh Cow Milk (2L)", "Cow Milk", 120, "Daily family pack cow milk.", "photo-1511913896355-1c81e2a6b6d5");
  add("Full Cream Milk (1L)", "Cow Milk", 70, "Rich and creamy full cream milk.", "photo-1542444459-db631745fac2");
  // Buffalo Milk
  add("Buffalo Milk (500ml)", "Buffalo Milk", 48, "Creamy buffalo milk half liter.", "photo-1563630382041-155f8e7327f6");
  add("Buffalo Milk (2L)", "Buffalo Milk", 160, "Family pack creamy buffalo milk.", "photo-1598515217127-8ce0da6bae34");
  // A2 Organic
  add("A2 Cow Milk (1L)", "A2 Organic", 95, "Certified A2 cow milk.", "photo-1548943487-a2e4d3aee41b");
  add("A2 Curd (500g)", "A2 Organic", 65, "Probiotic-rich A2 curd.", "photo-1518552781818-3dbadb1e7b60");
  add("A2 Desi Ghee (500ml)", "A2 Organic", 520, "Traditional bilona A2 ghee.", "photo-1556735979-46091b8978d6");
  // Curd & Ghee
  add("Fresh Curd (1kg)", "Curd & Ghee", 85, "Thick and creamy homemade curd.", "photo-1580910051072-3e1b0e491f54");
  add("Desi Ghee (1L)", "Curd & Ghee", 860, "Premium desi ghee for cooking.", "photo-1615485737653-9f40f9a54097");
  // Paneer
  add("Malai Paneer (500g)", "Paneer", 220, "Soft and fresh malai paneer.", "photo-1604908177521-48903971d49a");
  add("Malai Paneer (1kg)", "Paneer", 420, "Party pack fresh paneer.", "photo-1617099092103-6d53295d85f6");
  // Sweets
  add("Kesar Peda (500g)", "Sweets", 320, "Rich saffron pedas.", "photo-1589308078052-494350f642de");
  add("Kaju Katli (500g)", "Sweets", 540, "Classic cashew katli.", "photo-1586985287822-b2eac76caa98");
  // Dairy Essentials
  add("Salted Butter (500g)", "Dairy Essentials", 250, "Creamy salted butter.", "photo-1565557623262-c8c7b1a6b2fd");
  add("Cheddar Cheese (200g)", "Dairy Essentials", 180, "Matured cheddar cheese.", "photo-1528786082830-761f3311b772");
  add("Yogurt (1kg)", "Dairy Essentials", 120, "Smooth and fresh yogurt.", "photo-1598514982663-2b4635fcbe5f");
} catch (e) {
  console.warn("Catalog enrichment skipped:", e);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/categories", (req, res) => {
    console.log("GET /api/categories");
    try {
      const categories = db.prepare("SELECT * FROM categories").all();
      console.log(`Found ${categories.length} categories`);
      res.json(categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/products", (req, res) => {
    console.log("GET /api/products");
    try {
      const products = db.prepare("SELECT * FROM products").all();
      console.log(`Found ${products.length} products`);
      res.json(products);
    } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/subscriptions", (req, res) => {
    console.log("GET /api/subscriptions");
    try {
      const subs = db.prepare("SELECT * FROM subscriptions").all();
      console.log(`Found ${subs.length} subscriptions`);
      res.json(subs);
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Purchase a subscription: create an order and a line item representing the plan
  app.post("/api/subscriptions/purchase", (req, res) => {
    const { user_id, subscription_id } = req.body as { user_id: number; subscription_id: number };
    try {
      const sub = db.prepare("SELECT * FROM subscriptions WHERE id = ?").get(subscription_id) as any;
      if (!sub) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      const productName = `Subscription: ${sub.name} - ${sub.category}`;
      const description = `Plan for ${sub.duration_days} days @ ₹${sub.price_per_liter}/L`;
      const image = "https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&q=80&w=800";
      const productId = ensureProduct(productName, sub.category || "Cow Milk", sub.total_price, description, image);

      const insertOrder = db.prepare("INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)");
      const insertOrderItem = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");

      const transaction = db.transaction(() => {
        const orderInfo = insertOrder.run(user_id, sub.total_price, "pending");
        const orderId = orderInfo.lastInsertRowid;
        insertOrderItem.run(orderId, productId, 1, sub.total_price);
        return orderId;
      });

      const orderId = transaction();
      res.json({ id: orderId, total_amount: sub.total_price, message: "Subscription order created" });
    } catch (err) {
      console.error("Subscription purchase error:", err);
      res.status(500).json({ error: "Failed to purchase subscription" });
    }
  });

  // Create a payment intent for an order (mock)
  app.post("/api/payments/intent", (req, res) => {
    const { order_id } = req.body as { order_id: number };
    try {
      const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(order_id) as any;
      if (!order) return res.status(404).json({ error: "Order not found" });
      if (order.status !== "pending") return res.status(400).json({ error: "Order not pending" });
      const info = db.prepare("INSERT INTO payments (order_id, amount, status) VALUES (?, ?, 'pending')").run(order_id, order.total_amount);
      res.json({ payment_id: info.lastInsertRowid, amount: order.total_amount, status: "pending" });
    } catch (err) {
      console.error("Create payment intent error:", err);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  // Confirm a payment (mock)
  app.post("/api/payments/confirm", (req, res) => {
    const { payment_id, outcome } = req.body as { payment_id: number; outcome: "success" | "fail" | "cod" };
    try {
      const pay = db.prepare("SELECT * FROM payments WHERE id = ?").get(payment_id) as any;
      if (!pay) return res.status(404).json({ error: "Payment not found" });
      if (pay.status !== "pending") return res.status(400).json({ error: "Payment already processed" });
      const newStatus = outcome === "success" ? "paid" : (outcome === "cod" ? "cod" : "failed");
      const tx = db.transaction(() => {
        db.prepare("UPDATE payments SET status = ? WHERE id = ?").run(newStatus, payment_id);
        if (newStatus === "paid") {
          db.prepare("UPDATE orders SET status = 'paid' WHERE id = ?").run(pay.order_id);
        }
      });
      tx();
      res.json({ status: newStatus });
    } catch (err) {
      console.error("Confirm payment error:", err);
      res.status(500).json({ error: "Failed to confirm payment" });
    }
  });

  app.get("/api/staff", (req, res) => {
    console.log("GET /api/staff");
    try {
      const staff = db.prepare("SELECT id, email, role FROM users WHERE role = 'staff'").all();
      res.json(staff);
    } catch (err) {
      console.error("Error fetching staff:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/customers", (req, res) => {
    console.log("GET /api/customers");
    try {
      const customers = db.prepare("SELECT id, email, role FROM users WHERE role = 'customer'").all();
      res.json(customers);
    } catch (err) {
      console.error("Error fetching customers:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/signup", (req, res) => {
    let { email, password } = req.body;
    email = email?.trim().toLowerCase();
    password = password?.trim();

    console.log(`POST /api/auth/signup for ${email}`);
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const info = db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(email, password);
      console.log("Signup successful");
      res.json({ id: info.lastInsertRowid, email, role: 'customer' });
    } catch (e) {
      console.error("Signup error:", e);
      res.status(400).json({ error: "Email already exists or invalid data" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    let { email, password } = req.body;
    email = email?.trim().toLowerCase();
    password = password?.trim();

    console.log(`POST /api/auth/login for ${email}`);
    try {
      const userRow = db.prepare("SELECT id, email, role, password as pw FROM users WHERE email = ?").get(email) as any;
      if (!userRow) {
        console.log("Login failed: User not found");
        return res.status(404).json({ error: "No account found for this email" });
      }
      if (userRow.pw === password) {
        console.log("Login successful");
        res.json({ id: userRow.id, email: userRow.email, role: userRow.role });
      } else {
        console.log("Login failed: Invalid credentials");
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/orders", (req, res) => {
    const { user_id, items, total_amount } = req.body;
    console.log(`POST /api/orders for user ${user_id}`);
    try {
      const insertOrder = db.prepare("INSERT INTO orders (user_id, total_amount) VALUES (?, ?)");
      const insertOrderItem = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");

      const transaction = db.transaction(() => {
        const orderInfo = insertOrder.run(user_id, total_amount);
        const orderId = orderInfo.lastInsertRowid;

        for (const item of items) {
          insertOrderItem.run(orderId, item.id, item.quantity, item.price);
        }
        return orderId;
      });

      const orderId = transaction();
      res.json({ id: orderId, message: "Order placed successfully" });
    } catch (err) {
      console.error("Order creation error:", err);
      res.status(500).json({ error: "Failed to place order" });
    }
  });

  app.get("/api/orders/:user_id", (req, res) => {
    const { user_id } = req.params;
    console.log(`GET /api/orders for user ${user_id}`);
    try {
      const orders = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC").all(user_id);
      const ordersWithItems = orders.map((order: any) => {
        const items = db.prepare(`
          SELECT oi.*, p.name, p.image 
          FROM order_items oi 
          JOIN products p ON oi.product_id = p.id 
          WHERE oi.order_id = ?
        `).all(order.id);
        return { ...order, items };
      });
      res.json(ordersWithItems);
    } catch (err) {
      console.error("Fetch orders error:", err);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Milkman Pro Server running on http://localhost:${PORT}`);
  });
}

startServer();
