// src/js/ExternalServices.mjs
const BASE_URL = 'http://wdd330-backend.onrender.com';

export default class ExternalServices {
  async checkout(orderPayload) {
    const url = `${BASE_URL}/checkout`;
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    };
    const res = await fetch(url, options);
    if (!res.ok) {
      let detail = '';
      try { detail = await res.text(); } catch {}
      throw new Error(`Checkout failed: ${res.status} ${detail}`);
    }
    return res.json();
  }

  // (Opcional) métodos previos para productos si los sigues usando
  async getData(category) {
    const res = await fetch(`${BASE_URL}/products/search/${encodeURIComponent(category)}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  }

  async findProductById(id) {
    const res = await fetch(`${BASE_URL}/product/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  }
}
