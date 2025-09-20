import { loadHeaderFooter } from './utils.mjs';
loadHeaderFooter();

const form = document.getElementById('checkout-form');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Order placed! (demo)');
});
