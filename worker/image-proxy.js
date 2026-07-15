/**
 * Design Studio — image generation CORS proxy (Cloudflare Worker)
 *
 * A static site (GitHub Pages) cannot call the Hugging Face Inference API
 * directly because Hugging Face does not send CORS headers, so the browser
 * blocks the response. This tiny Worker sits in between: it forwards the
 * request to Hugging Face and adds the CORS headers the browser needs.
 *
 * The user's Hugging Face token is only passed through — it is never stored,
 * logged, or inspected here.
 *
 * Deploy: see DEPLOY_IMAGE_PROXY.md in the repo root.
 */

// Only these hosts may be proxied. Requests to anything else are rejected,
// so this Worker can't be abused as an open relay.
const ALLOWED_HOSTS = new Set(["api-inference.huggingface.co", "router.huggingface.co"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
};

export default {
  async fetch(request) {
    // Browser preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== "POST") {
      return json({ error: "Only POST is supported" }, 405);
    }

    // The target Hugging Face URL is passed as ?url=<encoded full url>
    const requestUrl = new URL(request.url);
    const target = requestUrl.searchParams.get("url");
    if (!target) {
      return json({ error: "Missing ?url= parameter" }, 400);
    }

    let targetUrl;
    try {
      targetUrl = new URL(target);
    } catch {
      return json({ error: "Invalid target URL" }, 400);
    }
    if (targetUrl.protocol !== "https:" || !ALLOWED_HOSTS.has(targetUrl.hostname)) {
      return json({ error: "Target host is not allowed" }, 403);
    }

    // Forward the request as-is (Authorization + body pass straight through).
    // Wrap in try/catch so an upstream connection failure returns a readable
    // JSON error instead of Cloudflare's opaque HTTP 530.
    let upstream;
    try {
      upstream = await fetch(targetUrl.toString(), {
        method: "POST",
        headers: {
          Authorization: request.headers.get("Authorization") ?? "",
          "Content-Type": request.headers.get("Content-Type") ?? "application/json",
        },
        body: await request.arrayBuffer(),
      });
    } catch (error) {
      return json(
        { error: `Proxy could not reach ${targetUrl.hostname}: ${error?.message ?? error}` },
        502,
      );
    }

    // Re-emit the upstream response with CORS headers added.
    const headers = new Headers(corsHeaders);
    const contentType = upstream.headers.get("Content-Type");
    if (contentType) headers.set("Content-Type", contentType);
    return new Response(upstream.body, { status: upstream.status, headers });
  },
};

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
