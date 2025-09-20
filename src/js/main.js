// /src/js/main.js
import { loadHeaderFooter } from "./utils.mjs";

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
  // Normaliza path y calcula profundidad
  const path = window.location.pathname.replace(/\/+$/, "");
  const segments = path.split("/").filter(Boolean);
  const depth = segments.length;
  const up = depth <= 1 ? "./" : "../".repeat(depth - 1);

  // usa última categoría visitada si existe (dinámico)
  const lastCat = localStorage.getItem("lastCategory");
  const prodHref = lastCat
    ? `${up}product_listing/index.html?category=${encodeURIComponent(lastCat)}`
    : `${up}product_listing/index.html`;

  const setHref = (sel, href) =>
    document.querySelectorAll(sel).forEach(a => a.setAttribute("href", href));

  setHref(".nav-home",     `${up}index.html`);
  setHref(".nav-products", prodHref);
  setHref(".nav-cart",     `${up}cart/index.html`);

  // Ajusta logo si hiciera falta (soporta data-src)
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
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

// ---------- boot ----------
loadHeaderFooter({
  afterHeaderRender() {
    updateCartBadge();
    fixNavLinksForDepth();
    wireHamburger();
  },
});

window.addEventListener("storage", (e) => {
  if (e.key === "so-cart") updateCartBadge();
});
document.addEventListener("cart:updated", updateCartBadge);
