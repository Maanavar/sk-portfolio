# Groq Proxy Setup

This portfolio now expects its AI tools to call a server-side proxy endpoint instead of using a visitor-supplied Groq key in the browser.

## What changed

- The front end now sends AI requests to `/api/groq` by default.
- The proxy URL is configurable through `<meta name="sk-groq-proxy-url" ...>` in `index.html`.
- Live-tool UI is enabled by default and no longer asks visitors for an API key.

## Cloudflare Worker deployment

1. Install Wrangler if you do not already have it:

   ```bash
   npm install --save-dev wrangler
   ```

2. Copy `cloudflare/wrangler.jsonc.example` to `wrangler.jsonc`.
3. Set the Groq secret:

   ```bash
   npx wrangler secret put GROQ_API_KEY
   ```

4. Optional but recommended secrets/vars:

   - `ALLOWED_ORIGINS`: comma-separated list of allowed site origins, such as `https://senthilsivaraman.com`
   - `RATE_LIMIT_MAX_REQUESTS`: default `10`
   - `RATE_LIMIT_WINDOW_MS`: default `3600000` (1 hour)
   - `RATE_LIMIT_SALT`: optional extra salt for hashing visitor IPs before they are used as rate-limit keys
   - `GROQ_MODEL`: default `llama-3.3-70b-versatile`

5. Deploy:

   ```bash
   npx wrangler deploy
   ```

## Routing options

Use one of these approaches:

- Best UX: route the Worker to `https://senthilsivaraman.com/api/groq` and leave the meta tag as `/api/groq`.
- Fastest setup: use the generated `*.workers.dev/api/groq` URL and update the `sk-groq-proxy-url` meta tag in `index.html` to that full URL.

If you use a separate `workers.dev` hostname, make sure `ALLOWED_ORIGINS` contains the portfolio origin, not the worker origin.

## Notes

- The Worker only accepts `POST /api/groq`.
- Requests are origin-checked, token-capped, and rate-limited per visitor.
- The current browser code still sends the prompt/context payload, but the Groq key never leaves the Worker.
