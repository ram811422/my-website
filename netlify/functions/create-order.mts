import type { Context } from "@netlify/functions"
import { getStore } from "@netlify/blobs"
import { SITE_PRODUCTS } from "./_shared/products.mts"

type PaymentMethod = "online" | "cod"

interface IncomingItem {
  id: string
  quantity: number
}

interface Customer {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
}

interface CreateOrderPayload {
  items: IncomingItem[]
  customer: Customer
  paymentMethod: PaymentMethod
}

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 })
}

function validateCustomer(c: Partial<Customer> | undefined): string | null {
  if (!c) return "Customer details are required."
  const required: (keyof Customer)[] = [
    "fullName", "email", "phone", "address", "city", "state", "pincode", "country"
  ]
  for (const field of required) {
    if (typeof c[field] !== "string" || !c[field]!.trim()) {
      return `Missing or invalid field: ${field}`
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email!)) return "Invalid email address."
  if (!/^[0-9+\s\-]{10,15}$/.test(c.phone!)) return "Invalid phone number."
  if (!/^[0-9]{6}$/.test(c.pincode!)) return "Pincode must be 6 digits."
  return null
}

function generateOrderId() {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `KV-${ts}-${rand}`.toUpperCase()
}

async function createRazorpayOrder(amountPaise: number, orderId: string, keyId: string, keySecret: string) {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt: orderId,
      notes: { orderId }
    })
  })
  const data = await res.json() as { id?: string; error?: { description?: string } }
  if (!res.ok) {
    throw new Error(data.error?.description || `Razorpay order creation failed (${res.status})`)
  }
  return data.id as string
}

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 })
  }

  let payload: CreateOrderPayload
  try {
    payload = await req.json()
  } catch {
    return badRequest("Invalid JSON body.")
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return badRequest("Cart is empty.")
  }
  if (payload.paymentMethod !== "online" && payload.paymentMethod !== "cod") {
    return badRequest("Invalid payment method.")
  }
  const customerError = validateCustomer(payload.customer)
  if (customerError) return badRequest(customerError)

  const lineItems: Array<{ id: string; name: string; price: number; quantity: number; lineTotal: number }> = []
  let subtotal = 0
  for (const row of payload.items) {
    const product = SITE_PRODUCTS[row.id as keyof typeof SITE_PRODUCTS]
    if (!product) {
      return badRequest(`Unknown product: ${row.id}`)
    }
    const qty = Number.parseInt(String(row.quantity), 10)
    if (!Number.isFinite(qty) || qty <= 0 || qty > 100) {
      return badRequest(`Invalid quantity for ${row.id}.`)
    }
    const lineTotal = product.price * qty
    subtotal += lineTotal
    lineItems.push({ id: product.id, name: product.name, price: product.price, quantity: qty, lineTotal })
  }
  const total = subtotal

  const orderId = generateOrderId()
  const now = new Date().toISOString()

  const baseOrder = {
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
    razorpayOrderId: null as string | null,
    razorpayPaymentId: null as string | null
  }

  const keyId = Netlify.env.get("RAZORPAY_KEY_ID")
  const keySecret = Netlify.env.get("RAZORPAY_KEY_SECRET")

  const responseBody: Record<string, unknown> = { orderId }

  if (payload.paymentMethod === "online") {
    if (!keyId || !keySecret) {
      return Response.json(
        {
          error: "Online payment is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables, or use Cash on Delivery."
        },
        { status: 503 }
      )
    }
    try {
      const amountPaise = Math.round(total * 100)
      const razorpayOrderId = await createRazorpayOrder(amountPaise, orderId, keyId, keySecret)
      baseOrder.razorpayOrderId = razorpayOrderId
      responseBody.razorpay = {
        keyId,
        razorpayOrderId,
        amount: amountPaise,
        currency: "INR"
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create payment order."
      return Response.json({ error: message }, { status: 502 })
    }
  }

  const store = getStore({ name: "orders", consistency: "strong" })
  await store.setJSON(orderId, baseOrder)

  return Response.json(responseBody, { status: 201 })
}

export const config = {
  path: "/.netlify/functions/create-order"
}
