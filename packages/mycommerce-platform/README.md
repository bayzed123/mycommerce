# mycommerce-platform

`mycommerce-platform` is the small, dependency-free Python client for the MyCommerce Cloudflare Worker gateway. It gives Python applications one stable base URL while the gateway routes requests to the Shop API, Cart API, and Go Purchase service.

## Install

```bash
pip install mycommerce-platform
```

## Usage

```python
from mycommerce import MyCommerceClient

client = MyCommerceClient(
    "https://mycommerce-api-gateway.<your-subdomain>.workers.dev",
    token="optional-jwt-token",
)

print(client.health())
products = client.shop("api/v1/shop/")
cart = client.cart("cart/v1/")
payment = client.purchase("create", method="POST", payload={"sessionId": "session-123"})
```

The package only uses Python's standard library. It does not contain Stripe, database, Django, or Cloudflare credentials. Authentication is supplied through the optional bearer token and service authorization remains a gateway/backend responsibility.

## Development

```bash
cd packages/mycommerce-platform
python -m venv .venv
. .venv/bin/activate
python -m pip install -U pip pytest
pytest
python -m build
```

The package is published from GitHub Actions when a `mycommerce-platform-v*` tag is pushed. Configure a PyPI Trusted Publisher for this GitHub repository before creating the first release.
