// /src/js/ProductData.mjs
const baseURL =
  (import.meta.env && import.meta.env.VITE_SERVER_URL) ||
  'https://wdd330-backend.onrender.com/';

async function convertToJson(res) {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

function joinUrl(base, path) {
  // Une respetando barras
  const b = base.replace(/\/+$/, '');
  const p = String(path || '').replace(/^\/+/, '');
  return `${b}/${p}`;
}

export default class ProductData {
  // La categoría ya NO va en el constructor
  constructor() {}

  async getData(category) {
    if (!category) throw new Error('category is required');
    const url = joinUrl(baseURL, `products/search/${encodeURIComponent(category)}`);
    const data = await convertToJson(await fetch(url));
    return data.Result || [];
  }

  async findProductById(id) {
    if (!id) throw new Error('id is required');
    const url = joinUrl(baseURL, `product/${encodeURIComponent(id)}`);
    const data = await convertToJson(await fetch(url));
    return data.Result || null;
  }
}
