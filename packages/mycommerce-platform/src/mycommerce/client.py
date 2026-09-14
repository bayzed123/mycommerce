"""Small standard-library-only client for the MyCommerce API gateway."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Mapping
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from urllib.request import Request, urlopen


class ApiError(RuntimeError):
    """Raised when the gateway cannot return a successful JSON response."""

    def __init__(self, status: int, message: str, payload: Any = None) -> None:
        super().__init__(f"MyCommerce API error {status}: {message}")
        self.status = status
        self.payload = payload


@dataclass
class MyCommerceClient:
    """Client for the Worker gateway and its three backend routes.

    The gateway is expected to expose `/shop/*`, `/cart/*`, and `/purchase/*`.
    The client does not contain service credentials; authentication is supplied
    through the optional bearer token at request time or construction time.
    """

    base_url: str
    token: str | None = None
    timeout: float = 15.0

    def _request(
        self,
        method: str,
        route: str,
        payload: Mapping[str, Any] | list[Any] | None = None,
        *,
        token: str | None = None,
    ) -> Any:
        url = urljoin(self.base_url.rstrip("/") + "/", route.lstrip("/"))
        headers = {"Accept": "application/json"}
        auth_token = token or self.token
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"
        body = None
        if payload is not None:
            headers["Content-Type"] = "application/json"
            body = json.dumps(payload).encode("utf-8")
        request = Request(url, data=body, headers=headers, method=method.upper())
        try:
            with urlopen(request, timeout=self.timeout) as response:
                raw = response.read()
                if not raw:
                    return None
                return json.loads(raw.decode("utf-8"))
        except HTTPError as error:
            raw = error.read().decode("utf-8", errors="replace")
            try:
                payload_data = json.loads(raw) if raw else None
            except json.JSONDecodeError:
                payload_data = raw
            raise ApiError(error.code, error.reason, payload_data) from error
        except URLError as error:
            raise ApiError(0, str(error.reason)) from error

    def health(self) -> Any:
        """Return the gateway health response."""
        return self._request("GET", "/health")

    def shop(self, path: str = "", *, method: str = "GET", payload: Any = None) -> Any:
        """Call a path proxied to the Shop API."""
        return self._request(method, f"/shop/{path.lstrip('/')}", payload)

    def cart(self, path: str = "", *, method: str = "GET", payload: Any = None) -> Any:
        """Call a path proxied to the Cart API."""
        return self._request(method, f"/cart/{path.lstrip('/')}", payload)

    def purchase(self, path: str = "", *, method: str = "GET", payload: Any = None) -> Any:
        """Call a path proxied to the Go Purchase service."""
        return self._request(method, f"/purchase/{path.lstrip('/')}", payload)
