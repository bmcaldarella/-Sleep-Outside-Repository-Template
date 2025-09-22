// /src/js/cart.mjs
import { getLocalStorage, setLocalStorage } from "./utils.mjs";

const KEY = "so-cart";

export function getCart() {
  return getLocalStorage(KEY) || [];
}
export function setCart(cart) {
  setLocalStorage(KEY, cart);
}
export function cartCount() {
  return getCart().reduce((s, it) => s + (it.quantity || 1), 0);
}
export function updateCartBadge() {
  const badge = document.querySelector("#cart-count");
  if (badge) badge.textContent = cartCount();
}

export function addToCart(product, qty = 1) {
  const id = product?.Id ?? product?.id;
  if (!id) return;

  const cart = getCart();
  const i = cart.findIndex((it) => (it.Id ?? it.id) === id);

  if (i >= 0) {
    cart[i].quantity = (cart[i].quantity || 1) + qty;
  } else {
    cart.push({
      Id: id,
      Name: product?.Name ?? product?.NameWithoutBrand ?? "Product",
      Price: Number(product?.FinalPrice ?? product?.ListPrice ?? product?.Price ?? 0) || 0,
      Image:
        product?.Images?.PrimarySmall ||
        product?.Images?.PrimaryMedium ||
        product?.Image ||
        "/images/placeholder.svg",
      quantity: qty,
    });
  }

  setCart(cart);
  updateCartBadge();
  window.dispatchEvent(new Event("cart:updated"));
}
