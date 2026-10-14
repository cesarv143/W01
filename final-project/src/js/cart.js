import { getLocalStorage, setLocalStorage } from "./utils.mjs";

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart");
  
  if (!cartItems || cartItems.length === 0) {
    document.querySelector(".product-list").innerHTML = "<p>Your cart is empty.</p>";
    hideCartTotal();
    return;
  }

  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  document.querySelector(".product-list").innerHTML = htmlItems.join("");
  
  displayCartTotal(cartItems);
  setDeleteListeners();
}

function cartItemTemplate(item) {
  const newItem = `<li class="cart-card divider">
  <span class="cart-remove-item" data-id="${item.Id}">X</span>
  <a href="#" class="cart-card__image">
    <img
      src="${item.Image}"
      alt="${item.Name}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${item.Colors && item.Colors[0] ? item.Colors[0].ColorName : ""}</p>
  <p class="cart-card__quantity">qty: ${item.quantity || 1}</p>
  <p class="cart-card__price">$${item.FinalPrice}</p>
</li>`;

  return newItem;
}

function displayCartTotal(cartItems) {
  const cartFooter = document.querySelector(".cart-footer");
  const cartTotalElement = document.querySelector(".cart-total");

  if (!cartFooter || !cartTotalElement) return;

  const total = cartItems.reduce((sum, item) => sum + (item.FinalPrice * (item.quantity || 1)), 0);
  
  cartTotalElement.innerHTML = `Total: $${total.toFixed(2)}`;
  cartFooter.classList.remove("hide");
}

function hideCartTotal() {
  const cartFooter = document.querySelector(".cart-footer");
  if (cartFooter) {
    cartFooter.classList.add("hide");
  }
}

function removeItem(e) {
  const id = e.target.dataset.id;
  let cartItems = getLocalStorage("so-cart");
  
  cartItems = cartItems.filter((item) => item.Id !== id);
  
  setLocalStorage("so-cart", cartItems);
  renderCartContents();
}

function setDeleteListeners() {
  const deleteButtons = document.querySelectorAll(".cart-remove-item");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", removeItem);
  });
}

renderCartContents();