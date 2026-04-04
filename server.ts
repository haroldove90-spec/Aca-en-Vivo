import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes (Simulating Server Actions)
  app.post("/api/inventory/update", async (req, res) => {
    const { id_establecimiento, delta } = req.body;
    
    // In a real app, we would verify the user's role here using Firebase Admin SDK
    // For this prototype, we'll simulate the logic
    console.log(`Updating inventory for ${id_establecimiento} by ${delta}`);
    
    // This would normally call Firestore
    // For now, we'll just return success
    res.json({ success: true, message: `Inventory updated by ${delta}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
