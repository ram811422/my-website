const KV_REVIEWS_KEY = "kvProductReviews";

const defaultProductReviews = {
  "bp-650": [
    {
      id: "seed-bp-650-1",
      name: "Ramesh Patel",
      rating: 5,
      title: "Strong machine for regular farm use",
      text: "Used it for inter-cultivation work and the machine felt stable. Support helped me choose the right model before ordering.",
      date: "2026-04-18",
      verified: true
    },
    {
      id: "seed-bp-650-2",
      name: "Anil Kumar",
      rating: 4,
      title: "Good value and easy to handle",
      text: "Good for small plots and daily weeding work. Delivery updates were clear.",
      date: "2026-03-29",
      verified: true
    }
  ],
  "bx-35": [
    {
      id: "seed-bx-35-1",
      name: "Mahesh Singh",
      rating: 5,
      title: "Clean cutting performance",
      text: "Comfortable side pack and useful for boundary cleaning. The product matched the listing.",
      date: "2026-04-06",
      verified: true
    }
  ],
  "be-63": [
    {
      id: "seed-be-63-1",
      name: "Suresh Yadav",
      rating: 4,
      title: "Saved time during plantation",
      text: "Made digging faster for fencing work. Good option if you need repeated holes in prepared soil.",
      date: "2026-02-21",
      verified: true
    }
  ],
  "wp-33r": [
    {
      id: "seed-wp-33r-1",
      name: "Vikram Sharma",
      rating: 5,
      title: "Reliable for irrigation support",
      text: "Compact and practical for water transfer. Packaging was neat and checkout was simple.",
      date: "2026-04-12",
      verified: true
    }
  ],
  "bx-50": [
    {
      id: "seed-bx-50-1",
      name: "Harpreet Gill",
      rating: 4,
      title: "Handles tougher grass well",
      text: "Useful for frequent clearing around the farm. I liked the clear product information.",
      date: "2026-03-16",
      verified: true
    }
  ],
  "bp-700": [
    {
      id: "seed-bp-700-1",
      name: "Devendra Rao",
      rating: 5,
      title: "Built for heavier field work",
      text: "The power weeder feels sturdy and suitable for repeated use. Support response was quick.",
      date: "2026-04-27",
      verified: true
    }
  ]
};

function getStoredReviewMap() {
  try {
    return JSON.parse(localStorage.getItem(KV_REVIEWS_KEY)) || {};
  } catch (_err) {
    return {};
  }
}

function saveStoredReviewMap(reviewMap) {
  localStorage.setItem(KV_REVIEWS_KEY, JSON.stringify(reviewMap));
}

function getProductReviews(productId) {
  const storedReviews = getStoredReviewMap()[productId] || [];
  const seededReviews = defaultProductReviews[productId] || [];
  return [...storedReviews, ...seededReviews].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getReviewSummary(productId) {
  const reviews = getProductReviews(productId);

  if (reviews.length === 0) {
    return {
      average: 0,
      count: 0,
      distribution: [5, 4, 3, 2, 1].map(rating => ({ rating, count: 0, percent: 0 }))
    };
  }

  const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  const average = total / reviews.length;
  const distribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(review => Number(review.rating) === rating).length;
    return { rating, count, percent: Math.round((count / reviews.length) * 100) };
  });

  return { average, count: reviews.length, distribution };
}

function escapeReviewHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderStars(rating, sizeClass = "h-5 w-5") {
  const roundedRating = Math.round(Number(rating || 0));
  return Array.from({ length: 5 }, (_, index) => {
    const active = index < roundedRating;
    return `
      <svg class="${sizeClass} ${active ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 1.7 12.5 7l5.8.8-4.2 4.1 1 5.8-5.1-2.7-5.1 2.7 1-5.8L1.7 7l5.8-.8L10 1.7Z"></path>
      </svg>
    `;
  }).join("");
}

function renderCompactRating(productId) {
  const summary = getReviewSummary(productId);

  if (!summary.count) {
    return `
      <div class="mt-3 flex items-center gap-2 text-sm font-bold text-slate-500">
        <span class="flex">${renderStars(0, "h-4 w-4")}</span>
        <span>No reviews yet</span>
      </div>
    `;
  }

  return `
    <div class="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-600">
      <span class="flex">${renderStars(summary.average, "h-4 w-4")}</span>
      <span class="text-slate-950">${summary.average.toFixed(1)}</span>
      <span>${summary.count} review${summary.count === 1 ? "" : "s"}</span>
    </div>
  `;
}

function formatReviewDate(dateValue) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(dateValue));
}

function setReviewRating(rating) {
  const ratingInput = document.getElementById("reviewRating");
  if (!ratingInput) return;
  ratingInput.value = String(rating);
  document.querySelectorAll("[data-review-star]").forEach(button => {
    const buttonRating = Number(button.getAttribute("data-review-star"));
    button.classList.toggle("text-amber-400", buttonRating <= rating);
    button.classList.toggle("text-slate-300", buttonRating > rating);
    button.setAttribute("aria-pressed", String(buttonRating <= rating));
  });
}

function renderReviewSystem(product) {
  const mount = document.getElementById("reviewsMount");
  if (!mount || !product) return;

  const reviews = getProductReviews(product.id);
  const summary = getReviewSummary(product.id);
  const latestReviews = reviews.slice(0, 8);

  mount.innerHTML = `
    <section class="mt-8 rounded-lg border border-slate-200 bg-white p-6">
      <div class="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-sm font-black uppercase tracking-wide text-emerald-700">Customer Reviews</p>
          <h2 class="mt-1 text-2xl font-black tracking-tight text-slate-950">Field feedback for ${escapeReviewHtml(product.name)}</h2>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Share practical details about performance, delivery, handling, and support so other buyers can decide with confidence.</p>
        </div>
        <div class="rounded-lg bg-slate-950 px-5 py-4 text-white">
          <div class="flex items-center gap-3">
            <span class="text-4xl font-black">${summary.count ? summary.average.toFixed(1) : "0.0"}</span>
            <div>
              <div class="flex">${renderStars(summary.average, "h-5 w-5")}</div>
              <p class="mt-1 text-sm font-bold text-slate-300">${summary.count} review${summary.count === 1 ? "" : "s"}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 grid gap-8 lg:grid-cols-[340px_1fr]">
        <div class="space-y-5">
          <div class="rounded-lg border border-slate-200 bg-stone-50 p-5">
            <h3 class="font-black text-slate-950">Rating breakdown</h3>
            <div class="mt-4 grid gap-3">
              ${summary.distribution.map(item => `
                <div class="grid grid-cols-[54px_1fr_34px] items-center gap-3 text-sm font-bold text-slate-600">
                  <span>${item.rating} star</span>
                  <span class="h-2 overflow-hidden rounded-full bg-slate-200">
                    <span class="block h-full rounded-full bg-amber-400" style="width: ${item.percent}%"></span>
                  </span>
                  <span class="text-right">${item.count}</span>
                </div>
              `).join("")}
            </div>
          </div>

          <form class="rounded-lg border border-emerald-100 bg-emerald-50 p-5" onsubmit="submitProductReview(event, '${escapeReviewHtml(product.id)}')">
            <h3 class="font-black text-slate-950">Write a review</h3>
            <input type="hidden" id="reviewRating" value="5">
            <div class="mt-4">
              <label class="text-sm font-black text-slate-900">Your rating</label>
              <div class="mt-2 flex gap-1" role="group" aria-label="Choose rating">
                ${[1, 2, 3, 4, 5].map(rating => `
                  <button type="button" data-review-star="${rating}" onclick="setReviewRating(${rating})" class="text-amber-400 transition hover:scale-110" aria-label="${rating} star" aria-pressed="true">
                    <svg class="h-8 w-8 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M10 1.7 12.5 7l5.8.8-4.2 4.1 1 5.8-5.1-2.7-5.1 2.7 1-5.8L1.7 7l5.8-.8L10 1.7Z"></path>
                    </svg>
                  </button>
                `).join("")}
              </div>
            </div>
            <label class="mt-4 block text-sm font-black text-slate-900" for="reviewName">Name</label>
            <input id="reviewName" required maxlength="40" class="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" placeholder="Your name">
            <label class="mt-4 block text-sm font-black text-slate-900" for="reviewTitle">Review title</label>
            <input id="reviewTitle" required maxlength="70" class="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" placeholder="Short summary">
            <label class="mt-4 block text-sm font-black text-slate-900" for="reviewText">Review</label>
            <textarea id="reviewText" required maxlength="600" rows="4" class="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm font-semibold leading-6 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" placeholder="How did this product perform?"></textarea>
            <button type="submit" class="mt-4 w-full rounded-md bg-emerald-700 px-4 py-3 font-black text-white hover:bg-emerald-800">Submit Review</button>
          </form>
        </div>

        <div>
          <div class="flex items-center justify-between gap-3">
            <h3 class="font-black text-slate-950">Recent reviews</h3>
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-600">Moderated</span>
          </div>
          <div class="mt-4 grid gap-4">
            ${latestReviews.length ? latestReviews.map(review => `
              <article class="rounded-lg border border-slate-200 bg-white p-5">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div class="flex">${renderStars(review.rating, "h-4 w-4")}</div>
                    <h4 class="mt-2 text-lg font-black text-slate-950">${escapeReviewHtml(review.title)}</h4>
                    <p class="mt-1 text-sm font-bold text-slate-500">${escapeReviewHtml(review.name)} - ${formatReviewDate(review.date)}</p>
                  </div>
                  ${review.verified ? `<span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-700">Verified buyer</span>` : `<span class="rounded-full bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-amber-700">New review</span>`}
                </div>
                <p class="mt-4 leading-7 text-slate-700">${escapeReviewHtml(review.text)}</p>
              </article>
            `).join("") : `
              <div class="rounded-lg border border-dashed border-slate-300 bg-stone-50 p-8 text-center">
                <p class="font-black text-slate-950">No reviews yet</p>
                <p class="mt-2 text-sm leading-6 text-slate-600">Be the first to review this product.</p>
              </div>
            `}
          </div>
        </div>
      </div>
    </section>
  `;

  setReviewRating(5);
}

function submitProductReview(event, productId) {
  event.preventDefault();

  const name = document.getElementById("reviewName")?.value.trim();
  const title = document.getElementById("reviewTitle")?.value.trim();
  const text = document.getElementById("reviewText")?.value.trim();
  const rating = Number(document.getElementById("reviewRating")?.value || 5);

  if (!name || !title || !text) return;

  const reviewMap = getStoredReviewMap();
  const nextReview = {
    id: `review-${Date.now()}`,
    name,
    rating: Math.min(5, Math.max(1, rating)),
    title,
    text,
    date: new Date().toISOString(),
    verified: false
  };

  reviewMap[productId] = [nextReview, ...(reviewMap[productId] || [])];
  saveStoredReviewMap(reviewMap);

  const product = typeof allSiteProducts !== "undefined" ? allSiteProducts[productId] : null;
  renderReviewSystem(product);

  const reviewsMount = document.getElementById("reviewsMount");
  if (reviewsMount) reviewsMount.scrollIntoView({ behavior: "smooth", block: "start" });
}
