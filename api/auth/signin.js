export default async function handler(req, res) {
  // CORS 处理
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
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: { message: '缺少邮箱或密码' } });
    }

    const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: { message: 'Supabase环境变量未配置' } });
    }

    const endpoint = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ email, password }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!response.ok) {
      const msg = data?.error_description || data?.error || data?.message || `HTTP ${response.status}`;
      return res.status(response.status).json({ error: { message: msg } });
    }

    // 返回必要的令牌和用户信息给前端
    const { access_token, refresh_token, token_type, expires_in, user } = data;
    return res.status(200).json({ access_token, refresh_token, token_type, expires_in, user });
  } catch (error) {
    const isAbort = error?.name === 'AbortError';
    const msg = isAbort ? '请求超时，请稍后重试' : (error?.message || '未知错误');
    return res.status(500).json({ error: { message: msg } });
  }
}