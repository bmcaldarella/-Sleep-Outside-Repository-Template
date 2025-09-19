// src/js/ProductData.mjs
const baseURLRaw = import.meta.env.VITE_SERVER_URL || "";
const baseURL = baseURLRaw.replace(/\/?$/, "/");

function convertToJson(res) {
  if (res.ok) return res.json();
  throw new Error(`Bad Response: ${res.status} ${res.statusText}`);
}

export default class ProductData {
  constructor() {
  }

  async getData(category) {
    if (!category) throw new Error("getData(category): category requerido");
    const url = `${baseURL}products/search/${encodeURIComponent(category)}`;
    const response = await fetch(url);
    const data = await convertToJson(response);
    return data.Result;
  }

  async findProductById(id) {
    if (!id) throw new Error("findProductById(id): id requerido");
    const url = `${baseURL}product/${encodeURIComponent(id)}`;
    const response = await fetch(url);
    const data = await convertToJson(response);
    return data; 
  }
}
