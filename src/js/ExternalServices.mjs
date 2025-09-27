const BASE_URL = 'http://wdd330-backend.onrender.com';

async function convertToJson(res) {
  let jsonResponse = null;
  try {
    jsonResponse = await res.json();
  } catch {
    jsonResponse = { status: res.status, statusText: res.statusText };
  }
  if (res.ok) return jsonResponse;
  throw { name: 'servicesError', message: jsonResponse };
}

export default class ExternalServices {
  async checkout(orderPayload) {
    const url = `${BASE_URL}/checkout`;
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    };
    const res = await fetch(url, options);
    return convertToJson(res);
  }

  async getData(category) {
    const res = await fetch(`${BASE_URL}/products/search/${encodeURIComponent(category)}`);
    return convertToJson(res);
  }

  async findProductById(id) {
    const res = await fetch(`${BASE_URL}/product/${encodeURIComponent(id)}`);
    return convertToJson(res);
  }
}
