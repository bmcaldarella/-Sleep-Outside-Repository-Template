import { getLocalStorage, setLocalStorage, qs } from "./utils.mjs";


export default class ShoppingCart {
  constructor(key = "so-cart", listElement) {
    this.key = key;
    this.listElement = listElement;
  }

  getCart() {
    return getLocalStorage(this.key) || [];
  }

  setCart(items) {
    setLocalStorage(this.key, items);
    document.dispatchEvent(new Event("cart:updated"));
  }

  addItem(item) {
    const items = this.getCart();
    const idx = items.findIndex((i) => i.Id === item.Id);
    if (idx >= 0) {
      items[idx].quantity = (items[idx].quantity || 1) + (item.quantity || 1);
    } else {
      items.push({ ...item, quantity: item.quantity || 1 });
    }
    this.setCart(items);
  }

  removeItem(id) {
    const items = this.getCart().filter((i) => i.Id !== id);
    this.setCart(items);
  }

  clear() {
    this.setCart([]);
  }

  total() {
    const items = this.getCart();
    return items.reduce((sum, it) => sum + (Number(it.FinalPrice) || 0) * (it.quantity || 1), 0);
  }

  /**
   * Render con <template id="cart-item-template"> en el DOM
   */
  render() {
    if (!this.listElement) return;

    // limpia lista
    this.listElement.textContent = "";

    const items = this.getCart();
    const tpl = document.getElementById("cart-item-template");

    items.forEach((it) => {
      const node = tpl.content.cloneNode(true);
      const li = node.querySelector(".cart-item");
      const img = node.querySelector("img");
      const name = node.querySelector(".name");
      const price = node.querySelector(".price");
      const qty = node.querySelector(".qty");
      const btnRemove = node.querySelector(".btn-remove");

      // datos
      img.src = it.Image || "/images/placeholder.png";
      img.alt = it.Name || "Product";
      name.textContent = it.Name || "Product";
      price.textContent = `$${(Number(it.FinalPrice) || 0).toFixed(2)}`;
      qty.textContent = `Qty: ${it.quantity || 1}`;

      // acción
      btnRemove.addEventListener("click", () => {
        this.removeItem(it.Id);
        this.render();
        this.updateTotal();
      });

      this.listElement.appendChild(node);
    });

    this.updateTotal();
  }

  updateTotal() {
    const totalEl = qs("#cart-total");
    if (totalEl) totalEl.innerHTML = `<strong>Total:</strong> $${this.total().toFixed(2)}`;
  }
}
