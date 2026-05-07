import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("[DeepSeek Proxy] DEEPSEEK_API_KEY is missing");
    return res.status(500).json({ error: '服务器未配置 DeepSeek API Key，请检查 Vercel 环境变量。' });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

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
      console.error(`[DeepSeek Proxy] API Error: ${response.status}`, data);
    }
    
    res.status(response.status).json(data);
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: "请求超时，DeepSeek 响应过慢。" });
    }
    console.error("DeepSeek Proxy Error:", error);
    res.status(500).json({ error: "代理请求失败，请检查网络或配置。" });
  }
}
