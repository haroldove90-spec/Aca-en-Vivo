import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // API Routes (Simulating Server Actions)
  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, error: "API Key not configured" });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: message,
        config: {
          systemInstruction: `Eres el Concierge Virtual de "AcaEnVivo", una app para turistas en Acapulco. 
          Tu misión es ayudar a los turistas a encontrar hotel o negocio. 
          Analiza la petición del usuario y extrae los filtros necesarios.
          
          Zonas válidas: "Diamante", "Dorada", "Tradicional".
          Tipos válidos: "hotel", "negocio".
          
          Responde SIEMPRE en formato JSON con esta estructura:
          {
            "filters": {
              "zona": string (opcional),
              "tipo": string (opcional),
              "minEstrellas": number (opcional),
              "keywords": string[] (opcional)
            },
            "textResponse": string (una respuesta amable y corta en español)
          }
          
          Si el usuario pide algo como "cerca de la Diana", identifica que es la Zona Dorada.
          Si pide "cerca del Revolcadero", es Zona Diamante.
          Si pide "el centro" o "la quebrada", es Zona Tradicional.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              filters: {
                type: Type.OBJECT,
                properties: {
                  zona: { type: Type.STRING },
                  tipo: { type: Type.STRING },
                  minEstrellas: { type: Type.NUMBER },
                  keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              },
              textResponse: { type: Type.STRING }
            },
            required: ["textResponse"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ success: false, error: "AI processing failed" });
    }
  });

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
