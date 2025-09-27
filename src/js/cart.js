import { getLocalStorage, setLocalStorage } from './utils.mjs';

const CART_KEY = 'so-cart';

function money(n){ return `$${Number(n||0).toFixed(2)}`; }
function priceOf(it){ return Number(it.Price ?? it.price ?? 0); }
function idOf(it){ return it.Id ?? it.id ?? it.SKU ?? it.sku; }

export function updateCartBadge(){
  const cart = loadCart();
  const count = cart.reduce((n,it)=> n + Number(it.quantity ?? 1), 0);
  const badge = document.querySelector('#cart-count');
  if (badge) badge.textContent = count;
}

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

function increaseQty(productId){
  const cart = loadCart();
  const idx = cart.findIndex(i => idOf(i) === productId);
  if (idx >= 0) cart[idx].quantity = Number(cart[idx].quantity ?? 1) + 1;
  saveCart(normalize(cart));
}

function decreaseQty(productId){
  const cart = loadCart();
  const idx = cart.findIndex(i => idOf(i) === productId);
  if (idx >= 0){
    const next = Number(cart[idx].quantity ?? 1) - 1;
    if (next <= 0) cart.splice(idx,1);
    else cart[idx].quantity = next;
  }
  saveCart(normalize(cart));
}

function removeItem(productId){
  const cart = loadCart().filter(i => idOf(i) !== productId);
  saveCart(normalize(cart));
}

function itemTemplate(item){
  const id = idOf(item);
  const qty = Number(item.quantity ?? 1);
  const line = priceOf(item) * qty;
  return /*html*/`
  <li class="cart-card divider" data-id="${id}">
    <a class="cart-card__image" href="#">
      <img src="${item.Image}" alt="${item.Name}">
    </a>
    <div class="cart-card__body" style="display:flex; flex-direction:column; gap:.15rem;">
      <h4 class="card__name">${item.Name}</h4>
      <div class="item-actions">
        <div class="qty-controls">
          <button class="qty-btn dec" aria-label="Decrease">−</button>
          <span class="qty">${qty}</span>
          <button class="qty-btn inc" aria-label="Increase">+</button>
        </div>
        <button class="remove" aria-label="Remove item">Remove</button>
        <span class="line">${money(line)}</span>
      </div>
    </div>
  </li>`;
}

function renderCart(){
  const listEl = document.querySelector('.product-list');
  if (!listEl) return;
  let cart = normalize(loadCart());
  saveCart(cart); 

  if (cart.length === 0){
    listEl.innerHTML = `<li class="empty">Your cart is empty</li>`;
  } else {
    listEl.innerHTML = cart.map(itemTemplate).join('');
  }
  updateCartBadge();

  listEl.onclick = (e)=>{
    const li = e.target.closest('li[data-id]');
    if (!li) return;
    const id = li.getAttribute('data-id');

    if (e.target.classList.contains('inc')) increaseQty(id);
    else if (e.target.classList.contains('dec')) decreaseQty(id);
    else if (e.target.classList.contains('remove')) removeItem(id);
    else return;

    renderCart();
  };
}

function init(){
  renderCart();
  document.addEventListener('cart:updated', updateCartBadge);
  window.addEventListener('storage', (e)=>{
    if (e.key === CART_KEY) renderCart();
  });
}

init();
