// /src/js/productDetails.mjs
import ProductData from "./ProductData.mjs";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const qs = (sel, parent = document) => parent.querySelector(sel);
const params = new URLSearchParams(location.search);
const productId = params.get("id") || params.get("product");
const container = qs("#product-detail");

function fixImgPath(p) {
  if (!p) return p;
  if (/^https?:\/\//i.test(p)) return p; 
  if (p.startsWith("../images/")) return p.replace("../images/", "/images/");
  if (p.startsWith("./images/"))  return p.replace("./images/", "/images/");
  return p;
}

function template(product) {
  const name  = product?.Name ?? product?.NameWithoutBrand ?? "Product";
  const brand = product?.Brand?.Name ?? "—";
  const img   =
    product?.Images?.PrimaryLarge ||
    product?.Images?.PrimaryMedium ||
    fixImgPath(product?.Image) ||
    "images/placeholder.svg";

  const desc   = product?.DescriptionHtmlSimple ?? product?.Description ?? "";
  const colors = product?.Colors?.map(c => c?.ColorName).filter(Boolean).join(", ") || "—";

  const original = Number(product?.SuggestedRetailPrice ?? product?.ListPrice ?? product?.FinalPrice ?? 0);
  const sale     = Number(product?.FinalPrice ?? product?.ListPrice ?? original);
  const hasDiscount = original > 0 && sale > 0 && sale < original;
  const pct    = hasDiscount ? Math.round((1 - sale / original) * 100) : 0;
  const amount = hasDiscount ? +(original - sale).toFixed(2) : 0;

  return `
    <article class="product">
      <p class="product__brand"><strong>${brand}</strong></p>
      <h2 class="divider">${name}</h2>

      <div class="product__media">
        <img class="divider" src="${img}" alt="${name}" />
      </div>

      <div class="price-block">
        <span class="price--sale">${currency.format(sale)}</span>
        ${hasDiscount ? `<span class="price--original">${currency.format(original)}</span>` : ""}
        ${hasDiscount ? `<span class="discount-badge"><span class="pct">-${pct}%</span><span class="save">Save ${currency.format(amount)}</span></span>` : ""}
      </div>

      <div class="product__info">
        <p class="product__color">${colors}</p>
        <div class="product__desc">${desc}</div>
        <button class="btn add-to-cart" data-id="${product.Id}">Add to Cart</button>
      </div>

    </article>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

async function init() {
  if (!container) return;

  if (!productId) {
    container.innerHTML = `<p class="error">Missing product id. Try going back and clicking a product again.</p>`;
    return;
  }

  try {
    const dataSource = new ProductData();
    const raw = await dataSource.findProductById(productId);
    const product = raw?.Result ?? raw;

    if (!product) {
      container.innerHTML = `<p class="error">Product not found (id: ${productId}).</p>`;
      return;
    }

    container.innerHTML = template(product);

    const imgEl = qs(".product__media img", container);
    imgEl?.addEventListener("error", () => {
      console.warn("No se pudo cargar la imagen:", imgEl.src);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="error">Error loading product.</p>`;
  }
}

init();
