window.KV_SKIP_LAYOUT = true;

const categoryConfig = window.categoryConfig || {};
const currentCategory = categoryConfig.id;

const categoryLinks = [
  { id: "weeder-tiller", title: "Weeders & Tillers", href: "weeder-tiller.html" },
  { id: "brush-cutter", title: "Brush Cutters", href: "brush-cutters.html" },
  { id: "water-pump", title: "Water Pumps", href: "water-pumps.html" },
  { id: "earth-auger", title: "Earth Augers", href: "earth-augers.html" },
  { id: "sprayer", title: "Sprayers", href: "sprayers.html" },
  { id: "chainsaw", title: "Chainsaws", href: "chainsaws.html" }
];

let visibleProducts = [];

function formatPrice(price) {
  return `Rs. ${Number(price || 0).toLocaleString("en-IN")}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getProductsForCategory(categoryId) {
  return Object.values(allSiteProducts).filter(product => product.category === categoryId);
}

function getCategoryHeroImage(products) {
  const firstProductImage = products.find(product => product.image)?.image;
  return firstProductImage || "images/products/bw-25.jpg";
}

function getPriceSummary(products) {
  if (products.length === 0) {
    return { min: 0, max: 0, average: 0 };
  }

  const prices = products.map(product => Number(product.price) || 0);
  const total = prices.reduce((sum, price) => sum + price, 0);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    average: Math.round(total / prices.length)
  };
}

function getCategoryTitle(categoryId) {
  return categoryLinks.find(category => category.id === categoryId)?.title || "Farm Equipment";
}

function ensureCategoryShell(products) {
  if (document.getElementById("categoryGrid")) return;

  const title = categoryConfig.title || "Products";
  const description = categoryConfig.description || "Browse KisanValley agricultural machinery.";
  const heroImage = getCategoryHeroImage(products);
  const priceSummary = getPriceSummary(products);

  document.title = `${title} | KisanValley`;
  document.body.className = "kv-site category-page bg-[#f7f8f3] text-slate-900 antialiased";
  document.body.innerHTML = `
    <header class="category-header sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <a href="index.html" class="flex items-center gap-3" aria-label="KisanValley home">
            <img src="images/kv.png" alt="KisanValley Logo" class="h-11 w-11 rounded-lg object-contain" />
            <span>
              <span class="block text-xl font-black tracking-tight text-field-900">KisanValley</span>
              <span class="hidden text-xs font-bold uppercase tracking-[0.18em] text-slate-500 sm:block">Farm machinery store</span>
            </span>
          </a>

          <nav class="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-700" aria-label="Primary navigation">
            <a href="index.html" class="category-nav-link">Home</a>
            <a href="index.html#products" class="category-nav-link">Products</a>
            <a href="services.html" class="category-nav-link">Services</a>
            <a href="wishlist.html" class="wishlist-counter category-nav-link">Wishlist</a>
            <a href="cart.html" class="cart-counter category-cart-link">Cart</a>
            <a href="login.html" class="profile-link category-profile-link" aria-label="Open customer dashboard">
              <span class="profile-initials category-profile-initials">C</span>
              <span class="profile-label">Login</span>
            </a>
          </nav>
        </div>
      </div>
    </header>

    <main>
      <section class="category-hero relative overflow-hidden bg-field-900 text-white">
        <div class="absolute inset-0">
          <img src="${heroImage}" alt="" class="h-full w-full object-cover opacity-35" />
          <div class="absolute inset-0 bg-gradient-to-r from-field-900 via-field-900/90 to-field-900/55"></div>
        </div>
        <div class="relative mx-auto grid min-h-[430px] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <nav class="mb-6 text-sm font-bold text-field-100" aria-label="Breadcrumb">
              <a href="index.html" class="hover:text-white">Home</a>
              <span class="mx-2 text-white/50">/</span>
              <a href="index.html#categories" class="hover:text-white">Categories</a>
            </nav>
            <p class="inline-flex rounded-full bg-white/12 px-4 py-2 text-sm font-black text-field-50 ring-1 ring-white/20">Product category</p>
            <h1 id="categoryTitle" class="mt-5 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl">${title}</h1>
            <p id="categoryDescription" class="mt-5 max-w-2xl text-lg leading-8 text-field-50">${description}</p>
            <div class="mt-8 flex flex-wrap gap-3">
              <a href="#categoryGrid" class="inline-flex h-12 items-center rounded-full bg-harvest px-6 text-sm font-black text-field-900 shadow-soft hover:bg-yellow-300">View Products</a>
              <a href="contact.html" class="inline-flex h-12 items-center rounded-full bg-white/10 px-6 text-sm font-black text-white ring-1 ring-white/25 hover:bg-white/15">Get Buying Help</a>
            </div>
          </div>

          <div class="category-hero-panel rounded-2xl bg-white/95 p-5 text-slate-950 shadow-lift ring-1 ring-white/40">
            <div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div class="rounded-xl bg-field-50 p-4">
                <p class="text-sm font-bold text-slate-500">Available</p>
                <p id="categoryCount" class="mt-1 text-3xl font-black text-field-700">0</p>
              </div>
              <div class="rounded-xl bg-slate-50 p-4">
                <p class="text-sm font-bold text-slate-500">Starting at</p>
                <p id="categoryMinPrice" class="mt-1 text-2xl font-black text-slate-950">${formatPrice(priceSummary.min)}</p>
              </div>
              <div class="rounded-xl bg-slate-50 p-4">
                <p class="text-sm font-bold text-slate-500">Popular range</p>
                <p id="categoryAvgPrice" class="mt-1 text-2xl font-black text-slate-950">${formatPrice(priceSummary.average)}</p>
              </div>
            </div>
            <p class="mt-5 text-sm leading-6 text-slate-600">Compare models, save options to your wishlist, or add equipment directly to cart when you are ready.</p>
          </div>
        </div>
      </section>

      <section class="border-b border-slate-200 bg-white">
        <div id="categoryTabs" class="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8" aria-label="Category navigation"></div>
      </section>

      <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div class="mb-7 grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <div>
            <p class="text-sm font-black uppercase tracking-[0.18em] text-field-600">Catalog</p>
            <h2 class="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Choose the right model</h2>
          </div>
          <label class="relative block">
            <span class="sr-only">Search this category</span>
            <input id="categorySearch" type="search" placeholder="Search this category..." class="h-12 w-full min-w-0 rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-field-600 focus:ring-4 focus:ring-field-100 lg:w-72" />
            <svg class="absolute left-4 top-3.5 h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
            </svg>
          </label>
          <label class="block">
            <span class="sr-only">Sort products</span>
            <select id="categorySort" class="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 outline-none transition focus:border-field-600 focus:ring-4 focus:ring-field-100 lg:w-52">
              <option value="featured">Sort: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
        </div>

        <div id="categoryGrid" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"></div>
        <div id="emptyCategory" class="hidden rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-soft">
          <h2 class="text-2xl font-black text-slate-950">Products coming soon</h2>
          <p id="emptyCategoryText" class="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">This category is ready. Products added to this category will appear here automatically.</p>
          <a href="index.html#categories" class="mt-5 inline-flex rounded-full bg-field-700 px-5 py-3 text-sm font-extrabold text-white hover:bg-field-900">Browse Categories</a>
        </div>
      </section>

      <section class="bg-white py-12">
        <div class="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div class="rounded-2xl bg-field-50 p-6">
            <p class="text-sm font-black uppercase tracking-[0.16em] text-field-600">Support</p>
            <h3 class="mt-3 text-xl font-black text-slate-950">Need help matching equipment to your field?</h3>
            <p class="mt-3 text-sm leading-6 text-slate-600">Share your crop, acreage, soil condition, and work type so KisanValley can help you compare options.</p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-6">
            <p class="text-sm font-black uppercase tracking-[0.16em] text-field-600">Ordering</p>
            <h3 class="mt-3 text-xl font-black text-slate-950">Add products to cart or shortlist first.</h3>
            <p class="mt-3 text-sm leading-6 text-slate-600">Use wishlist for comparison and cart checkout when your model choice is final.</p>
          </div>
          <div class="rounded-2xl bg-slate-950 p-6 text-white">
            <p class="text-sm font-black uppercase tracking-[0.16em] text-field-100">After sale</p>
            <h3 class="mt-3 text-xl font-black">Track orders and reach support anytime.</h3>
            <a href="track-order.html" class="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 hover:bg-field-50">Track Order</a>
          </div>
        </div>
      </section>
    </main>

    <footer class="bg-slate-950 text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" class="sr-only">Footer</h2>
      <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <div class="flex items-center gap-3">
              <img class="h-11 w-11 rounded-lg object-contain" src="images/kv.png" alt="KisanValley Logo" />
              <span class="text-2xl font-black">KisanValley</span>
            </div>
            <p class="mt-5 max-w-sm text-sm leading-6 text-slate-400">Quality agricultural machinery, practical buying support, and a smoother online ordering experience for farmers and field teams.</p>
          </div>
          <div class="grid gap-8 sm:grid-cols-3">
            <div>
              <h3 class="text-sm font-black uppercase tracking-wider text-slate-200">Store</h3>
              <ul class="mt-4 space-y-3 text-sm text-slate-400">
                <li><a href="index.html" class="hover:text-white">Home</a></li>
                <li><a href="index.html#products" class="hover:text-white">Products</a></li>
                <li><a href="wishlist.html" class="hover:text-white">Wishlist</a></li>
                <li><a href="cart.html" class="hover:text-white">Cart</a></li>
              </ul>
            </div>
            <div>
              <h3 class="text-sm font-black uppercase tracking-wider text-slate-200">Categories</h3>
              <ul class="mt-4 space-y-3 text-sm text-slate-400">
                ${categoryLinks.slice(0, 4).map(category => `<li><a href="${category.href}" class="hover:text-white">${category.title}</a></li>`).join("")}
              </ul>
            </div>
            <div>
              <h3 class="text-sm font-black uppercase tracking-wider text-slate-200">Support</h3>
              <ul class="mt-4 space-y-3 text-sm text-slate-400">
                <li><a href="contact.html" class="hover:text-white">Contact</a></li>
                <li><a href="services.html" class="hover:text-white">Services</a></li>
                <li><a href="track-order.html" class="hover:text-white">Track Order</a></li>
                <li><a href="return-policy.html" class="hover:text-white">Return Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-500">&copy; 2026 KisanValley. All rights reserved.</div>
      </div>
    </footer>
  `;
}

function renderCategoryTabs() {
  const tabsEl = document.getElementById("categoryTabs");
  if (!tabsEl) return;

  tabsEl.innerHTML = categoryLinks.map(category => {
    const active = category.id === currentCategory;
    const count = getProductsForCategory(category.id).length;
    return `
      <a href="${category.href}" class="shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${active ? "bg-field-900 text-white shadow-soft" : "bg-slate-100 text-slate-700 hover:bg-field-50 hover:text-field-700"}">
        ${category.title}
        <span class="${active ? "text-field-100" : "text-slate-500"}"> ${count}</span>
      </a>
    `;
  }).join("");
}

function sortProducts(products, sortValue) {
  const sorted = [...products];

  if (sortValue === "price-low") {
    sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  } else if (sortValue === "price-high") {
    sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  } else if (sortValue === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  }

  return sorted;
}

function getFilteredProducts() {
  const searchEl = document.getElementById("categorySearch");
  const sortEl = document.getElementById("categorySort");
  const query = (searchEl?.value || "").trim().toLowerCase();
  const sortValue = sortEl?.value || "featured";

  const filtered = visibleProducts.filter(product => {
    const haystack = [product.name, product.description, ...(product.specs || [])].join(" ").toLowerCase();
    return haystack.includes(query);
  });

  return sortProducts(filtered, sortValue);
}

function renderProductCard(product, index) {
  const specs = (product.specs || []).slice(0, 2);
  const safeId = escapeHtml(product.id);
  const safeName = escapeHtml(product.name);
  const safeImage = escapeHtml(product.image);
  const safeCategory = escapeHtml(getCategoryTitle(product.category));
  const safeDescription = escapeHtml(product.description || "Reliable agricultural machinery from KisanValley.");
  const safeUrl = escapeHtml(getProductDetailUrl(product.id));
  const jsId = escapeHtml(JSON.stringify(String(product.id)));

  return `
    <article class="product-card category-card group flex overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-200 transition" style="animation-delay:${index * 45}ms">
      <div class="flex w-full flex-col">
        <a href="${safeUrl}" class="product-image-wrap block">
          <img src="${safeImage}" alt="${safeName}" loading="lazy">
        </a>
        <div class="flex flex-1 flex-col p-5">
          <p class="text-xs font-black uppercase tracking-[0.16em] text-field-600">${safeCategory}</p>
          <a href="${safeUrl}" class="mt-2 line-clamp-2 text-lg font-black leading-6 text-slate-950 hover:text-field-700">${safeName}</a>
          <p class="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">${safeDescription}</p>
          ${specs.length ? `
            <ul class="mt-4 space-y-2 text-sm font-semibold text-slate-600">
              ${specs.map(spec => `<li class="flex gap-2"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-field-600"></span><span>${escapeHtml(spec)}</span></li>`).join("")}
            </ul>
          ` : ""}
          <div class="mt-auto pt-5">
            <div class="mb-4 flex items-center justify-between gap-3">
              <p class="text-2xl font-black text-field-700">${formatPrice(product.price)}</p>
              <a href="${safeUrl}" class="text-sm font-black text-slate-500 hover:text-field-700">Details</a>
            </div>
            <div class="grid grid-cols-[1fr_auto] gap-2">
              <button onclick="addToCart(${jsId})" class="h-11 rounded-full bg-field-700 px-4 text-sm font-black text-white hover:bg-field-900">Add to Cart</button>
              <button type="button" data-wishlist-id="${safeId}" onclick="toggleWishlist(${jsId})" class="h-11 rounded-full border border-slate-200 px-4 text-sm font-black text-slate-700 hover:border-rose-500 hover:text-rose-600" aria-label="Add ${safeName} to wishlist">Wishlist</button>
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
}

function updateCategoryStats(products) {
  const priceSummary = getPriceSummary(products);
  const countEl = document.getElementById("categoryCount");
  const minEl = document.getElementById("categoryMinPrice");
  const avgEl = document.getElementById("categoryAvgPrice");

  if (countEl) countEl.textContent = `${products.length} ${products.length === 1 ? "model" : "models"}`;
  if (minEl) minEl.textContent = products.length ? formatPrice(priceSummary.min) : "Coming soon";
  if (avgEl) avgEl.textContent = products.length ? formatPrice(priceSummary.average) : "Coming soon";
}

function renderProducts() {
  const gridEl = document.getElementById("categoryGrid");
  const emptyEl = document.getElementById("emptyCategory");
  const emptyTextEl = document.getElementById("emptyCategoryText");
  if (!gridEl || !emptyEl) return;

  const products = getFilteredProducts();

  if (products.length === 0) {
    gridEl.classList.add("hidden");
    emptyEl.classList.remove("hidden");
    if (emptyTextEl) {
      emptyTextEl.textContent = visibleProducts.length
        ? "No products match your current search. Clear the search or try another sort option."
        : "This category is ready. Products added to this category will appear here automatically.";
    }
    return;
  }

  gridEl.classList.remove("hidden");
  emptyEl.classList.add("hidden");
  gridEl.innerHTML = products.map(renderProductCard).join("");

  if (typeof syncWishlistButtons === "function") syncWishlistButtons();
}

function bindCategoryControls() {
  const searchEl = document.getElementById("categorySearch");
  const sortEl = document.getElementById("categorySort");

  searchEl?.addEventListener("input", renderProducts);
  sortEl?.addEventListener("change", renderProducts);
}

function renderCategoryPage() {
  visibleProducts = getProductsForCategory(currentCategory);
  ensureCategoryShell(visibleProducts);
  renderCategoryTabs();
  updateCategoryStats(visibleProducts);
  bindCategoryControls();
  renderProducts();

  if (typeof updateCartCounter === "function") updateCartCounter();
  if (typeof updateWishlistCounter === "function") updateWishlistCounter();
  if (typeof updateAccountLinks === "function") updateAccountLinks();
}

document.addEventListener("DOMContentLoaded", renderCategoryPage);
