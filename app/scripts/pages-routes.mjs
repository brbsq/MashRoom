import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../dist/pages/", import.meta.url).pathname;
const source = join(root, "index.pages.html");
for (const route of [
  "",
  "login",
  "pet",
  "plaza",
  "chat",
  "classroom",
  "settings",
  "settings/classroom",
]) {
  const dir = join(root, route);
  await mkdir(dir, { recursive: true });
  await copyFile(source, join(dir, "index.html"));
}
await copyFile(source, join(root, "404.html"));
await writeFile(join(root, ".nojekyll"), "");
