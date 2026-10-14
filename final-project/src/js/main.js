// src/js/main.js
import { getLocalStorage } from "./utils.mjs";
import { loadHeaderFooter } from "./loadHeaderFooter.mjs";
import { getCampingWeather } from "./ExternalAPIs.mjs";

function updateCartIconCount() {
  const cartItems = getLocalStorage("so-cart");
  const countBadge = document.querySelector(".cart-count");
  
  // Safe check to prevent errors if cart is null/empty
  if (countBadge && cartItems && cartItems.length > 0) {
    const total = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    countBadge.textContent = total;
  }
}

// Load global header and footer dynamically
loadHeaderFooter();

document.addEventListener("DOMContentLoaded", async () => {
  // Update cart icon count on page load
  updateCartIconCount();

  // Fetch and display weather API data
  const weatherEl = document.getElementById("weather-text");
  if (weatherEl) {
    const weather = await getCampingWeather("Mexico City");
    if (weather) {
      weatherEl.innerHTML = `🌤️ Current weather in ${weather.location}: <strong>${weather.tempC}°C</strong> (${weather.condition}). Great weather for camping!`;
    } else {
      weatherEl.style.display = "none";
    }
  }
});