import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const path = (file: string) => fileURLToPath(new URL(file, import.meta.url));

export default defineConfig({
  root: here,
  base: "/MashRoom/",
  publicDir: "public",
  resolve: {
    alias: [
      { find: "next/image", replacement: path("./pages/next-image.tsx") },
      { find: "next/link", replacement: path("./pages/next-link.tsx") },
      { find: "next/navigation", replacement: path("./pages/next-navigation.ts") },
      { find: "@", replacement: here },
    ],
  },
  define: {
    "process.env.NEXT_PUBLIC_MASHROOM_PAGES": JSON.stringify("1"),
  },
  plugins: [react()],
  build: {
    outDir: "dist/pages",
    emptyOutDir: true,
    rollupOptions: { input: path("./index.pages.html") },
  },
});
