export interface Env {
  SHOP_API_URL: string
  CART_API_URL: string
  PURCHASE_API_URL: string
  ALLOWED_ORIGINS?: string
  API_GATEWAY_KEY?: string
}

const jsonHeaders = { 'Content-Type': 'application/json' }

function corsHeaders(request: Request, env: Env): Headers {
  const origin = request.headers.get('Origin') || ''
  const allowed = (env.ALLOWED_ORIGINS || '*')
    .split(',')
    .map((value) => value.trim())
  const headers = new Headers(jsonHeaders)
  headers.set('Access-Control-Allow-Origin', allowed.includes('*') || allowed.includes(origin) ? (allowed.includes('*') ? '*' : origin) : 'null')
  headers.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-API-Key')
  headers.set('Access-Control-Max-Age', '86400')
  return headers
}

function response(request: Request, env: Env, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(request, env) })
}

function upstreamBase(pathname: string, env: Env): string | null {
  if (pathname === '/shop' || pathname.startsWith('/shop/')) return env.SHOP_API_URL
  if (pathname === '/cart' || pathname.startsWith('/cart/')) return env.CART_API_URL
  if (pathname === '/purchase' || pathname.startsWith('/purchase/')) return env.PURCHASE_API_URL
  return null
}

function upstreamPath(pathname: string): string {
  const match = pathname.match(/^\/(shop|cart|purchase)(\/.*)?$/)
  return match?.[2] || '/'
}

function isAuthorized(request: Request, env: Env): boolean {
  if (!env.API_GATEWAY_KEY) return true
  return request.headers.get('X-API-Key') === env.API_GATEWAY_KEY || Boolean(request.headers.get('Authorization'))
}

async function proxy(request: Request, env: Env, baseUrl: string, path: string): Promise<Response> {
  const target = new URL(path, `${baseUrl.replace(/\/$/, '')}/`)
  const incoming = new URL(request.url)
  target.search = incoming.search
  const headers = new Headers(request.headers)
  headers.delete('Host')
  headers.delete('Content-Length')
  const upstream = new Request(target, { method: request.method, headers, body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body, redirect: 'follow' })
  const result = await fetch(upstream)
  const responseHeaders = new Headers(result.headers)
  const cors = corsHeaders(request, env)
  cors.forEach((value, key) => responseHeaders.set(key, value))
  return new Response(result.body, { status: result.status, statusText: result.statusText, headers: responseHeaders })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request, env) })

    const url = new URL(request.url)
    if (url.pathname === '/health') {
      return response(request, env, { status: 'ok', service: 'mycommerce-api-gateway', backends: ['shop', 'cart', 'purchase'] })
    }

    const baseUrl = upstreamBase(url.pathname, env)
    if (!baseUrl) return response(request, env, { error: 'Not found' }, 404)
    if (!isAuthorized(request, env)) return response(request, env, { error: 'Unauthorized' }, 401)

    try {
      return await proxy(request, env, baseUrl, upstreamPath(url.pathname))
    } catch (error) {
      console.error('upstream proxy failure', error)
      return response(request, env, { error: 'Upstream service unavailable' }, 502)
    }
  },
}
