import { loadHeaderFooter, getParam } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

loadHeaderFooter();

(async () => {
  const id = getParam("id");
  if (!id) return;

  const api = new ProductData();
  const product = await api.findProductById(id);

  const img   = document.querySelector(".product-detail img");
  const name  = document.querySelector(".product-detail .name, .product-detail h2");
  const price = document.querySelector(".product-detail .price");

  if (img) {
    img.src = product?.Images?.PrimaryLarge || product?.Images?.PrimaryMedium || "images/placeholder.svg";
    img.alt = product?.Name || product?.NameWithoutBrand || "Product";
  }
  if (name)  name.textContent  = product?.Name || product?.NameWithoutBrand || "Product";
  if (price) {
    const p = product?.FinalPrice ?? product?.ListPrice ?? product?.Price ?? 0;
    const n = typeof p === "number" ? p : parseFloat(p);
    price.textContent = `$${(Number.isFinite(n) ? n.toFixed(2) : p)}`;
  }
})();
