import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { frontWalkRegistration } from "../lib/roomie-motion.ts";

const path = file => fileURLToPath(new URL(file, import.meta.url));
const source = path("../../output/roomie-poses/front-walk/source.png");
const { frameWidth: width, frameHeight: height, headBottom, headTransform } = frontWalkRegistration;
const meta = await sharp(source).metadata();
if (!meta.hasAlpha || meta.width % 2 || meta.height % 2) throw Error("Expected a transparent 2×2 sheet");
const cellWidth = meta.width / 2, cellHeight = meta.height / 2;
const tiles = [], rendered = [];
const head = (await readFile(path("../public/rooms/cd2bd.png"))).toString("base64");
for (let frame = 0; frame < 4; frame++) {
  const input = await sharp(source).extract({ left: frame % 2 * cellWidth, top: Math.floor(frame / 2) * cellHeight, width: cellWidth, height: cellHeight })
    .ensureAlpha().raw().toBuffer();
  let x0 = cellWidth, x1 = 0, y0 = cellHeight, y1 = 0, h0 = cellWidth, h1 = 0;
  for (let y = 0; y < cellHeight; y++) for (let x = 0; x < cellWidth; x++) {
    if (input[(y * cellWidth + x) * 4 + 3] < 64) continue;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    if (y < cellHeight * .43) { h0 = Math.min(h0, x); h1 = Math.max(h1, x); }
  }
  const scale = 726 / (y1 - y0 + 1), cropX = Math.max(0, x0 - 3), cropY = Math.max(0, y0 - 3);
  const cropW = Math.min(cellWidth, x1 + 4) - cropX, cropH = Math.min(cellHeight, y1 + 4) - cropY;
  const w = Math.round(cropW * scale), h = Math.round(cropH * scale);
  const left = Math.round(width / 2 - ((h0 + h1) / 2 - cropX) * scale), top = 15 - Math.round((y0 - cropY) * scale);
  if (left < 0 || top < 0 || left + w > width || top + h > height) throw Error(`Frame ${frame + 1} would clip`);
  const drawing = await sharp(input, { raw: { width: cellWidth, height: cellHeight, channels: 4 } })
    .extract({ left: cropX, top: cropY, width: cropW, height: cropH }).resize(w, h).png().toBuffer();
  const tile = await sharp({ create: { width, height, channels: 4, background: "#00000000" } })
    .composite([{ input: drawing, left, top }]).png().toBuffer();
  tiles.push(tile);
  // Preview the same original-head composition used by RoomieRenderer.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><clipPath id="body"><rect y="${headBottom}" width="${width}" height="${height - headBottom}"/></clipPath><clipPath id="head"><rect width="${width}" height="${headBottom}"/></clipPath></defs><image href="data:image/png;base64,${tile.toString("base64")}" width="${width}" height="${height}" clip-path="url(#body)"/><g clip-path="url(#head)"><g transform="${headTransform}"><image href="data:image/png;base64,${head}" width="941" height="1671"/></g></g></svg>`;
  rendered.push(await sharp(Buffer.from(svg)).png().toBuffer());
}
await sharp({ create: { width: width * 2, height: height * 2, channels: 4, background: "#00000000" } })
  .composite(tiles.map((input, i) => ({ input, left: i % 2 * width, top: Math.floor(i / 2) * height })))
  .png().toFile(path("../public/rooms/roomie-walk-front.png"));
const rawFrames = await Promise.all(rendered.map(tile => sharp(tile).raw().toBuffer()));
await sharp(Buffer.concat(rawFrames), { raw: { width, height: height * 4, channels: 4, pageHeight: height } })
  .gif({ loop: 0, delay: [160, 160, 160, 160], effort: 7 }).toFile(path("../../outputs/roomie-walk-front.gif"));
await sharp({ create: { width: width * 4, height, channels: 4, background: "#f4eadc" } })
  .composite(rendered.map((input, i) => ({ input, left: width * i, top: 0 })))
  .png().toFile(path("../../outputs/roomie-walk-front-frames.png"));
console.log("Packed four front walk frames at 456×750, baseline 740; preserved original head in preview.");
