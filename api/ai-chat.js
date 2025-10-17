export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method Not Allowed' } });
  }

  try {
    const { provider = 'openai', model = 'gpt-3.5-turbo', messages = [], apiKey } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: { message: 'messages不能为空' } });
    }

    const endpoints = {
      openai: 'https://api.openai.com/v1/chat/completions',
      moonshot: 'https://api.moonshot.cn/v1/chat/completions'
    };

    const endpoint = endpoints[provider];
    if (!endpoint) {
      return res.status(400).json({ error: { message: '不支持的provider' } });
    }

    const keyFromEnv = provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.MOONSHOT_API_KEY;
    const finalKey = apiKey || keyFromEnv;

    if (!finalKey) {
      return res.status(401).json({ error: { message: '缺少API Key，请在Vercel环境变量或请求体中提供' } });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${finalKey}`
      },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: 1000,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      const msg = data?.error?.message || data?.message || `HTTP ${response.status}`;
      return res.status(response.status).json({ error: { message: msg } });
    }

    const content = data?.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({ content, raw: data });
  } catch (error) {
    const isAbort = error?.name === 'AbortError';
    const msg = isAbort ? '请求超时，请稍后重试' : (error?.message || '未知错误');
    return res.status(500).json({ error: { message: msg } });
  }
}