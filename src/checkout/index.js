import { loadHeaderFooter } from "../js/loadHeaderFooter.mjs";
import CheckoutProcess from "../js/CheckoutProcess.mjs";

loadHeaderFooter();

const myCheckout = new CheckoutProcess("so-cart", ".checkout-summary");
myCheckout.init();

document.querySelector("#zip").addEventListener("blur", () => {
  myCheckout.calculateOrdertotal();
});

document.querySelector("#checkoutSubmit").addEventListener("click", (e) => {
  e.preventDefault();
  const myForm = document.forms[0];
  if (myForm.checkValidity()) {
    myCheckout.checkout(myForm);
  } else {
    myForm.reportValidity();
  }
});