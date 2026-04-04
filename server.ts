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
    const { id_establecimiento, delta, set_to_zero } = req.body;
    
    // In a real app, we would verify the user's role here using Firebase Admin SDK
    // For this prototype, we'll simulate the logic
    console.log(`Updating inventory for ${id_establecimiento} by ${delta} (set_to_zero: ${set_to_zero})`);
    
    // Validation: Ensure delta is a number and id exists
    if (!id_establecimiento) {
      return res.status(400).json({ success: false, error: "Missing establishment ID" });
    }

    // This would normally call Firestore using Admin SDK
    // For now, we'll just return success to confirm the "Server Action" logic
    res.json({ 
      success: true, 
      message: set_to_zero ? "Inventory closed (0)" : `Inventory updated by ${delta}`,
      timestamp: new Date().toISOString()
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
