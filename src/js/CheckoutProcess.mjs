import ExternalServices from './ExternalServices.mjs';
import { alertMessage } from './utils.mjs';

export default class CheckoutProcess {
  constructor(formSelector = '#checkout-form', cartKey = 'so-cart') {
    this.cartKey = cartKey;
    this.taxRate = 0.06; 

    // DOM
    this.form = document.querySelector(formSelector);
    this.zipInput = document.getElementById('zip');
    this.itemsList = document.getElementById('checkout-items');

    this.sumEls = {
      subtotal: document.getElementById('sum-subtotal'),
      tax: document.getElementById('sum-tax'),
      shipping: document.getElementById('sum-shipping'),
      total: document.getElementById('sum-total'),
      count: document.getElementById('items-count'),
    };

    // API
    this.service = new ExternalServices();

    this.totals = { subtotal: 0, tax: 0, shipping: 0, total: 0, itemsCount: 0 };
  }

  /* ============ INIT ============ */
  init() {
    this.renderCartItems();
    this.updateSubtotalFromCart();
    this.updateTotals();
    this.bindZipListener();
    this.bindSubmit();
    this.watchCartChanges();
  }

  /* ============ Helpers ============ */
  loadCart() {
    try { return JSON.parse(localStorage.getItem(this.cartKey)) || []; }
    catch { return []; }
  }
  countItems(cart) { return cart.reduce((n, it) => n + Number(it.quantity ?? 1), 0); }
  money(n) { return Number(n || 0).toLocaleString('en-US', { style:'currency', currency:'USD' }); }
  priceOf(it){ return Number(it.FinalPrice ?? it.Price ?? it.price ?? 0); }

  /* ============ LISTA ============ */
  groupCartForDisplay(items){
    const map = new Map();
    items.forEach(it => {
      const baseId = it.Id ?? it.id ?? it.SKU ?? it.Name ?? cryptoRandom();
      const key = `${baseId}|${this.priceOf(it)}`;
      const qty = Number(it.quantity ?? 1);
      const curr = map.get(key) || {
        Id: baseId,
        Name: it.Name ?? it.name ?? 'Product',
        Image: it.Image ?? it.image ?? (it.Images?.[0] ?? ''),
        Price: this.priceOf(it),
        quantity: 0
      };
      curr.quantity += qty;
      map.set(key, curr);
    });
    return [...map.values()];
    function cryptoRandom(){ return Math.random().toString(36).slice(2); }
  }

  itemRowTemplate(item){
    const line = item.Price * item.quantity;
    return `
      <li class="cart-card divider">
        <a class="cart-card__image" href="#">
          <img src="${item.Image}" alt="${item.Name}">
        </a>
        <div class="cart-card__body">
          <h4 class="card__name">${item.Name}
            ${item.quantity > 1 ? `<span class="qty-pill">x${item.quantity}</span>` : ''}
          </h4>
          <p class="cart-card__quantity">Qty: ${item.quantity}</p>
          <p class="cart-card__price">${this.money(item.Price)} ea</p>
          <p class="cart-card__line">Line: ${this.money(line)}</p>
        </div>
      </li>`;
  }

  renderCartItems(){
    if (!this.itemsList) return;
    const raw = this.loadCart();
    if (raw.length === 0){
      this.itemsList.innerHTML = `<li class="empty">Your cart is empty</li>`;
      if (this.sumEls.count) this.sumEls.count.textContent = 0;
      return;
    }
    const grouped = this.groupCartForDisplay(raw);
    this.itemsList.innerHTML = grouped.map(i => this.itemRowTemplate(i)).join('');
    if (this.sumEls.count) this.sumEls.count.textContent = this.countItems(raw);
  }

  /* ============ Totales ============ */
  updateSubtotalFromCart() {
    const cart = this.loadCart();
    const subtotal = cart.reduce((s,it)=> s + this.priceOf(it) * Number(it.quantity ?? 1), 0);
    this.totals.subtotal = +subtotal.toFixed(2);
    this.totals.itemsCount = this.countItems(cart);
    if (this.sumEls.subtotal) this.sumEls.subtotal.textContent = this.money(this.totals.subtotal);
  }

  computeTax(subtotal){ return +(subtotal * this.taxRate).toFixed(2); }
  computeShipping(items){
    if (items <= 0) return 0;
    return 10 + Math.max(0, items - 1) * 2; 
  }

  updateTotals(){
    const tax = this.computeTax(this.totals.subtotal);
    const shipping = this.computeShipping(this.totals.itemsCount);
    const total = +(this.totals.subtotal + tax + shipping).toFixed(2);
    this.totals = { ...this.totals, tax, shipping, total };

    if (this.sumEls.tax) this.sumEls.tax.textContent = this.money(tax);
    if (this.sumEls.shipping) this.sumEls.shipping.textContent = this.money(shipping);
    if (this.sumEls.total) this.sumEls.total.textContent = this.money(total);
  }

  /* ============ Events ============ */
  bindZipListener(){
    if(!this.zipInput) return;
    const trigger = () => {
      this.updateTotals();
    };
    this.zipInput.addEventListener('change', trigger);
    this.zipInput.addEventListener('blur', trigger);
    this.zipInput.addEventListener('input', (e)=>{
      const digits = String(e.target.value || '').replace(/\D/g,'');
      if (digits.length >= 5) this.updateTotals();
    });
  }

  bindSubmit(){
    if(!this.form) return;
    this.form.addEventListener('submit', async (e)=>{
      e.preventDefault();

      if (!this.form.checkValidity()){
        this.form.reportValidity();
        return;
      }

      try {
        this.updateSubtotalFromCart();
        this.updateTotals();

        const payload = this.buildPayloadFromForm(this.form);
        const res = await this.service.checkout(payload);

        localStorage.removeItem(this.cartKey);
        window.location.href = './success.html';
        return res;
      } catch (err) {
        console.error('Checkout error', err);
        alertMessage(err.message?.message ?? 'There was a problem submitting your order.');
      }
    });
  }

  watchCartChanges(){
    window.addEventListener('storage', (e)=>{
      if (e.key === this.cartKey){
        this.renderCartItems();
        this.updateSubtotalFromCart();
        this.updateTotals();
      }
    });
    document.addEventListener('cart:updated', ()=>{
      this.renderCartItems();
      this.updateSubtotalFromCart();
      this.updateTotals();
    });
  }

  /* ============ Payload ============ */
  packageItems(items){
    return items.map(it=>({
      id: it.Id ?? it.id ?? it.SKU ?? '',
      name: it.Name ?? it.name ?? 'Product',
      price: this.priceOf(it),
      quantity: Number(it.quantity ?? 1),
    }));
  }

  formDataToJSON(form){
    const fd = new FormData(form);
    const raw = Object.fromEntries(fd.entries());
    return {
      fname:      raw.firstName ?? raw.fname ?? '',
      lname:      raw.lastName  ?? raw.lname ?? '',
      street:     raw.street ?? '',
      city:       raw.city ?? '',
      state:      raw.state ?? '',
      zip:        raw.zip ?? '',
      cardNumber: raw.cc ?? raw.cardNumber ?? '',
      expiration: raw.exp ?? raw.expiration ?? '',
      code:       raw.cvv ?? raw.code ?? '',
    };
  }

  buildPayloadFromForm(form){
    const baseData = this.formDataToJSON(form);
    const items = this.packageItems(this.loadCart());
    return {
      ...baseData,
      orderDate: new Date().toISOString(),
      items,
      orderTotal: this.totals.total.toFixed(2), // string
      shipping: this.totals.shipping,           // number
      tax: this.totals.tax.toFixed(2),          // string
    };
  }
}
