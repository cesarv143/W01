// src/js/product.js
import { setLocalStorage, getLocalStorage } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

const dataSource = new ProductData("tents");

function addProductToCart(product) {
  
  let cartItems = getLocalStorage("so-cart");
  if (!Array.isArray(cartItems)) {
    cartItems = [];
  }

  
  const existingIndex = cartItems.findIndex((item) => item.Id === product.Id);

  if (existingIndex > -1) {
   
    cartItems[existingIndex].quantity = (cartItems[existingIndex].quantity || 1) + 1;
  } else {
    
    product.quantity = 1;
    cartItems.push(product);
  }

 
  setLocalStorage("so-cart", cartItems);
}

// add to cart button event handler
async function addToCartHandler(e) {
  const product = await dataSource.findProductById(e.target.dataset.id);
  addProductToCart(product);
  alert("Product added to cart!"); 
}

// add listener to Add to Cart button
const addToCartButton = document.getElementById("addToCart");
if (addToCartButton) {
  addToCartButton.addEventListener("click", addToCartHandler);
}