import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("trades.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    asset_type TEXT NOT NULL, -- 'Option' or 'ETF'
    side TEXT NOT NULL,       -- 'Long' or 'Short'
    quantity REAL NOT NULL,
    entry_price REAL NOT NULL,
    exit_price REAL NOT NULL,
    fees REAL DEFAULT 0,
    trade_date TEXT NOT NULL, -- ISO string
    notes TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/trades", (req, res) => {
    try {
      const trades = db.prepare("SELECT * FROM trades ORDER BY trade_date DESC").all();
      res.json(trades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trades" });
    }
  });

  app.post("/api/trades", (req, res) => {
    const { symbol, asset_type, side, quantity, entry_price, exit_price, fees, trade_date, notes } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO trades (symbol, asset_type, side, quantity, entry_price, exit_price, fees, trade_date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(symbol, asset_type, side, quantity, entry_price, exit_price, fees || 0, trade_date, notes || "");
      
      const newTrade = db.prepare("SELECT * FROM trades WHERE id = ?").get(info.lastInsertRowid);
      res.status(201).json(newTrade);
    } catch (error) {
      res.status(500).json({ error: "Failed to add trade" });
    }
  });

  app.put("/api/trades/:id", (req, res) => {
    const { id } = req.params;
    const { symbol, asset_type, side, quantity, entry_price, exit_price, fees, trade_date, notes } = req.body;
    try {
      db.prepare(`
        UPDATE trades 
        SET symbol = ?, asset_type = ?, side = ?, quantity = ?, entry_price = ?, exit_price = ?, fees = ?, trade_date = ?, notes = ?
        WHERE id = ?
      `).run(symbol, asset_type, side, quantity, entry_price, exit_price, fees || 0, trade_date, notes || "", id);
      
      const updatedTrade = db.prepare("SELECT * FROM trades WHERE id = ?").get(id);
      res.json(updatedTrade);
    } catch (error) {
      res.status(500).json({ error: "Failed to update trade" });
    }
  });

  app.delete("/api/trades/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM trades WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete trade" });
    }
  });

  app.get("/api/reviews", (req, res) => {
    try {
      const reviews = db.prepare("SELECT * FROM reviews ORDER BY date DESC, created_at DESC").all();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", (req, res) => {
    const { title, content, date } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO reviews (title, content, date)
        VALUES (?, ?, ?)
      `).run(title, content, date);
      
      const newReview = db.prepare("SELECT * FROM reviews WHERE id = ?").get(info.lastInsertRowid);
      res.status(201).json(newReview);
    } catch (error) {
      res.status(500).json({ error: "Failed to add review" });
    }
  });

  app.put("/api/reviews/:id", (req, res) => {
    const { id } = req.params;
    const { title, content, date } = req.body;
    try {
      db.prepare(`
        UPDATE reviews 
        SET title = ?, content = ?, date = ?
        WHERE id = ?
      `).run(title, content, date, id);
      
      const updatedReview = db.prepare("SELECT * FROM reviews WHERE id = ?").get(id);
      res.json(updatedReview);
    } catch (error) {
      res.status(500).json({ error: "Failed to update review" });
    }
  });

  app.delete("/api/reviews/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM reviews WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete review" });
    }
  });

  app.get("/api/stats", (req, res) => {
    try {
      const trades = db.prepare("SELECT * FROM trades").all();
      // Simple stats calculation
      // In a real app, we'd do this in SQL or more efficiently
      res.json(trades); 
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.post("/api/shutdown", (req, res) => {
    res.json({ message: "Shutting down and running backup..." });
    console.log("Shutdown signal received. Exiting process...");
    
    // Execute backup script if it exists, then exit
    import("child_process").then(({ exec }) => {
      exec("sh backup.sh", (error) => {
        if (error) {
          console.error("Backup script failed or not found:", error.message);
        } else {
          console.log("Backup completed successfully.");
        }
        process.exit(0);
      });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
