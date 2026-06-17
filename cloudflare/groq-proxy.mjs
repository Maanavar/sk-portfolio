const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const DEFAULT_MAX_TOKENS = 900;
const MAX_ALLOWED_TOKENS = 1200;
const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 24000;
const ALLOWED_ROLES = new Set(['system', 'user', 'assistant']);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = buildCorsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname !== '/api/groq') {
      return jsonResponse({ error: 'Not found' }, 404, corsHeaders);
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, corsHeaders);
    }

    const originCheck = validateOrigin(request, env);
    if (!originCheck.ok) {
      return jsonResponse({ error: originCheck.error }, originCheck.status, corsHeaders);
    }

    if (!env.GROQ_API_KEY) {
      return jsonResponse({ error: 'Missing GROQ_API_KEY secret.' }, 503, corsHeaders);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body.' }, 400, corsHeaders);
    }

    const normalized = normalizeRequest(body, env);
    if (!normalized.ok) {
      return jsonResponse({ error: normalized.error }, 400, corsHeaders);
    }

    const upstream = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GROQ_API_KEY}`
      },
      body: JSON.stringify(normalized.payload)
    });

    const upstreamText = await upstream.text();
    const upstreamPayload = parseJson(upstreamText);

    if (!upstream.ok) {
      const upstreamError =
        upstreamPayload?.error?.message || `Groq request failed with status ${upstream.status}.`;
      const status = upstream.status === 429 ? 429 : 502;
      return jsonResponse({ error: upstreamError }, status, corsHeaders);
    }

    const content = upstreamPayload?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return jsonResponse({ error: 'Groq returned an empty response.' }, 502, corsHeaders);
    }

    return jsonResponse({ content }, 200, corsHeaders);
  }
};

function normalizeRequest(body, env) {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Request body must be a JSON object.' };
  }

  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  if (!rawMessages.length || rawMessages.length > MAX_MESSAGES) {
    return {
      ok: false,
      error: `messages must contain between 1 and ${MAX_MESSAGES} entries.`
    };
  }

  const messages = [];
  let totalLength = 0;

  for (const entry of rawMessages) {
    const role = typeof entry?.role === 'string' ? entry.role.trim() : '';
    const content = typeof entry?.content === 'string' ? entry.content.trim() : '';

    if (!ALLOWED_ROLES.has(role)) {
      return { ok: false, error: `Unsupported message role: ${role || 'unknown'}.` };
    }

    if (!content) {
      return { ok: false, error: 'Each message must include non-empty content.' };
    }

    totalLength += content.length;
    if (totalLength > MAX_CONTENT_LENGTH) {
      return {
        ok: false,
        error: `Total prompt size cannot exceed ${MAX_CONTENT_LENGTH} characters.`
      };
    }

    messages.push({ role, content });
  }

  const requestedTokens = body.max_tokens ?? body.maxTokens;
  const maxTokens = Math.min(
    getPositiveInt(requestedTokens, DEFAULT_MAX_TOKENS),
    MAX_ALLOWED_TOKENS
  );

  return {
    ok: true,
    payload: {
      model: env.GROQ_MODEL || DEFAULT_MODEL,
      temperature: 0.6,
      max_tokens: maxTokens,
      messages
    }
  };
}

function validateOrigin(request, env) {
  const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGINS || env.ALLOWED_ORIGIN || '');
  if (!allowedOrigins.length) {
    return { ok: false, status: 503, error: 'Missing ALLOWED_ORIGINS configuration.' };
  }

  const origin = request.headers.get('Origin');
  if (!origin) {
    return { ok: false, status: 403, error: 'Missing Origin header.' };
  }

  if (!isOriginAllowed(origin, allowedOrigins)) {
    return { ok: false, status: 403, error: 'Origin not allowed.' };
  }

  return { ok: true };
}

function buildCorsHeaders(request, env) {
  const headers = new Headers({
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin'
  });

  const origin = request.headers.get('Origin');
  const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGINS || env.ALLOWED_ORIGIN || '');
  if (origin && isOriginAllowed(origin, allowedOrigins)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }

  return headers;
}

function parseAllowedOrigins(value) {
  return String(value)
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin, allowedOrigins) {
  return allowedOrigins.some(allowed => {
    if (allowed.includes('*')) return wildcardOriginMatch(origin, allowed);
    return origin === allowed;
  });
}

function wildcardOriginMatch(origin, pattern) {
  try {
    const originUrl = new URL(origin);
    const patternUrl = new URL(pattern.replace('*.', 'placeholder.'));
    if (originUrl.protocol !== patternUrl.protocol) return false;
    const expectedHost = patternUrl.hostname.replace(/^placeholder\./, '');
    return originUrl.hostname === expectedHost || originUrl.hostname.endsWith(`.${expectedHost}`);
  } catch {
    return false;
  }
}

function getPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function jsonResponse(payload, status, headers) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('Content-Type', 'application/json; charset=utf-8');
  responseHeaders.set('Cache-Control', 'no-store');
  responseHeaders.set('X-Content-Type-Options', 'nosniff');
  responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return new Response(JSON.stringify(payload), { status, headers: responseHeaders });
}

function parseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
