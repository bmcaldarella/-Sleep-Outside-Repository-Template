import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { qs, loadHeaderFooter } from "./utils.mjs";

// ---------- helpers ----------
function getCartCount() {
  try {
    const items = JSON.parse(localStorage.getItem("so-cart")) || [];
    return items.reduce((s, it) => s + (it.quantity || 1), 0);
  } catch {
    return 0;
  }
}

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = getCartCount();
}


function fixNavLinksForDepth() {
  const path = window.location.pathname.replace(/\/+$/, "");
  const segments = path.split("/").filter(Boolean); 
  const depth = segments.length;                     
  const up = depth <= 1 ? "./" : "../".repeat(depth - 1);

  const setHref = (sel, href) =>
    document.querySelectorAll(sel).forEach(a => a.setAttribute("href", href));

  setHref(".nav-home",     `${up}index.html`);
  setHref(".nav-products", `${up}product_pages/index.html`);
  setHref(".nav-cart",     `${up}cart/index.html`);

  const logo =
    document.querySelector('#main-header #logo-img') ||
    document.querySelector('header #logo-img') ||
    document.querySelector('#main-header img[alt*="tent" i]') ||
    document.querySelector('header img[alt*="tent" i]');
  if (logo) {
    const base = logo.getAttribute("data-src") || "images/noun_Tent_2517.svg";
    logo.setAttribute("src", `${up}${base}`);
  }
}


function initProductsIfPresent() {
  const listElement = qs("#product-list");
  if (!listElement) return; 
  const dataSource = new ProductData("tents");
  const productList = new ProductList("tents", dataSource, listElement);
  productList.init();
}

function wireHamburger() {
  const header = document.getElementById("main-header");
  if (!header) return;

  const btn = header.querySelector(".nav-toggle");
  const menu = header.querySelector("#site-menu");
  if (!btn || !menu) return;

  const close = () => {
    header.classList.remove("menu-open");
    btn.setAttribute("aria-expanded", "false");
  };
  const open = () => {
    header.classList.add("menu-open");
    btn.setAttribute("aria-expanded", "true");
  };

  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    expanded ? close() : open();
  });

  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", close));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

// ---------- boot ----------
loadHeaderFooter({
  afterHeaderRender() {
    updateCartBadge();
    fixNavLinksForDepth();
    wireHamburger();
  },
 
});

initProductsIfPresent();

window.addEventListener("storage", (e) => {
  if (e.key === "so-cart") updateCartBadge();
});

document.addEventListener("cart:updated", updateCartBadge);
