// src/js/CheckoutProcess.mjs
import ExternalServices from './ExternalServices.mjs';

export default class CheckoutProcess {
  constructor(formSelector = '#checkout-form', cartKey = 'so-cart') {
    this.cartKey = cartKey;
    this.taxRate = 0.06; // ✔ 6%

    this.form = document.querySelector(formSelector);
    this.zipInput = document.getElementById('zip');

    this.sumEls = {
      subtotal: document.getElementById('sum-subtotal'),
      tax: document.getElementById('sum-tax'),
      shipping: document.getElementById('sum-shipping'),
      total: document.getElementById('sum-total'),
    };

    this.service = new ExternalServices();
    this.totals = { subtotal: 0, tax: 0, shipping: 0, total: 0, itemsCount: 0 };
  }

  init() {
    this.updateSubtotalFromCart(); // ✔ al cargar
    this.bindZipListener();        // ✔ después de zip
    this.bindSubmit();             // ✔ submit → POST
  }

  // ------- helpers -------
  loadCart() {
    try { return JSON.parse(localStorage.getItem(this.cartKey)) || []; }
    catch { return []; }
  }
  countItems(cart) { return cart.reduce((n, it) => n + Number(it.quantity ?? 1), 0); }
  money(n) { return Number(n || 0).toLocaleString('en-US',{style:'currency',currency:'USD'}); }
  priceOf(it){ return Number(it.FinalPrice ?? it.Price ?? it.price ?? 0); }

  // ------- subtotal -------
  updateSubtotalFromCart() {
    const cart = this.loadCart();
    const subtotal = cart.reduce((s,it)=> s + this.priceOf(it) * Number(it.quantity ?? 1), 0);
    this.totals.subtotal = +subtotal.toFixed(2);
    this.totals.itemsCount = this.countItems(cart);
    if (this.sumEls.subtotal) this.sumEls.subtotal.textContent = this.money(this.totals.subtotal);
  }

  // ------- tax/ship/total -------
  computeTax(subtotal){ return +(subtotal * this.taxRate).toFixed(2); }
  computeShipping(items){
    if (items <= 0) return 0;
    return 10 + Math.max(0, items - 1) * 2; // ✔ $10 + $2 c/u adicional
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

  // ------- eventos -------
  bindZipListener(){
    if(!this.zipInput) return;
    const trigger = () => this.updateTotals();
    this.zipInput.addEventListener('change', trigger);
    this.zipInput.addEventListener('blur', trigger);
    this.zipInput.addEventListener('input', (e)=>{
      const digits = String(e.target.value || '').replace(/\D/g,'');
      if (digits.length >= 5) this.updateTotals();
    });
  }

  bindSubmit(){
    if(!this.form) return;
    this.form.addEventListener('submit', (e)=>{
      e.preventDefault();
      this.checkout(this.form).catch(err=>{
        console.error(err);
        const m = document.getElementById('form-error');
        if (m){ m.textContent = 'There was a problem submitting your order.'; m.style.display='block'; }
      });
    });
  }

  // ------- items → formato requerido -------
  packageItems(items){
    return items.map(it=>({
      id: it.Id ?? it.id ?? it.SKU ?? '',
      name: it.Name ?? it.name ?? 'Product',
      price: this.priceOf(it),
      quantity: Number(it.quantity ?? 1),
    }));
  }

  // ------- form a JSON con NOMBRES EXACTOS -------
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

  // ------- POST checkout -------
  async checkout(form){
    this.updateSubtotalFromCart();
    this.updateTotals();

    const baseData = this.formDataToJSON(form);
    const items = this.packageItems(this.loadCart());

    const payload = {
      ...baseData,
      orderDate: new Date().toISOString(),
      items,
      orderTotal: this.totals.total.toFixed(2), // string
      shipping: this.totals.shipping,           // number
      tax: this.totals.tax.toFixed(2),          // string
    };

    const res = await this.service.checkout(payload);
    // si quieres limpiar carrito:
    // localStorage.removeItem(this.cartKey);
    return res;
  }
}
