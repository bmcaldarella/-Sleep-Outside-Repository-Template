// /src/js/main.js
import { loadHeaderFooter } from "./utils.mjs";
import { updateCartBadge } from "./cart.mjs";

/* =============================
   Helpers
============================= */

function fixLogoSrc() {
  const logo =
    document.querySelector('#main-header #logo-img') ||
    document.querySelector('header #logo-img') ||
    document.querySelector('#main-header img[alt*="tent" i]') ||
    document.querySelector('header img[alt*="tent" i]');
  if (!logo) return;

  const base =
    logo.getAttribute("data-src") ||
    logo.getAttribute("src") ||
    "/images/noun_Tent_2517.svg";

  logo.src = new URL(base, location.origin + "/").pathname;
}

function fixNavLinksForDepth() {
  const path = location.pathname.replace(/\/+$/, "");
  const inProducts = /\/product_listing\/index\.html$/i.test(path);

  const baseFromRoot = (p) => new URL(p, location.origin + "/").pathname;
  const lastCat = localStorage.getItem("lastCategory") || "tents";

  const homeHref = baseFromRoot("/index.html");
  const cartHref = baseFromRoot("/cart/index.html");
  const productsHref = inProducts
    ? `./index.html?category=${encodeURIComponent(lastCat)}`
    : baseFromRoot(`/product_listing/index.html?category=${encodeURIComponent(lastCat)}`);

  const setHref = (sel, href) =>
    document.querySelectorAll(sel).forEach((a) => a.setAttribute("href", href));

  setHref(".nav-home", homeHref);
  setHref(".nav-products", productsHref);
  setHref(".nav-cart", cartHref);
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

  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

/* =============================
   Boot
============================= */

loadHeaderFooter({
  afterHeaderRender() {
    fixLogoSrc();         
    fixNavLinksForDepth(); 
    updateCartBadge();     
    wireHamburger();       
  },
});

window.addEventListener("storage", (e) => {
  if (e.key === "so-cart") updateCartBadge();
});

document.addEventListener("cart:updated", updateCartBadge);
