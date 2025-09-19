// src/js/ProductList.mjs
import { renderListWithTemplate } from "./utils.mjs";

function productCardTemplate(product) {
  const id = product.Id;
  const name = product.Name ?? product.NameWithoutBrand ?? "Product";
  const img = product.Image;
  const brand = product.Brand?.Name ?? "—";

  const price = product.FinalPrice ?? product.ListPrice ?? product.Price;

  const priceText =
    typeof price === "number" ? price.toFixed(2) : (price ?? "—");

  return `
    <li class="product-card">
      <a href="/product_pages/index.html?product=${id}">
        <img src="${img}" alt="${name}" loading="lazy" />
        <p class="product__brand"><strong>${brand}</strong></p>
        <h3>${name}</h3>
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
    this.products = await this.dataSource.getData();
    this.renderList(this.products);
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
