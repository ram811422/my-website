// This file will manage all shopping cart functionality

function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function showCartNotice(message) {
  let notice = document.getElementById("cartNotice");
  if (!notice) {
    notice = document.createElement("div");
    notice.id = "cartNotice";
    notice.setAttribute("role", "status");
    notice.className = "fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-field-900 px-5 py-3 text-sm font-extrabold text-white shadow-lift transition";
    document.body.appendChild(notice);
  }

  notice.textContent = message;
  notice.classList.remove("opacity-0", "translate-y-2");
  window.clearTimeout(showCartNotice.timer);
  showCartNotice.timer = window.setTimeout(() => {
    notice.classList.add("opacity-0", "translate-y-2");
  }, 1800);
}

/**
 * Adds a product to the cart, which is stored in localStorage.
 * @param {string} productId - The unique ID of the product to add.
 */
function addToCart(productId) {
  const cart = getCart();

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
  saveCart(cart);

  showCartNotice("Product added to cart");
  
  // Optional: You could update a cart icon counter here
  updateCartCounter();
}

/**
 * Updates a cart counter element on the page.
 */
function updateCartCounter() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Find all cart link elements on the page
    const cartCounters = document.querySelectorAll('.cart-counter');
    
    cartCounters.forEach(counter => {
        if (totalItems > 0) {
            counter.textContent = `Cart (${totalItems})`;
            counter.classList.add('font-semibold'); // Make it bold if there are items
        } else {
            counter.textContent = 'Cart';
        }
    });
}

// Run the counter update when the page loads
document.addEventListener('DOMContentLoaded', updateCartCounter);
