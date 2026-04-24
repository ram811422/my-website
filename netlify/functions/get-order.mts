import type { Context } from "@netlify/functions"
import { getStore } from "@netlify/blobs"

export default async (req: Request, _context: Context) => {
  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 })
  }

  const url = new URL(req.url)
  const id = url.searchParams.get("id")
  if (!id) {
    return Response.json({ error: "Missing order id." }, { status: 400 })
  }

  const store = getStore({ name: "orders", consistency: "strong" })
  const order = await store.get(id, { type: "json" }) as Record<string, unknown> | null
  if (!order) {
    return Response.json({ error: "Order not found." }, { status: 404 })
  }

  const { razorpayPaymentId: _p, razorpayOrderId: _r, ...safe } = order
  return Response.json(safe)
}

export const config = {
  path: "/.netlify/functions/get-order"
}
