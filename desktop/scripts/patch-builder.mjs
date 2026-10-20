import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// electron-builder 26 leaves an open Windows handle while renaming its staging
// directory. Copying the extracted tree avoids that Windows-only lock failure.
const desktop = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(desktop, "node_modules/app-builder-lib/out/util/electronGet.js");
let source = await fs.readFile(file, "utf8");
if (source.includes("AFTERSCENE_WINDOWS_COPY_STAGING")) process.exit(0);
const marker = "        // AFTERSCENE_WINDOWS_RENAME_RETRY";
if (source.includes(marker)) {
  const start = source.indexOf(marker);
  const end = source.indexOf("\n    }\n    finally", start);
  if (end < 0) throw new Error("No se pudo localizar el parche anterior de Electron Builder.");
  source = source.slice(0, start) + "        await fs.rename(tmpDir, dir);" + source.slice(end);
}
const search = "        await fs.rename(tmpDir, dir);";
if (!source.includes(search)) throw new Error("Electron Builder cambió su rutina de extracción; revisa el parche de Windows.");
const replacement = `        // AFTERSCENE_WINDOWS_COPY_STAGING
        await release();
        await fs.cp(tmpDir, dir, { recursive: true, force: true });`;
await fs.writeFile(file, source.replace(search, replacement));
