const { getRecord } = require("./_store");
const { sendJson } = require("./_http");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const host = req.headers.host || "localhost";
  const url = new URL(req.url, `https://${host}`);
  const id = url.searchParams.get("id");
  if (!id) {
    return sendJson(res, 400, { error: "Missing order id." });
  }

  const order = await getRecord("orders", id);
  if (!order) {
    return sendJson(res, 404, { error: "Order not found." });
  }

  const { razorpayPaymentId, razorpayOrderId, ...safeOrder } = order;
  return sendJson(res, 200, safeOrder);
};
