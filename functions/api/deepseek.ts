/**
 * Tencent Cloud EdgeOne Pages Function
 * This script proxies requests to DeepSeek API.
 */

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};

export const onRequestPost = async (context: any) => {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { 
        "Content-Type": "application/json", 
        "Access-Control-Allow-Origin": "*" 
      },
    });
  }

  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "DEEPSEEK_API_KEY not configured in environment variables" }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          "Access-Control-Allow-Origin": "*" 
        },
      },
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return new Response(JSON.stringify({ 
        error: "DeepSeek API returned invalid JSON", 
        detail: responseText 
      }), {
        status: 502,
        headers: { 
          "Content-Type": "application/json", 
          "Access-Control-Allow-Origin": "*" 
        },
      });
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    let errorMessage = "Internal server error";
    let status = 500;
    
    if (err.name === 'AbortError') {
      errorMessage = "Request to DeepSeek timed out";
      status = 504;
    }

    return new Response(JSON.stringify({ 
      error: errorMessage, 
      detail: err.message 
    }), {
      status: status,
      headers: { 
        "Content-Type": "application/json", 
        "Access-Control-Allow-Origin": "*" 
      },
    });
  }
};
