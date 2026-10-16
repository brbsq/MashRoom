import sharp from "sharp";
import { fileURLToPath } from "node:url";

// Register generated cells on a shared head centre and sole baseline. This
// only packages the supplied drawings; limbs and expressions are not redrawn.
const path = file => fileURLToPath(new URL(file, import.meta.url));
const width = 456, height = 750, bodyHeight = 726, top = 15;
const previews = {};
for (const direction of ["left", "right"]) {
  const source = path(`../../output/roomie-poses/walk/${direction}-source.png`);
  const metadata = await sharp(source).metadata();
  if (!metadata.hasAlpha || metadata.width % 2 || metadata.height % 2)
    throw Error(`Invalid transparent 2×2 sheet: ${direction}`);
  const cellWidth = metadata.width / 2, cellHeight = metadata.height / 2;
  const tiles = [];
  for (let frame = 0; frame < 4; frame++) {
    let input = await sharp(source).extract({
      left: (frame % 2) * cellWidth, top: Math.floor(frame / 2) * cellHeight,
      width: cellWidth, height: cellHeight,
    }).ensureAlpha().raw().toBuffer();
    // Use the refined opposite-foot passing drawing without touching the
    // first three cells of the original left sheet.
    if (direction === "left" && frame === 3) input = await sharp(path("../../output/roomie-poses/walk/left-passing-v2.png"))
      .resize(cellWidth, cellHeight).ensureAlpha().raw().toBuffer();
    let xMin = cellWidth, xMax = 0, yMin = cellHeight, yMax = 0;
    let headMin = cellWidth, headMax = 0;
    for (let y = 0; y < cellHeight; y++) for (let x = 0; x < cellWidth; x++) {
      if (input[(y * cellWidth + x) * 4 + 3] < 64) continue;
      xMin = Math.min(xMin, x); xMax = Math.max(xMax, x);
      yMin = Math.min(yMin, y); yMax = Math.max(yMax, y);
      if (y < cellHeight * .43) { headMin = Math.min(headMin, x); headMax = Math.max(headMax, x); }
    }
    const scale = bodyHeight / (yMax - yMin + 1);
    const cropLeft = Math.max(0, xMin - 3), cropTop = Math.max(0, yMin - 3);
    const cropWidth = Math.min(cellWidth, xMax + 4) - cropLeft;
    const cropHeight = Math.min(cellHeight, yMax + 4) - cropTop;
    const tileWidth = Math.round(cropWidth * scale), tileHeight = Math.round(cropHeight * scale);
    const targetHead = direction === "left" ? 240 : 210;
    const left = Math.round(targetHead - ((headMin + headMax) / 2 - cropLeft) * scale);
    const tileTop = top - Math.round((yMin - cropTop) * scale);
    if (left < 0 || left + tileWidth > width || tileTop < 0 || tileTop + tileHeight > height)
      throw Error(`Frame would clip: ${direction} ${frame + 1}: ${JSON.stringify({ left, tileWidth, tileTop, tileHeight, headMin, headMax })}`);
    const pixels = await sharp(input, { raw: { width: cellWidth, height: cellHeight, channels: 4 } })
      .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
      .resize(tileWidth, tileHeight).png().toBuffer();
    const tile = await sharp({ create: { width, height, channels: 4, background: "#00000000" } })
      .composite([{ input: pixels, left, top: tileTop }]).png().toBuffer();
    tiles.push(tile);
    console.log(`${direction} ${frame + 1}: head anchor ${targetHead}, sole baseline ${top + bodyHeight - 1}`);
  }
  await sharp({ create: { width: width * 2, height: height * 2, channels: 4, background: "#00000000" } })
    .composite(tiles.map((input, index) => ({ input, left: (index % 2) * width, top: Math.floor(index / 2) * height })))
    .png().toFile(path(`../public/rooms/roomie-walk-${direction}.png`));
  // The animated preview uses the exact same registered frames as the app.
  const rawFrames = await Promise.all(tiles.map(tile => sharp(tile).raw().toBuffer()));
  previews[direction] = tiles;
  await sharp(Buffer.concat(rawFrames), { raw: { width, height: height * 4, channels: 4, pageHeight: height } })
    .gif({ loop: 0, delay: [160, 160, 160, 160], effort: 7 })
    .toFile(path(`../../outputs/roomie-walk-${direction}.gif`));
}
const previewFrames = [];
for (let frame = 0; frame < 4; frame++) {
  const [left, right] = await Promise.all(["left", "right"].map(direction =>
    sharp(previews[direction][frame]).resize(228, 375).png().toBuffer()));
  previewFrames.push(await sharp({ create: { width: 456, height: 375, channels: 4, background: "#f4eadc" } })
    .composite([{ input: left, left: 0, top: 0 }, { input: right, left: 228, top: 0 }]).raw().toBuffer());
}
await sharp(Buffer.concat(previewFrames), { raw: { width: 456, height: 1500, channels: 4, pageHeight: 375 } })
  .gif({ loop: 0, delay: [160, 160, 160, 160], effort: 7 })
  .toFile(path("../../outputs/roomie-walk-preview.gif"));
