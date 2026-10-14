import ProductData from "../js/ProductData.mjs";
import ProductDetails from "../js/ProductDetails.mjs";
import { getParam } from "../js/utils.mjs";

const productId = getParam("product");
const dataSource = new ProductData();
const productDetails = new ProductDetails(productId, dataSource);

productDetails.init();