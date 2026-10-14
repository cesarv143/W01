function getCartContents() {
  const cartItems = localStorage.getItem('so-cart');
  return cartItems ? JSON.parse(cartItems) : [];
}

function renderCartContents() {
  const cartItems = getCartContents();
  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  const cartList = document.querySelector('.product-list--cart');
  if (cartList) {
    cartList.innerHTML = htmlItems.join('');
  }
}

function cartItemTemplate(item) {
  return `<li class="cart-card divider">
    <a href="#" class="cart-card__image">
      <img src="${item.Image}" alt="${item.Name}">
    </a>
    <a href="#">
      <h2 class="card__name">${item.Name}</h2>
    </a>
    <p class="cart-card__color">${item.Colors[0].ColorName}</p>
    <p class="cart-card__quantity">qty: 1</p>
    <p class="cart-card__price">$${item.FinalPrice}</p>
  </li>`;
}

renderCartContents();