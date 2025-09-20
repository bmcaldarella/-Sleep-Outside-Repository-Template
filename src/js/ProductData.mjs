// /src/js/ProductData.mjs
const baseURL = (import.meta.env.VITE_SERVER_URL || "").replace(/\/?$/, "/");

function convertToJson(res) {
  if (res.ok) return res.json();
  throw new Error(`Bad Response: ${res.status} ${res.statusText}`);
}

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Local fetch failed ${res.status}`);
  return res.json();
}

export default class ProductData {
  constructor() {}

  // Lista por categoría: API si hay baseURL, si no fallback a /json/<category>.json
  async getData(category) {
    if (baseURL) {
      const data = await convertToJson(
        await fetch(`${baseURL}products/search/${encodeURIComponent(category)}`)
      );
      // API devuelve { Result: [...] }
      return Array.isArray(data?.Result) ? data.Result : [];
    } else {
      // Fallback local
      const local = await fetchJSON(`/json/${category}.json`);
      if (Array.isArray(local)) return local;
      if (local && Array.isArray(local[category])) return local[category];
      throw new Error("Unexpected local JSON format");
    }
  }

  // Detalle por id: API si hay baseURL; si no, busca en todas las categorías locales
  async findProductById(id) {
    if (baseURL) {
      return convertToJson(
        await fetch(`${baseURL}product/${encodeURIComponent(id)}`)
      );
    } else {
      const cats = ["tents", "sleeping-bags", "backpacks", "hammocks"];
      for (const c of cats) {
        try {
          const list = await this.getData(c);
          const found = list.find(p => String(p.Id) === String(id));
          if (found) return found;
        } catch (_) {}
      }
      return null;
    }
  }
}
