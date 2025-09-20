// src/js/ProductList.mjs
import { renderListWithTemplate } from "./utils.mjs";

function productCardTemplate(product) {
  const id    = product?.Id ?? product?.id ?? "";
  const name  = product?.Name ?? product?.NameWithoutBrand ?? "Product";
  const img   = product?.Images?.PrimaryMedium ?? product?.Image ?? "images/placeholder.svg";
  const brand = product?.Brand?.Name ?? "";

  const priceRaw = product?.FinalPrice ?? product?.ListPrice ?? product?.Price ?? 0;
  const priceNum = typeof priceRaw === "number" ? priceRaw : parseFloat(priceRaw);
  const priceText = Number.isFinite(priceNum) ? priceNum.toFixed(2) : (priceRaw ?? "—");

  return `
    <li class="product-card">
      <a class="product-link" href="/product_pages/index.html?id=${encodeURIComponent(id)}">
        <img src="${img}" alt="${name}" loading="lazy" />
        ${brand ? `<p class="product__brand"><strong>${brand}</strong></p>` : ""}
        <h3 class="product__name">${name}</h3>
        <p class="price">$${priceText}</p>
      </a>
    </li>
  `;
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.products = [];
  }

  async init() {
    try {
      this.products = await this.dataSource.getData(this.category);
      this.renderList(this.products);
    } catch (err) {
      console.error("Error loading products", err);
      this.listElement.innerHTML = `<li class="error">Error</li>`;
    }
  }

  renderList(list) {
    renderListWithTemplate(
      productCardTemplate,
      this.listElement,
      list,
      "afterbegin",
      true 
    );
  }
}
