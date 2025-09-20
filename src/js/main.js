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

/**
 * Ajusta rutas según la profundidad del path actual.
 * - Reescribe hrefs del menú
 * - Corrige el logo (data-src o src)
 * - Prefija TODAS las <img> con data-src / data-srcset (hero incluido)
 */
function fixNavLinksForDepth() {
  // Normaliza y calcula profundidad: "/" => 1, "/carpeta/index.html" => 2, etc.
  const path = window.location.pathname.replace(/\/+$/, "");
  const segments = path.split("/").filter(Boolean);
  const depth = segments.length;
  const up = depth <= 1 ? "./" : "../".repeat(depth - 1);

  const prefix = (p) => {
    if (!p) return p;
    if (/^https?:\/\//i.test(p)) return p; // URLs absolutas no se tocan
    if (p.startsWith("./")) return up + p.slice(2);
    if (p.startsWith("/"))  return up + p.slice(1);
    return up + p;
  };

  // 1) Reescribe enlaces del header
  document.querySelectorAll(".nav-home")
    .forEach(a => a.setAttribute("href", `${up}index.html`));

  // Apunta al nuevo listing por defecto a tents
  document.querySelectorAll(".nav-products")
    .forEach(a => a.setAttribute("href", `${up}product_listing/index.html?category=tents`));

  document.querySelectorAll(".nav-cart")
    .forEach(a => a.setAttribute("href", `${up}cart/index.html`));

  // 2) Logo: preferimos data-src; si no existe, intentamos arreglar el src si era absoluto
  const logo =
    document.querySelector('#main-header #logo-img') ||
    document.querySelector('header #logo-img') ||
    document.querySelector('#main-header img[alt*="tent" i]') ||
    document.querySelector('header img[alt*="tent" i]');

  if (logo) {
    const data = logo.getAttribute("data-src");
    if (data) {
      logo.src = prefix(data);
    } else {
      const raw = logo.getAttribute("src"); // atributo original (no la URL resuelta)
      if (raw) {
        // si venía como "/images/..." o "./images/..." lo normalizamos
        logo.setAttribute("src", prefix(raw));
      }
    }
  }

  // 3) TODAS las imágenes con data-src y/o data-srcset (logo, hero, banners, etc.)
  document.querySelectorAll("img[data-src]").forEach(img => {
    const base = img.getAttribute("data-src");
    if (base) img.src = prefix(base);

    const set = img.getAttribute("data-srcset");
    if (set) {
      const newSet = set
        .split(",")
        .map(part => {
          const [url, size] = part.trim().split(/\s+/, 2);
          return `${prefix(url)}${size ? " " + size : ""}`;
        })
        .join(", ");
      img.setAttribute("srcset", newSet);
    }
  });
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

  // Cierra al navegar o con Escape
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

// ---------- boot ----------
loadHeaderFooter({
  afterHeaderRender() {
    updateCartBadge();
    fixNavLinksForDepth();  // <- corrige logo/hero/links según profundidad
    wireHamburger();
  },
});

window.addEventListener("storage", (e) => {
  if (e.key === "so-cart") updateCartBadge();
});
document.addEventListener("cart:updated", updateCartBadge);
