// This file will manage all shopping cart functionality

/**
 * Adds a product to the cart, which is stored in localStorage.
 * @param {string} productId - The unique ID of the product to add.
 */
function addToCart(productId) {
  // Get the current cart from localStorage or create a new one
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Find if the product is already in the cart
  const existingProductIndex = cart.findIndex(item => item.id === productId);

  if (existingProductIndex > -1) {
    // If it exists, just increase the quantity
    cart[existingProductIndex].quantity += 1;
  } else {
    // If it's a new product, add it to the cart with quantity 1
    cart.push({ id: productId, quantity: 1 });
  }

  // Save the updated cart back to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Give the user some feedback
  alert("Product added to cart!");
  
  // Optional: You could update a cart icon counter here
  updateCartCounter();
}

/**
 * Updates a cart counter element on the page.
 */
function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Find all cart link elements on the page
    const cartCounters = document.querySelectorAll('.cart-counter');
    
    cartCounters.forEach(counter => {
        if (totalItems > 0) {
            counter.textContent = `Cart 🛒 (${totalItems})`;
            counter.classList.add('font-semibold'); // Make it bold if there are items
        } else {
            counter.textContent = 'Cart 🛒';
        }
    });
}

// Run the counter update when the page loads
document.addEventListener('DOMContentLoaded', updateCartCounter);