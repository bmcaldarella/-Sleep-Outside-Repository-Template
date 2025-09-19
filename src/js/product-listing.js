import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { qs, getParam, loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

const map = { tents:"tents","sleeping-bags":"sleeping-bags",backpacks:"backpacks",hammocks:"hammocks" };
const raw = (getParam("category") || "tents").toLowerCase().trim();
const category = map[raw] || "tents";

const labels = { tents:"Tents","sleeping-bags":"Sleeping Bags",backpacks:"Backpacks",hammocks:"Hammocks" };
const h = qs("#category-title") || qs(".top-products-title") || qs("h2");
if (h) h.textContent = `Top Products: ${labels[category] || category}`;

const listEl = qs("#product-list") || qs(".product-list");
const data = new ProductData();
const list = new ProductList(category, data, listEl);
list.init();
