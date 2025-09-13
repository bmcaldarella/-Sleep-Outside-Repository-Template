function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

export default class ProductData {
  constructor(category) {
    this.category = category;
    // change for the correct line and src
    this.path = `/json/${this.category}.json`;
  }

  getData() {
    return fetch(this.path)
      .then(convertToJson)
      .then((data) => {
        // 
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data[this.category])) return data[this.category];
        throw new Error("Unexpected JSON format in " + this.path);
      });
  }

  async findProductById(id) {
    const products = await this.getData();
    return products.find((item) => item.Id === id);
  }
}
