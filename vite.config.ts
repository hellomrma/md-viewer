import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { docsManifest } from "./plugins/docs-manifest";

export default defineConfig({
  plugins: [react(), docsManifest()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  build: { sourcemap: true, target: "es2022" },
});
