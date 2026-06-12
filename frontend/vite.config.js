import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  base: "/My-Library/",
  plugins: [react(), tailwindcss(), svgr()],
});
