import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const desktop = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = path.join(desktop, "assets");
const photo = path.resolve(desktop, "../public/assets/interstellar-backdrop.jpg");
await fs.mkdir(assets, { recursive: true });

const iconSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
 <defs><radialGradient id="g" cx="82%" cy="5%" r="110%"><stop stop-color="#293543"/><stop offset=".53" stop-color="#0b1016"/><stop offset="1" stop-color="#05080b"/></radialGradient><linearGradient id="l" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff3e6"/><stop offset="1" stop-color="#dea976"/></linearGradient></defs>
 <rect x="10" y="10" width="492" height="492" rx="112" fill="url(#g)"/><rect x="11" y="11" width="490" height="490" rx="111" fill="none" stroke="#ffffff39" stroke-width="2"/>
 <circle cx="301" cy="236" r="157" fill="none" stroke="#e5b68b" stroke-width="3" opacity=".52"/><circle cx="301" cy="236" r="129" fill="none" stroke="#e5b68b" stroke-width="1" opacity=".32"/>
 <path d="M109 370L245 111h27l132 259h-47l-41-84H198l-42 84h-47zm112-127h75l-37-78-38 78z" fill="url(#l)"/><circle cx="388" cy="99" r="6" fill="#fff1df"/><path d="M388 82v34M371 99h34" stroke="#fff1df" stroke-width="2"/>
 </svg>`);

const sizes = [16, 32, 64, 256];
const encoded = [];
for (const size of sizes) encoded.push(await sharp(iconSvg).resize(size, size).png().toBuffer());
await fs.writeFile(path.join(assets, "afterscene.png"), encoded.at(-1));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, index) => {
  const entry = 6 + index * 16;
  header.writeUInt8(size === 256 ? 0 : size, entry);
  header.writeUInt8(size === 256 ? 0 : size, entry + 1);
  header.writeUInt8(0, entry + 2);
  header.writeUInt8(0, entry + 3);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(encoded[index].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += encoded[index].length;
});
await fs.writeFile(path.join(assets, "afterscene.ico"), Buffer.concat([header, ...encoded]));

const width = 164, height = 314;
const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="164" height="314" viewBox="0 0 164 314">
 <defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#060b13" stop-opacity=".65"/><stop offset=".52" stop-color="#071019" stop-opacity=".15"/><stop offset="1" stop-color="#05080b" stop-opacity=".98"/></linearGradient></defs>
 <rect width="164" height="314" fill="url(#shade)"/><circle cx="139" cy="103" r="97" fill="none" stroke="#f1bc86" stroke-opacity=".58" stroke-width="2"/><circle cx="139" cy="103" r="77" fill="none" stroke="#f1bc86" stroke-opacity=".25"/>
 <text x="19" y="29" font-family="Arial" font-size="8" font-weight="bold" letter-spacing="3" fill="#fff8f0">AFTERSCENE</text><path d="M20 232h30" stroke="#e5b389"/>
 <text x="19" y="255" font-family="Georgia" font-size="20" fill="#ffffff">Cada historia</text><text x="19" y="278" font-family="Georgia" font-size="20" font-style="italic" fill="#e6b58e">permanece.</text>
 </svg>`);
const { data: rgba } = await sharp(photo).resize(width, height, { fit: "cover", position: "centre" }).composite([{ input: overlay }]).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const rowLength = Math.ceil((width * 3) / 4) * 4;
const pixelLength = rowLength * height;
const bmp = Buffer.alloc(54 + pixelLength);
bmp.write("BM", 0); bmp.writeUInt32LE(bmp.length, 2); bmp.writeUInt32LE(54, 10);
bmp.writeUInt32LE(40, 14); bmp.writeInt32LE(width, 18); bmp.writeInt32LE(height, 22);
bmp.writeUInt16LE(1, 26); bmp.writeUInt16LE(24, 28); bmp.writeUInt32LE(pixelLength, 34);
for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
  const input = (y * width + x) * 3;
  const output = 54 + (height - 1 - y) * rowLength + x * 3;
  bmp[output] = rgba[input + 2]; bmp[output + 1] = rgba[input + 1]; bmp[output + 2] = rgba[input];
}
await fs.writeFile(path.join(assets, "installerSidebar.bmp"), bmp);
console.log("Generated AFTERSCENE icon and installer artwork.");
