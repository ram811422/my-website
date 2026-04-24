import type { Context } from "@netlify/functions"
import { getStore } from "@netlify/blobs"
import { createHmac, timingSafeEqual } from "node:crypto"

interface VerifyPayload {
  orderId: string
  razorpayPaymentId: string
  razorpayOrderId: string
  razorpaySignature: string
}

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 })
  }

  let payload: VerifyPayload
  try {
    payload = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = payload
  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return Response.json({ error: "Missing verification fields." }, { status: 400 })
  }

  const keySecret = Netlify.env.get("RAZORPAY_KEY_SECRET")
  if (!keySecret) {
    return Response.json({ error: "Payment verification is not configured on the server." }, { status: 503 })
  }

  const expected = createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex")

  const given = Buffer.from(razorpaySignature, "utf8")
  const calculated = Buffer.from(expected, "utf8")

  if (given.length !== calculated.length || !timingSafeEqual(given, calculated)) {
    return Response.json({ error: "Invalid payment signature." }, { status: 400 })
  }

  const store = getStore({ name: "orders", consistency: "strong" })
  const order = await store.get(orderId, { type: "json" }) as Record<string, unknown> | null
  if (!order) {
    return Response.json({ error: "Order not found." }, { status: 404 })
  }
  if (order.razorpayOrderId && order.razorpayOrderId !== razorpayOrderId) {
    return Response.json({ error: "Order mismatch." }, { status: 400 })
  }

  order.status = "paid"
  order.razorpayPaymentId = razorpayPaymentId
  order.updatedAt = new Date().toISOString()
  await store.setJSON(orderId, order)

  return Response.json({ ok: true, orderId })
}

export const config = {
  path: "/.netlify/functions/verify-payment"
}
