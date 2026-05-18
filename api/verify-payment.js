const { createHmac, timingSafeEqual } = require("node:crypto");
const { getRecord, setRecord } = require("./_store");
const { readJson, sendJson } = require("./_http");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  let payload;
  try {
    payload = await readJson(req);
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON body." });
  }

  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = payload;
  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return sendJson(res, 400, { error: "Missing verification fields." });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return sendJson(res, 503, { error: "Payment verification is not configured on the server." });
  }

  const expected = createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const given = Buffer.from(razorpaySignature, "utf8");
  const calculated = Buffer.from(expected, "utf8");

  if (given.length !== calculated.length || !timingSafeEqual(given, calculated)) {
    return sendJson(res, 400, { error: "Invalid payment signature." });
  }

  const order = await getRecord("orders", orderId);
  if (!order) {
    return sendJson(res, 404, { error: "Order not found." });
  }
  if (order.razorpayOrderId && order.razorpayOrderId !== razorpayOrderId) {
    return sendJson(res, 400, { error: "Order mismatch." });
  }

  order.status = "paid";
  order.razorpayPaymentId = razorpayPaymentId;
  order.updatedAt = new Date().toISOString();
  await setRecord("orders", orderId, order);

  return sendJson(res, 200, { ok: true, orderId });
};
