import ProductData from './ProductData.mjs';
import ProductList from './ProductList.mjs';
import { qs, getParam, loadHeaderFooter } from './utils.mjs';

loadHeaderFooter();

const map = { tents:'tents','sleeping-bags':'sleeping-bags',backpacks:'backpacks',hammocks:'hammocks' };
const raw = (getParam('category') || 'tents').toLowerCase().trim();
const category = map[raw] || 'tents';

const labels = { tents:'Tents','sleeping-bags':'Sleeping Bags',backpacks:'Backpacks',hammocks:'Hammocks' };
const h = qs('#category-title') || qs('.top-products-title') || qs('h2');
if (h) h.textContent = `Top Products: ${labels[category] || category}`;

const listEl = qs('#product-list') || qs('.product-list');
const data = new ProductData();
const list = new ProductList(category, data, listEl);
list.init();



function getCategoryFromURL() {
  const params = new URLSearchParams(location.search);
  const raw = (params.get('category') || '').toLowerCase().trim();
  const map = {
    tents: 'tents', tent: 'tents',
    'sleeping-bags': 'sleeping-bags', sleeping: 'sleeping-bags', bags: 'sleeping-bags',
    backpacks: 'backpacks', packs: 'backpacks',
    hammocks: 'hammocks', hammock: 'hammocks',
  };
  return map[raw] || 'tents';
}

function setCategoryTitle(category) {
  const title = document.querySelector('#category-title') || document.querySelector('h2');
  if (!title) return;
  const labelMap = {
    tents: 'Tents',
    'sleeping-bags': 'Sleeping Bags',
    backpacks: 'Backpacks',
    hammocks: 'Hammocks',
  };
  title.textContent = `Top Products: ${labelMap[category] || category}`;
}

function injectSortUI(productList, anchorEl) {
  const wrap = document.createElement('div');
  wrap.className = 'list-controls';
  wrap.innerHTML = `
    <label for="sort-products">Sort by:</label>
    <select id="sort-products" aria-label="Sort products">
      <option value="name-asc">Name A–Z</option>
      <option value="name-desc">Name Z–A</option>
      <option value="price-asc">Price Low→High</option>
      <option value="price-desc">Price High→Low</option>
    </select>
  `;
  anchorEl.parentNode.insertBefore(wrap, anchorEl);

  const select = wrap.querySelector('#sort-products');
  const saved = localStorage.getItem('productSort') || '';
  if (saved) {
    select.value = saved;
    productList.sortList(saved);
  }

  select.addEventListener('change', (e) => {
    const key = e.target.value;
    localStorage.setItem('productSort', key);
    productList.sortList(key);
  });
}

(function initProductListing() {
  const listElement =
    document.querySelector('#product-list') ||
    document.querySelector('.product-list');
  if (!listElement) return;

  const category = getCategoryFromURL();
  localStorage.setItem('lastCategory', category);
  setCategoryTitle(category);

  const dataSource = new ProductData();
  const productList = new ProductList(category, dataSource, listElement);
  productList.init();

  injectSortUI(productList, listElement);
})();