from unittest.mock import patch

from mycommerce import ApiError, MyCommerceClient


def test_route_prefixes_are_forwarded_to_the_gateway():
    client = MyCommerceClient("https://api.example.test")
    with patch.object(client, "_request", return_value={"ok": True}) as request:
        assert client.shop("api/v1/products") == {"ok": True}
        assert client.cart("cart/v1/items", method="POST", payload={"id": 1}) == {"ok": True}
        assert client.purchase("create", method="POST", payload={"total": 10}) == {"ok": True}

    assert request.call_count == 3
    assert request.call_args_list[0].args == ("GET", "/shop/api/v1/products", None)
    assert request.call_args_list[1].args == ("POST", "/cart/cart/v1/items", {"id": 1})
    assert request.call_args_list[2].args == ("POST", "/purchase/create", {"total": 10})


def test_api_error_exposes_status_and_payload():
    error = ApiError(401, "Unauthorized", {"detail": "invalid token"})
    assert error.status == 401
    assert error.payload["detail"] == "invalid token"
