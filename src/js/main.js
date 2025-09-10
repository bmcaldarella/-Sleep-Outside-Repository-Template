import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { qs } from "./utils.mjs";

const dataSource = new ProductData("tents");

const listElement = qs("#product-list");


const productList = new ProductList("tents", dataSource, listElement);
productList.init();
