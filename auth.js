const KV_USERS_KEY = "kvCustomers";
const KV_SESSION_KEY = "kvCustomerSession";

function getCustomers() {
  try {
    return JSON.parse(localStorage.getItem(KV_USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCustomers(customers) {
  localStorage.setItem(KV_USERS_KEY, JSON.stringify(customers));
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getCurrentCustomer() {
  let session = null;
  try {
    session = JSON.parse(localStorage.getItem(KV_SESSION_KEY) || "null");
  } catch {
    localStorage.removeItem(KV_SESSION_KEY);
  }
  if (!session || !session.email) return null;
  return getCustomers().find(customer => customer.email === session.email) || null;
}

function setCurrentCustomer(customer) {
  localStorage.setItem(KV_SESSION_KEY, JSON.stringify({
    email: customer.email,
    loggedInAt: new Date().toISOString()
  }));
}

function logoutCustomer() {
  localStorage.removeItem(KV_SESSION_KEY);
  window.location.href = "login.html";
}

async function createCustomerAccount({ name, email, phone, password, address = "", city = "", state = "", pincode = "", country = "India" }) {
  const customers = getCustomers();
  const cleanEmail = normalizeEmail(email);

  if (customers.some(customer => customer.email === cleanEmail)) {
    throw new Error("An account already exists with this email.");
  }

  const customer = {
    id: `customer-${Date.now()}`,
    name: String(name || "").trim(),
    email: cleanEmail,
    phone: String(phone || "").trim(),
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
    address: String(address || "").trim(),
    city: String(city || "").trim(),
    state: String(state || "").trim(),
    pincode: String(pincode || "").trim(),
    country: String(country || "India").trim()
  };

  customers.push(customer);
  saveCustomers(customers);
  setCurrentCustomer(customer);
  return customer;
}

async function loginCustomer(email, password) {
  const cleanEmail = normalizeEmail(email);
  const passwordHash = await hashPassword(password);
  const customer = getCustomers().find(item => item.email === cleanEmail);

  if (!customer || customer.passwordHash !== passwordHash) {
    throw new Error("Invalid email or password.");
  }

  setCurrentCustomer(customer);
  return customer;
}

function updateCustomerProfile(updates) {
  const current = getCurrentCustomer();
  if (!current) throw new Error("Please login first.");

  const customers = getCustomers();
  const index = customers.findIndex(customer => customer.email === current.email);
  if (index === -1) throw new Error("Account not found.");

  customers[index] = {
    ...customers[index],
    name: String(updates.name || "").trim(),
    phone: String(updates.phone || "").trim(),
    address: String(updates.address || "").trim(),
    city: String(updates.city || "").trim(),
    state: String(updates.state || "").trim(),
    pincode: String(updates.pincode || "").trim(),
    country: String(updates.country || "India").trim()
  };

  saveCustomers(customers);
  return customers[index];
}

async function changeCustomerPassword(currentPassword, newPassword) {
  const current = getCurrentCustomer();
  if (!current) throw new Error("Please login first.");

  const currentHash = await hashPassword(currentPassword);
  if (current.passwordHash !== currentHash) {
    throw new Error("Current password is incorrect.");
  }

  const customers = getCustomers();
  const index = customers.findIndex(customer => customer.email === current.email);
  customers[index].passwordHash = await hashPassword(newPassword);
  saveCustomers(customers);
}

function updateAccountLinks() {
  const current = getCurrentCustomer();
  document.querySelectorAll('a[href="login.html"]').forEach(link => {
    if (link.classList.contains("profile-link")) return;

    if (current) {
      link.href = "account.html";
      link.textContent = "Account";
    } else {
      link.textContent = "Login";
    }
  });

  document.querySelectorAll(".profile-link").forEach(link => {
    const label = link.querySelector(".profile-label");
    const initials = link.querySelector(".profile-initials");

    if (current) {
      const nameParts = String(current.name || "Customer").trim().split(/\s+/).slice(0, 2);
      link.href = "account.html";
      link.setAttribute("aria-label", "Open customer dashboard");
      if (label) label.textContent = "Dashboard";
      if (initials) initials.textContent = nameParts.map(part => part.charAt(0).toUpperCase()).join("") || "C";
    } else {
      link.href = "login.html";
      link.setAttribute("aria-label", "Login to customer account");
      if (label) label.textContent = "Login";
    }
  });
}

document.addEventListener("DOMContentLoaded", updateAccountLinks);
