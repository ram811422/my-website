const WISHLIST_KEY = "kvWishlist";

function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
  } catch (_err) {
    return [];
  }
}

function saveWishlist(ids) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify([...new Set(ids)]));
  updateWishlistCounter();
  syncWishlistButtons();
}

function isWishlisted(productId) {
  return getWishlist().includes(productId);
}

function toggleWishlist(productId) {
  const wishlist = getWishlist();
  const nextWishlist = wishlist.includes(productId)
    ? wishlist.filter(id => id !== productId)
    : [...wishlist, productId];
  saveWishlist(nextWishlist);
}

function updateWishlistCounter() {
  const total = getWishlist().length;
  document.querySelectorAll(".wishlist-counter").forEach(link => {
    link.textContent = total > 0 ? `Wishlist (${total})` : "Wishlist";
  });
}

function syncWishlistButtons() {
  document.querySelectorAll("[data-wishlist-id]").forEach(button => {
    const productId = button.getAttribute("data-wishlist-id");
    const active = isWishlisted(productId);
    button.textContent = active ? "Saved" : "Wishlist";
    button.setAttribute("aria-pressed", String(active));
    button.classList.toggle("bg-rose-600", active);
    button.classList.toggle("text-white", active);
    button.classList.toggle("border-rose-600", active);
  });
}

function getProductDetailUrl(productId) {
  return `product.html?id=${encodeURIComponent(productId)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  updateWishlistCounter();
  syncWishlistButtons();
});
