(function () {
  const page = location.pathname.split("/").pop() || "index.html";
  const skipPages = new Set(["index.html", "cart.html", "checkout.html", "track-order.html", "account.html"]);
  const heroVideoSrc = "images/products/VID_20260515_203005.mp4";

  function link(label, href, className = "") {
    return `<a href="${href}" class="${className}">${label}</a>`;
  }

  function headerMarkup() {
    return `
      <header class="kv-shell-header">
        <div class="kv-shell-inner">
          <div class="kv-shell-row">
            <a href="index.html" class="kv-brand" aria-label="KisanValley home">
              <img src="images/kv.png" alt="KisanValley Logo">
              <span>
                <span class="kv-brand-title">KisanValley</span>
                <span class="kv-brand-subtitle">Farm machinery store</span>
              </span>
            </a>
            <nav class="kv-shell-nav" aria-label="Primary navigation">
              ${link("Home", "index.html")}
              ${link("Products", "index.html#products")}
              ${link("Services", "services.html")}
              ${link("Track Order", "track-order.html")}
              ${link("Wishlist", "wishlist.html", "wishlist-counter")}
              ${link("Cart", "cart.html", "cart-counter")}
              <a href="login.html" class="profile-link kv-profile-link" aria-label="Open customer dashboard">
                <span class="profile-initials kv-profile-initials">C</span>
                <span class="profile-label">Login</span>
              </a>
            </nav>
          </div>
        </div>
      </header>
    `;
  }

  function footerMarkup() {
    return `
      <footer class="kv-shell-footer">
        <div class="kv-shell-inner" style="padding-top:2.5rem;padding-bottom:2.5rem;">
          <div class="kv-footer-grid">
            <div>
              <a href="index.html" class="kv-brand" style="color:#fff;">
                <img src="images/kv.png" alt="KisanValley Logo">
                <span class="kv-brand-title">KisanValley</span>
              </a>
              <p style="margin-top:1rem;max-width:24rem;color:#94a3b8;font-size:.9rem;line-height:1.7;">Professional agricultural machinery with practical support from browsing to delivery.</p>
            </div>
            <div>
              <h3>Store</h3>
              <ul>
                <li>${link("Home", "index.html")}</li>
                <li>${link("Products", "index.html#products")}</li>
                <li>${link("Wishlist", "wishlist.html")}</li>
                <li>${link("Cart", "cart.html")}</li>
              </ul>
            </div>
            <div>
              <h3>Categories</h3>
              <ul>
                <li>${link("Weeders and Tillers", "weeder-tiller.html")}</li>
                <li>${link("Brush Cutters", "brush-cutters.html")}</li>
                <li>${link("Water Pumps", "water-pumps.html")}</li>
                <li>${link("Earth Augers", "earth-augers.html")}</li>
              </ul>
            </div>
            <div>
              <h3>Support</h3>
              <ul>
                <li>${link("Contact", "contact.html")}</li>
                <li>${link("Services", "services.html")}</li>
                <li>${link("Track Order", "track-order.html")}</li>
                <li>${link("Return Policy", "return-policy.html")}</li>
              </ul>
            </div>
          </div>
          <div style="margin-top:2rem;border-top:1px solid rgba(255,255,255,.1);padding-top:1.25rem;text-align:center;color:#64748b;font-size:.875rem;">&copy; 2026 KisanValley. All rights reserved.</div>
        </div>
      </footer>
    `;
  }

  function installLayout() {
    document.body.classList.add("kv-site");
    installVideoTheme();
    if (skipPages.has(page) || window.KV_SKIP_LAYOUT) return;

    const currentHeader = document.querySelector("body > header");
    if (currentHeader) {
      currentHeader.outerHTML = headerMarkup();
    } else {
      document.body.insertAdjacentHTML("afterbegin", headerMarkup());
    }

    const currentFooter = document.querySelector("body > footer");
    if (currentFooter) {
      currentFooter.outerHTML = footerMarkup();
    } else {
      document.body.insertAdjacentHTML("beforeend", footerMarkup());
    }

    if (typeof updateCartCounter === "function") updateCartCounter();
    if (typeof updateWishlistCounter === "function") updateWishlistCounter();
    if (typeof updateAccountLinks === "function") updateAccountLinks();
  }

  function installVideoTheme() {
    const themedSections = document.querySelectorAll([
      ".kv-page-hero",
      "main > section.bg-green-700",
      "main > section.rounded-lg.bg-green-700",
      "main > section.bg-field-900"
    ].join(","));

    themedSections.forEach(section => {
      if (section.querySelector(`video[src="${heroVideoSrc}"]`)) return;

      section.classList.add("kv-themed-video-section");
      section.insertAdjacentHTML("afterbegin", `
        <video
          class="kv-theme-video"
          src="${heroVideoSrc}"
          autoplay
          muted
          loop
          playsinline
          preload="metadata"
          aria-hidden="true"
        ></video>
      `);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installLayout);
  } else {
    installLayout();
  }
})();
