import tentsData from '../json/tents.json';

function renderProducts() {
  const productListElement = document.querySelector('.product-list');
  if (!productListElement) return;

  let html = '';
  tentsData.forEach(tent => {
    html += `
      <li class="product-card">
        <a href="/product_pages/index.html?product=${tent.Id}">
          <img src="${tent.Image}" alt="${tent.Name}">
          <h3 class="card__brand">${tent.Brand.Name}</h3>
          <h2 class="card__name">${tent.NameWithoutBrand}</h2>
          <p class="product-card__price">$${tent.FinalPrice}</p>
        </a>
      </li>
    `;
  });
  productListElement.innerHTML = html;
}

renderProducts();