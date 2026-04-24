// A central database for all products
const allSiteProducts = {
  // We use IDs for easier management
  "bp-650": {
    id: "bp-650",
    name: "Balwaan Power Weeder (BP-650)",
    image: "images/products/bp-650.webp",
    price: 39999,
    category: "weeder-tiller"
  },
  "bx-35": {
    id: "bx-35",
    name: "Balwaan Side Pack Brush Cutter (BX-35)",
    image: "images/products/bx-35.jpg",
    price: 11900,
    category: "brush-cutter"
  },
  "be-63": {
    id: "be-63",
    name: "Balwaan Earth Auger (BE-63)",
    image: "images/products/be-63.jpg",
    price: 15000,
    category: "earth-auger"
  },
  "wp-33r": {
    id: "wp-33r",
    name: "Balwaan Water Pump (WP-33R)",
    image: "images/products/wp-33r.webp",
    price: 12900,
    category: "water-pump"
  },
  "bx-50": {
    id: "bx-50",
    name: "Balwaan Side Pack 50cc 4-Stroke Brush Cutter (BX-50)",
    image: "images/products/bx-50.jpg",
    price: 14900,
    category: "brush-cutter"
  },
  "bx-52": {
    id: "bx-52",
    name: "Balwaan Side Pack 52cc 2 stroke Brush Cutter (BX-52)",
    image: "images/products/bx-52.webp",
    price: 8900,
    category: "brush-cutter"
  },
  "bp-700": {
    id: "bp-700",
    name: "Balwaan Power weeder (BP-700)",
    image: "images/products/bp-700.jpg",
    price: 55000,
    category: "weeder-tiller"
  },
  "bw-25": {
    id: "bw-25",
    name: "Balwaan 63cc Mini Agricultural Power Tiller (BW-25)",
    image: "images/products/bw-25.jpg",
    price: 19700,
    category: "weeder-tiller"
  },
  "bp-800b": {
    id: "bp-800b",
    name: "Balwaan Back Rotary Power Weeder (BP-800B)",
    image: "images/products/bp-800b.jpeg",
    price: 150000,
    category: "weeder-tiller"
  }
};

// Also, let's include the admin-added products from localStorage
// This combines our "database" with the dynamic products from the admin panel
const adminProducts = JSON.parse(localStorage.getItem("products")) || [];
adminProducts.forEach((product, index) => {
  const productId = `admin-${index}`;
  allSiteProducts[productId] = {
    id: productId,
    ...product,
    price: Number(product.price) // Ensure price is a number
  };
});