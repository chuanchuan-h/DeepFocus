import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // DeepSeek API Proxy
  app.post("/api/deepseek/v1/chat/completions", async (req, res) => {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error("[DeepSeek Proxy] Error: DEEPSEEK_API_KEY is not configured in environment variables.");
      return res.status(500).json({ error: "服务器未配置 DeepSeek API Key，请检查 Secrets 面板。" });
    }

    // Secure logging: mask the key
    const maskedKey = apiKey.substring(0, 6) + "..." + apiKey.substring(apiKey.length - 4);
    console.log(`[DeepSeek Proxy] Forwarding request to DeepSeek API using key: ${maskedKey}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify(req.body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        console.error(`[DeepSeek Proxy] API Error: Status ${response.status}`, data);
        let userMessage = "AI 服务调用失败，请稍后重试。";
        
        if (response.status === 401) userMessage = "API Key 无效，请检查配置。";
        else if (response.status === 402) userMessage = "DeepSeek 账户余额不足，请充值。";
        else if (response.status === 429) userMessage = "请求过于频繁，请稍后再试。";
        
        return res.status(response.status).json({ 
          error: userMessage,
          details: data.error?.message || "Unknown error"
        });
      }

      res.status(response.status).json(data);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error("[DeepSeek Proxy] Request timed out after 60s");
        return res.status(504).json({ error: "请求超时，AI 响应过慢，请重试。" });
      }
      console.error("[DeepSeek Proxy] Network/Internal Error:", error);
      res.status(500).json({ error: "网络异常或服务器内部错误，请检查网络连接。" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
