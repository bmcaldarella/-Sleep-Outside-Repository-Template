import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import { updateCartBadge } from "./cart.mjs"; 

const CART_KEY = 'so-cart';
const TAX_RATE = 0.06; // ✔ 6%
const money = (n) => Number(n || 0).toFixed(2);

function priceOf(it){ return Number(it.Price ?? it.price ?? 0); }
function idOf(it){ return it.Id ?? it.id ?? it.SKU ?? it.sku; }

function loadCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart){
  setLocalStorage(CART_KEY, cart);
  document.dispatchEvent(new Event('cart:updated'));
}
function normalize(cart){
  const map = new Map();
  for (const it of cart){
    const id = idOf(it);
    if (!id) continue;
    const qty = Number(it.quantity ?? 1);
    if (map.has(id)){
      const prev = map.get(id);
      prev.quantity += qty;
    } else {
      map.set(id, { ...it, quantity: qty });
    }
  }
  return [...map.values()];
}
function itemsCount(cart){ return cart.reduce((n,it)=> n + Number(it.quantity ?? 1), 0); }
function shippingForCount(count){
  if (count <= 0) return 0;
  return 10 + Math.max(0, count - 1) * 2; 
}

/* ===== RENDER ITEMS controlers +/- ===== */
function itemRowTemplate(item) {
  const qty = Number(item.quantity ?? 1);
  const line = priceOf(item) * qty;
  const id = idOf(item);
  return `<li class="cart-card divider" data-id="${id}">
    <a class="cart-card__image" href="#"><img src="${item.Image}" alt="${item.Name}" /></a>
    <div class="cart-card__body" style="display:flex;flex-direction:column;gap:.15rem;">
      <h4 class="card__name">${item.Name}</h4>
      <div class="item-actions">
        <div class="qty-controls">
          <button class="qty-btn dec" aria-label="Decrease">−</button>
          <span class="qty">${qty}</span>
          <button class="qty-btn inc" aria-label="Increase">+</button>
        </div>
        <button class="remove" aria-label="Remove item">Remove</button>
        <span class="line">$${money(line)}</span>
      </div>
    </div>
  </li>`;
}

function renderItems() {
  const list = document.getElementById("checkout-items");
  if (!list) return;
  let cart = normalize(loadCart());
  saveCart(cart); 

  if (cart.length === 0) {
    list.innerHTML = `<li class="empty">Your cart is empty</li>`;
  } else {
    list.innerHTML = cart.map(itemRowTemplate).join("");
  }

  list.onclick = (e)=>{
    const li = e.target.closest('li[data-id]');
    if (!li) return;
    const id = li.getAttribute('data-id');
    let cart = loadCart();

    const idx = cart.findIndex(i => idOf(i) === id);
    if (idx < 0) return;

    if (e.target.classList.contains('inc')){
      cart[idx].quantity = Number(cart[idx].quantity ?? 1) + 1;
    } else if (e.target.classList.contains('dec')){
      const next = Number(cart[idx].quantity ?? 1) - 1;
      if (next <= 0) cart.splice(idx,1);
      else cart[idx].quantity = next;
    } else if (e.target.classList.contains('remove')){
      cart.splice(idx,1);
    } else return;

    cart = normalize(cart);
    saveCart(cart);
    renderItems();
    renderSummary(); 
    updateCartBadge();
  };
}

/* ===== SUMMARY ===== */
function computeSummary() {
  const cart = loadCart();
  const subtotal = cart.reduce((s, it) => s + priceOf(it) * Number(it.quantity ?? 1), 0);
  const tax = subtotal * TAX_RATE;
  const shipping = shippingForCount(itemsCount(cart));
  const total = subtotal + tax + shipping;
  return { subtotal, tax, shipping, total };
}
function renderSummary() {
  const { subtotal, tax, shipping, total } = computeSummary();
  const $ = (id) => document.getElementById(id);
  $("sum-subtotal").textContent = `$${money(subtotal)}`;
  $("sum-tax").textContent      = `$${money(tax)}`;
  $("sum-shipping").textContent = `$${money(shipping)}`;
  $("sum-total").textContent    = `$${money(total)}`;
}

/* ===== FORM ===== */
function showError(msg){ const e=document.getElementById("form-error"); if(e){ e.textContent=msg; e.style.display="block";}}
function hideError(){ const e=document.getElementById("form-error"); if(e){ e.textContent=""; e.style.display="none";}}

function validateForm(form) {
  if (!form.checkValidity()) { form.reportValidity(); return false; }
  const exp = form.exp.value.trim();
  const m = exp.match(/^(\d{2})\/(\d{2})$/);
  if (!m){ showError("Use MM/YY en expiration."); return false; }
  const mm = +m[1], yy = +m[2];
  if (mm < 1 || mm > 12){ showError("Mes inválido."); return false; }
  const year = 2000 + yy;
  const endOfMonth = new Date(year, mm, 0); 
  const today = new Date();
  if (endOfMonth < new Date(today.getFullYear(), today.getMonth(), 1)){
    showError("La tarjeta está expirada."); return false;
  }
  hideError(); return true;
}

function handleSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  if (!validateForm(form)) return;

  localStorage.removeItem(CART_KEY);
  updateCartBadge();
  renderItems();
  renderSummary();
  form.reset();
  
  alert("Order placed! (demo)");
}

/* ===== TABS (Items / Checkout Form) ===== */
function setupTabs(){
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  if (!tabs.length) return;
  const tabById = Object.fromEntries(tabs.map(t => [t.id, t]));
  function activate(tabId){
    tabs.forEach(t => {
      const selected = t.id === tabId;
      t.setAttribute('aria-selected', String(selected));
      const panelId = t.getAttribute('aria-controls');
      const panel = panelId && document.getElementById(panelId);
      if (panel) panel.hidden = !selected;
    });
  }
  // listeners
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => activate(t.id));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const next = (i + dir + tabs.length) % tabs.length;
      activate(tabs[next].id);
      tabs[next].focus();
    });
  });
  const current = tabs.find(t => t.getAttribute('aria-selected') === 'true')?.id || tabs[0].id;
  activate(current);
}

/* ===== INIT ===== */
function init() {
  setupTabs();        
  renderItems();
  renderSummary();
  updateCartBadge();

  const form = document.getElementById("checkout-form");
  if (form) form.addEventListener("submit", handleSubmit);

  window.addEventListener("storage", (e) => {
    if (e.key === CART_KEY) { renderItems(); renderSummary(); updateCartBadge(); }
  });
  document.addEventListener("cart:updated", () => {
    renderItems(); renderSummary(); updateCartBadge();
  });

  const zip = document.getElementById('zip');
  if (zip){
    const trigger = ()=> renderSummary();
    zip.addEventListener('change', trigger);
    zip.addEventListener('blur', trigger);
    zip.addEventListener('input', (e)=>{
      const digits = String(e.target.value||'').replace(/\D/g,'');
      if (digits.length >= 5) renderSummary();
    });
  }
}

init();
