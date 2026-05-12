import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

function loadDotEnv(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)=(.*)$/);
    if (!m) continue;
    let [, key, val] = m;
    val = val.trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

(async function main() {
  try {
    const repoRoot = process.cwd();
    const envPath = path.join(repoRoot, ".env");
    loadDotEnv(envPath);

    const modPath = path.join(repoRoot, "src/lib/accumulate-sheets.ts");
    const mod = await import(pathToFileURL(modPath).href);
    if (!mod.migrateAccumulationHeaders) {
      console.error("migrateAccumulationHeaders no está disponible en el módulo.");
      process.exit(1);
    }

    console.log("Ejecutando migración de cabeceras en Google Sheets...");
    const result = await mod.migrateAccumulationHeaders();
    console.log("Migración completada. Resultado:");
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Error durante la migración:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
})();
