const { SITE_PRODUCTS } = require("./_products");
const { setRecord } = require("./_store");
const { badRequest, readJson, sendJson } = require("./_http");

function validateCustomer(customer) {
  if (!customer) return "Customer details are required.";
  const required = ["fullName", "email", "phone", "address", "city", "state", "pincode", "country"];

  for (const field of required) {
    if (typeof customer[field] !== "string" || !customer[field].trim()) {
      return `Missing or invalid field: ${field}`;
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) return "Invalid email address.";
  if (!/^[0-9+\s-]{10,15}$/.test(customer.phone)) return "Invalid phone number.";
  if (!/^[0-9]{6}$/.test(customer.pincode)) return "Pincode must be 6 digits.";
  return null;
}

function generateOrderId() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `KV-${ts}-${rand}`.toUpperCase();
}

async function createRazorpayOrder(amountPaise, orderId, keyId, keySecret) {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt: orderId,
      notes: { orderId }
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.description || `Razorpay order creation failed (${res.status})`);
  }
  return data.id;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  let payload;
  try {
    payload = await readJson(req);
  } catch {
    return badRequest(res, "Invalid JSON body.");
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return badRequest(res, "Cart is empty.");
  }
  if (payload.paymentMethod !== "online" && payload.paymentMethod !== "cod") {
    return badRequest(res, "Invalid payment method.");
  }

  const customerError = validateCustomer(payload.customer);
  if (customerError) return badRequest(res, customerError);

  const lineItems = [];
  let subtotal = 0;
  for (const row of payload.items) {
    const product = SITE_PRODUCTS[row.id];
    if (!product) return badRequest(res, `Unknown product: ${row.id}`);

    const qty = Number.parseInt(String(row.quantity), 10);
    if (!Number.isFinite(qty) || qty <= 0 || qty > 100) {
      return badRequest(res, `Invalid quantity for ${row.id}.`);
    }

    const lineTotal = product.price * qty;
    subtotal += lineTotal;
    lineItems.push({ id: product.id, name: product.name, price: product.price, quantity: qty, lineTotal });
  }

  const orderId = generateOrderId();
  const now = new Date().toISOString();
  const total = subtotal;
  const order = {
    id: orderId,
    createdAt: now,
    updatedAt: now,
    customer: payload.customer,
    items: lineItems,
    subtotal,
    total,
    currency: "INR",
    paymentMethod: payload.paymentMethod,
    status: payload.paymentMethod === "cod" ? "pending" : "awaiting_payment",
    razorpayOrderId: null,
    razorpayPaymentId: null
  };

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const responseBody = { orderId };

  if (payload.paymentMethod === "online") {
    if (!keyId || !keySecret) {
      return sendJson(res, 503, {
        error: "Online payment is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables, or use Cash on Delivery."
      });
    }

    try {
      const amountPaise = Math.round(total * 100);
      const razorpayOrderId = await createRazorpayOrder(amountPaise, orderId, keyId, keySecret);
      order.razorpayOrderId = razorpayOrderId;
      responseBody.razorpay = {
        keyId,
        razorpayOrderId,
        amount: amountPaise,
        currency: "INR"
      };
    } catch (err) {
      return sendJson(res, 502, { error: err instanceof Error ? err.message : "Failed to create payment order." });
    }
  }

  await setRecord("orders", orderId, order);
  return sendJson(res, 201, responseBody);
};
