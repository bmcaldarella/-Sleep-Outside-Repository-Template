// Carga un producto por id desde ?product=ID y lo pinta en la página
import ProductData from "./ProductData.mjs";

const dataSource = new ProductData("tents");

const qs = (sel, parent = document) => parent.querySelector(sel);
const params = new URLSearchParams(location.search);
const productId = params.get("product");
const container = qs("#product-detail");

// Sanitiza rutas de imagen por si tu JSON aún tiene ../images
function fixImgPath(p) {
    if (!p) return p;
    if (p.startsWith("../images/")) return p.replace("../images/", "/images/");
    if (p.startsWith("./images/")) return p.replace("./images/", "/images/");
    return p;
}

function template(product) {
    const name = product.Name ?? product.NameWithoutBrand ?? "Product";
    const img = fixImgPath(product.Image);
    const brand = product.Brand?.Name ?? "—";
    const price = product.FinalPrice ?? product.ListPrice ?? product.Price;
    const priceText = typeof price === "number" ? price.toFixed(2) : (price ?? "—");
    const desc = product.DescriptionHtmlSimple ?? "";
    const colorText = product.Colors?.map(c => c?.ColorName).filter(Boolean).join(", ") || "—";


    return `
    <article class="product">
         <p class="product__brand"><strong>${brand}</strong></p>
         <h2 class="divider">${name}</h2>
      <div class="product__media">
        <img class="divider" src="${img}" alt="${name}" />
      </div>
       <p class="product__price">$${priceText}</p>
      <div class="product__info">
        <p class="product__color">${colorText}</p>
        <div class="product__desc">${desc}</div>
        <button class="btn add-to-cart" data-id="${product.Id}">Add to Cart</button>
      </div>
    </article>
  `;
}

async function init() {
    if (!productId) {
        container.innerHTML = `<p class="error">Missing product id. Try going back to the home page and clicking a product again.</p>`;
        return;
    }

    try {
        const product = await dataSource.findProductById(productId);
        if (!product) {
            container.innerHTML = `<p class="error">Product not found (id: ${productId}).</p>`;
            return;
        }
        container.innerHTML = template(product);

        // (Opcional) Log de control para depurar imagen rota
        const imgEl = qs(".product__media img", container);
        imgEl.addEventListener("error", () => {
            console.error("No se pudo cargar la imagen:", imgEl.src);
        });
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p class="error">Error loading product.</p>`;
    }
}

init();
