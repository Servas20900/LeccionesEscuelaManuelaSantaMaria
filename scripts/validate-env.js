const fs = require('fs');
const path = require('path');

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)=(.*)$/);
    if (!m) continue;
    let [, key, val] = m;
    val = val.trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    out[key] = val;
  }
  return out;
}

const env = loadEnv(path.join(process.cwd(), '.env'));
const required = [
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
  'GOOGLE_SHEET_ID_ACCUMULATE',
  'ADMIN_PASSWORD',
  'SCHOOL_FROM_EMAIL',
];

const missing = required.filter((k) => !env[k] && !process.env[k]);
if (missing.length) {
  console.error('Faltan variables de entorno necesarias:', missing.join(', '));
  process.exit(1);
}

console.log('Todas las variables principales parecen presentes.');
console.log('Nota: en Azure, asegúrate de guardar GOOGLE_PRIVATE_KEY con los caracteres \\n (no saltos de línea).');
