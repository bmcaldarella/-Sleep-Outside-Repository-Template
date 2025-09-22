import { setLocalStorage, getLocalStorage } from "./utils.mjs";
import { updateCartBadge } from "./cart.mjs";

// Config demo
const TAX_RATE = 0.10;
const SHIPPING_FLAT = 9.99;
const FREE_SHIP_MIN = 100;

const money = (n) => Number(n).toFixed(2);

// ==== Render de items (lee so-cart) ====
function itemRowTemplate(item) {
  const qty = item.quantity || 1;
  const line = (item.Price || 0) * qty;
  return `<li class="cart-card divider">
    <a class="cart-card__image" href="#">
      <img src="${item.Image}" alt="${item.Name}" />
    </a>
    <div class="cart-card__body">
      <h4 class="card__name">${item.Name}</h4>
      <p class="cart-card__quantity">Qty: ${qty}</p>
      <p class="cart-card__price">$${money(item.Price)} ea</p>
      <p class="cart-card__line">Line: $${money(line)}</p>
    </div>
  </li>`;
}

function renderItems() {
  const items = getLocalStorage("so-cart") || [];
  const list = document.getElementById("checkout-items");
  if (!list) return;
  if (items.length === 0) {
    list.innerHTML = `<li class="empty">Your cart is empty</li>`;
    return;
  }
  list.innerHTML = items.map(itemRowTemplate).join("");
}

// ==== Order summary ====
function computeSummary() {
  const items = getLocalStorage("so-cart") || [];
  const subtotal = items.reduce((s, it) => s + (it.Price || 0) * (it.quantity || 1), 0);
  const tax = subtotal * TAX_RATE;
  const shipping = subtotal === 0 ? 0 : (subtotal >= FREE_SHIP_MIN ? 0 : SHIPPING_FLAT);
  const total = subtotal + tax + shipping;
  return { subtotal, tax, shipping, total };
}

function renderSummary() {
  const { subtotal, tax, shipping, total } = computeSummary();
  document.getElementById("sum-subtotal").textContent = `$${money(subtotal)}`;
  document.getElementById("sum-tax").textContent      = `$${money(tax)}`;
  document.getElementById("sum-shipping").textContent = `$${money(shipping)}`;
  document.getElementById("sum-total").textContent    = `$${money(total)}`;
}

// ==== Validación (no envía si falta algo) ====
function showError(msg){ const e=document.getElementById("form-error"); if(e){ e.textContent=msg; e.style.display="block";}}
function hideError(){ const e=document.getElementById("form-error"); if(e){ e.textContent=""; e.style.display="none";}}

function validateForm(form) {
  if (!form.checkValidity()) { form.reportValidity(); return false; }
  // extra: MM/YY no vencida
  const exp = form.exp.value.trim();
  const [mm, yy] = exp.split("/");
  if (mm && yy) {
    const month = parseInt(mm, 10);
    const year = 2000 + parseInt(yy, 10);
    const now = new Date();
    const lastOfMonth = new Date(year, month, 0);
    if (lastOfMonth < new Date(now.getFullYear(), now.getMonth(), 1)) {
      showError("The card appears to be expired.");
      return false;
    }
  }
  hideError(); return true;
}

// ==== Submit ====
function handleSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  if (!validateForm(form)) return;

  // En un sitio real: enviar al server y validar totales en backend.
  setLocalStorage("so-cart", []);
  updateCartBadge();
  renderItems();
  renderSummary();
  form.reset();
  alert("Order placed! (demo)");
}

// ==== Init ====
function init() {
  renderItems();
  renderSummary();
  updateCartBadge();

  const form = document.getElementById("checkout-form");
  form.addEventListener("submit", handleSubmit);

  // deshabilita si el carrito está vacío
  const hasItems = (getLocalStorage("so-cart") || []).length > 0;
  document.getElementById("place-order").disabled = !hasItems;

  // refresca si cambia el carrito (otra pestaña / misma pestaña)
  window.addEventListener("storage", (e) => {
    if (e.key === "so-cart") { renderItems(); renderSummary(); updateCartBadge(); }
  });
  document.addEventListener("cart:updated", () => {
    renderItems(); renderSummary(); updateCartBadge();
  });
}
init();
