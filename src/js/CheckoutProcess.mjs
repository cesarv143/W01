import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
  }

  init() {
    this.list = getLocalStorage(this.key);
    this.calculateItemSummary();
  }

  calculateItemSummary() {
    const summaryElement = document.querySelector(`${this.outputSelector} #cartTotal`);
    const itemNumElement = document.querySelector(`${this.outputSelector} #num-items`);
    
    if (itemNumElement) {
      itemNumElement.textContent = this.list.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }

    this.itemTotal = this.list.reduce((sum, item) => sum + (item.FinalPrice * (item.quantity || 1)), 0);
    
    if (summaryElement) {
      summaryElement.textContent = `$${this.itemTotal.toFixed(2)}`;
    }
    
    this.calculateOrdertotal();
  }

  calculateOrdertotal() {
    let subtotal = this.itemTotal;
    let shippingCount = this.list.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    this.shipping = shippingCount > 0 ? 10 + (shippingCount - 1) * 2 : 0;
    this.tax = Number((subtotal * 0.06).toFixed(2));
    this.orderTotal = Number((subtotal + this.shipping + this.tax).toFixed(2));
    
    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const shippingElement = document.querySelector(`${this.outputSelector} #shipping`);
    const taxElement = document.querySelector(`${this.outputSelector} #tax`);
    const orderTotalElement = document.querySelector(`${this.outputSelector} #orderTotal`);

    if (shippingElement) shippingElement.textContent = `$${this.shipping.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${this.tax.toFixed(2)}`;
    if (orderTotalElement) orderTotalElement.textContent = `$${this.orderTotal.toFixed(2)}`;
  }

  async checkout(form) {
    const formData = formDataToJSON(form);
    formData.orderDate = new Date().toISOString();
    formData.orderTotal = this.orderTotal;
    formData.shipping = this.shipping;
    formData.tax = this.tax;
    formData.items = packageItems(this.list);

    try {
      const dataSource = new ProductData();
      const res = await dataSource.checkout(formData);
      console.log(res);
      setLocalStorage(this.key, []);
      window.location.assign("../checkout/success.html");
    } catch (err) {
      console.log(err);
    }
  }
}

function formDataToJSON(formElement) {
  const formData = new FormData(formElement),
    convertedJSON = {};

  formData.forEach((value, key) => {
    convertedJSON[key] = value;
  });

  return convertedJSON;
}

function packageItems(items) {
  return items.map((item) => ({
    id: item.Id,
    name: item.Name,
    price: item.FinalPrice,
    quantity: item.quantity || 1
  }));
}