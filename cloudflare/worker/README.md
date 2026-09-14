# MyCommerce Cloudflare Worker

This Worker belongs to the **Sbayxed Cloudflare account** and is named `mycommerce-api-gateway`. It is an edge gateway for the active backend services in this repository:

| Worker route | Upstream |
| --- | --- |
| `/shop/*` | `SHOP_API_URL` |
| `/cart/*` | `CART_API_URL` |
| `/purchase/*` | `PURCHASE_API_URL` |
| `/health` | Gateway health response |

The Worker adds CORS handling, optional `X-API-Key` protection, and preserves the request method, query string, headers, and body while proxying.

## Deploy from this directory

```bash
cd cloudflare/worker
npm install -D wrangler typescript
npx wrangler login
npx wrangler deploy
npx wrangler secret put API_GATEWAY_KEY
```

Before deployment, replace the example URLs in `wrangler.toml` with public HTTPS URLs for the Shop API, Cart API, and Go Purchase service. For a private backend, place the Worker and backend behind Cloudflare Access, a private network, or another authenticated origin instead of exposing development servers.

## Account separation

The Worker is deployed in the **Sbayxed** account. The R2 bucket `mycommerce-media` was created in the **Gadget02030** account. The Worker configuration does not bind that bucket because R2 bindings are account-scoped. The Django services can use the bucket through an S3-compatible integration or a separately authorized storage path.

The repository does not store Cloudflare API tokens, backend credentials, Stripe keys, or R2 secrets. Set them through Wrangler secrets or GitHub environment secrets.
