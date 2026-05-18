// A central database for all products
const allSiteProducts = {
  // We use IDs for easier management
  "bp-650": {
    id: "bp-650",
    name: "Balwaan Power Weeder (BP-650)",
    image: "images/products/bp-650.webp",
    price: 39999,
    category: "weeder-tiller",
    description: "A practical power weeder for soil preparation, inter-cultivation, and regular field maintenance.",
    specs: ["Suitable for small and medium farms", "Petrol powered operation", "Built for soil loosening and weeding"]
  },
  "bx-35": {
    id: "bx-35",
    name: "Balwaan Side Pack Brush Cutter (BX-35)",
    image: "images/products/bx-35.jpg",
    price: 11900,
    category: "brush-cutter",
    description: "A side-pack brush cutter for grass trimming, field-edge cleaning, and weed control.",
    specs: ["Side-pack design", "Useful for grass and weed cutting", "Easy to carry during field work"]
  },
  "be-63": {
    id: "be-63",
    name: "Balwaan Earth Auger (BE-63)",
    image: "images/products/be-63.jpg",
    price: 15000,
    category: "earth-auger",
    description: "A farm earth auger for plantation, fencing, and fast hole digging in prepared soil.",
    specs: ["Useful for planting and fencing", "Portable field machine", "Designed for faster digging"]
  },
  "wp-33r": {
    id: "wp-33r",
    name: "Balwaan Water Pump (WP-33R)",
    image: "images/products/wp-33r.webp",
    price: 12900,
    category: "water-pump",
    description: "A compact water pump for irrigation, water transfer, and farm utility tasks.",
    specs: ["Suitable for farm water movement", "Compact field-ready design", "Useful for irrigation support"]
  },
  "bx-50": {
    id: "bx-50",
    name: "Balwaan Side Pack 50cc 4-Stroke Brush Cutter (BX-50)",
    image: "images/products/bx-50.jpg",
    price: 14900,
    category: "brush-cutter",
    description: "A 50cc 4-stroke brush cutter for tougher grass, weeds, and regular field clearing.",
    specs: ["50cc 4-stroke engine", "Side-pack brush cutter", "Good for frequent cutting work"]
  },
  "bx-52": {
    id: "bx-52",
    name: "Balwaan Side Pack 52cc 2 stroke Brush Cutter (BX-52)",
    image: "images/products/bx-52.webp",
    price: 8900,
    category: "brush-cutter",
    description: "A 52cc 2-stroke brush cutter for quick trimming and farm boundary maintenance.",
    specs: ["52cc 2-stroke engine", "Useful for weed and grass cutting", "Budget-friendly field tool"]
  },
  "bp-700": {
    id: "bp-700",
    name: "Balwaan Power weeder (BP-700)",
    image: "images/products/bp-700.jpg",
    price: 55000,
    category: "weeder-tiller",
    description: "A power weeder for heavier field preparation and repeated agricultural use.",
    specs: ["Heavy-duty field use", "Useful for inter-cultivation", "Designed for soil preparation"]
  },
  "bw-25": {
    id: "bw-25",
    name: "Balwaan 63cc Mini Agricultural Power Tiller (BW-25)",
    image: "images/products/bw-25.jpg",
    price: 19700,
    category: "weeder-tiller",
    description: "A mini agricultural power tiller for smaller plots, light tilling, and maintenance work.",
    specs: ["63cc mini tiller", "Compact and portable", "Useful for small farms and gardens"]
  },
  "bp-800b": {
    id: "bp-800b",
    name: "Balwaan Back Rotary Power Weeder (BP-800B)",
    image: "images/products/bp-800b.jpeg",
    price: 150000,
    category: "weeder-tiller",
    description: "A back rotary power weeder for demanding field work and larger farm operations.",
    specs: ["Back rotary weeder", "Built for larger tasks", "Premium power weeder option"]
  }
};

function getAdminProducts() {
  try {
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    return Array.isArray(products) ? products : [];
  } catch {
    return [];
  }
}

// This combines the built-in catalog with dynamic products from the admin panel.
const adminProducts = getAdminProducts();
adminProducts.forEach((product, index) => {
  const productId = `admin-${index}`;
  allSiteProducts[productId] = {
    id: productId,
    ...product,
    price: Number(product.price) || 0
  };
});
