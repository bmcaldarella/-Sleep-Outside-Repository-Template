// /src/js/product-listing.js
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { qs } from "./utils.mjs";

function getCategoryFromURL() {
  const params = new URLSearchParams(location.search);
  const raw = (params.get("category") || "").toLowerCase().trim();

  const map = {
    tents: "tents",
    tent: "tents",
    "sleeping-bags": "sleeping-bags",
    sleeping: "sleeping-bags",
    bags: "sleeping-bags",
    backpacks: "backpacks",
    packs: "backpacks",
    hammocks: "hammocks",
    hammock: "hammocks",
  };

  return map[raw] || "tents"; 
}

function setCategoryTitle(category) {
  const title = qs("#category-title");
  if (!title) return;
  const labelMap = {
    tents: "Tents",
    "sleeping-bags": "Sleeping Bags",
    backpacks: "Backpacks",
    hammocks: "Hammocks",
  };
  title.textContent = labelMap[category] || "Products";
}

function initProductListing() {
  const listElement = qs("#product-list");
  if (!listElement) return;

  const category = getCategoryFromURL();
  setCategoryTitle(category);

  const dataSource = new ProductData(category);
  const productList = new ProductList(category, dataSource, listElement);
  productList.init();
}

initProductListing();
