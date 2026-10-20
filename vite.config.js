import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const r = (p) => fileURLToPath(new URL(p, import.meta.url));

// Two pages: the landing (React) at "/" and the tracker at "/app/".
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": r("./src") } },
  build: {
    rollupOptions: { input: { main: r("./index.html"), app: r("./app/index.html") } },
  },
});
