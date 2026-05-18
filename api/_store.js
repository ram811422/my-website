const fs = require("node:fs/promises");
const path = require("node:path");

const dbPath = path.join("/tmp", "kisanvalley-data.json");

async function readDb() {
  try {
    const raw = await fs.readFile(dbPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return { orders: {}, contacts: {} };
  }
}

async function writeDb(db) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
}

async function setRecord(collection, id, record) {
  const db = await readDb();
  db[collection] = db[collection] || {};
  db[collection][id] = record;
  await writeDb(db);
}

async function getRecord(collection, id) {
  const db = await readDb();
  return db[collection]?.[id] || null;
}

module.exports = { getRecord, setRecord };
