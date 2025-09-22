// /src/js/cart.js
import { getLocalStorage } from "./utils.mjs";

function cartItemTemplate(item) {
  return `<li class="cart-card divider">
    <a href="#" class="cart-card__image">
      <img src="${item.Image}" alt="${item.Name}" />
    </a>
    <a href="#"><h2 class="card__name">${item.Name}</h2></a>
    <p class="cart-card__quantity">Qty: ${item.quantity || 1}</p>
    <p class="cart-card__price">$${item.Price.toFixed(2)}</p>
  </li>`;
}

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const target = document.querySelector(".product-list");
  if (!cartItems.length) {
    target.innerHTML = '<li class="empty">Your cart is empty</li>';
    return;
    }
  target.innerHTML = cartItems.map(cartItemTemplate).join("");
}

// 3.1) Render al cargar
renderCartContents();

// 3.2) 🔔 Re-render cuando alguien haga Add to Cart en otra página
window.addEventListener("cart:updated", renderCartContents);
