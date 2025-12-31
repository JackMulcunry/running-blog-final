import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  base: "/",
  optimizeDeps: {
    entries: ["src/main.tsx"],
  },
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: true,
  },
});
