const fs = require("fs");
const path = require("path");

const htmlFiles = fs.readdirSync(".").filter(file => file.endsWith(".html"));
const jsFiles = fs.readdirSync(".").filter(file => file.endsWith(".js"));

let failures = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  scripts.forEach((match, index) => {
    try {
      new Function(match[1]);
    } catch (error) {
      failures += 1;
      console.log(`${file} inline script ${index}: ${error.message}`);
    }
  });

  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const url = match[1];
    if (url.includes("${")) continue;
    if (/^(https?:|mailto:|tel:|#|javascript:|data:|\/\.|\/)/.test(url)) continue;
    const clean = url.split("#")[0].split("?")[0];
    if (!clean) continue;
    if (!fs.existsSync(path.join(".", clean))) {
      failures += 1;
      console.log(`${file}: missing local reference ${url}`);
    }
  }
}

for (const file of jsFiles) {
  try {
    new Function(fs.readFileSync(file, "utf8"));
  } catch (error) {
    failures += 1;
    console.log(`${file}: ${error.message}`);
  }
}

console.log(`checked ${htmlFiles.length} pages and ${jsFiles.length} scripts; failures: ${failures}`);
process.exit(failures ? 1 : 0);
