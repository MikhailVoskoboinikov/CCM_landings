// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// SITE и BASE_PATH задаются при сборке для GitHub Pages (.github/workflows/pages.yml)
export default defineConfig({
  site: process.env.SITE,
  base: process.env.BASE_PATH ?? "/",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
