import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { downloadArtifact } from "@electron/get";

const desktop = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(await readFile(path.join(desktop, "node_modules/electron/package.json"), "utf8"));
const archive = await downloadArtifact({
  version: pkg.version,
  platform: "win32",
  arch: "x64",
  artifactName: "electron",
  cacheRoot: path.join(desktop, ".cache", "electron"),
});
process.stdout.write(archive);
