const { setRecord } = require("./_store");
const { badRequest, readJson, sendJson } = require("./_http");

function validate(payload) {
  if (!payload.name?.trim()) return "Full name is required.";
  if (!/^[0-9+\s-]{10,15}$/.test(payload.phone || "")) return "Enter a valid phone number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email || "")) return "Enter a valid email address.";
  if (!payload.topic?.trim()) return "Support topic is required.";
  if (!payload.message?.trim() || payload.message.trim().length < 10) return "Message must be at least 10 characters.";
  return null;
}

function generateContactId() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `KV-C-${ts}-${rand}`.toUpperCase();
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

  const validationError = validate(payload);
  if (validationError) return badRequest(res, validationError);

  const contactId = generateContactId();
  const record = {
    id: contactId,
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    email: payload.email.trim(),
    topic: payload.topic.trim(),
    message: payload.message.trim(),
    createdAt: new Date().toISOString(),
    status: "new"
  };

  await setRecord("contacts", contactId, record);
  return sendJson(res, 201, { ok: true, contactId });
};
