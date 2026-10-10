// src/js/main.js
import { getLocalStorage } from "./utils.mjs";


function updateCartIconCount() {
  const cartItems = getLocalStorage("so-cart");
  
  const countBadge = document.querySelector(".cart-count");
  if (countBadge && cartItems.length > 0) {
    const total = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    countBadge.textContent = total;
  }
}


document.addEventListener("DOMContentLoaded", () => {
  updateCartIconCount();
});

import { loadHeaderFooter } from "./loadHeaderFooter.mjs";

loadHeaderFooter();