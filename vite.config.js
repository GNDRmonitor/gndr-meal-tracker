import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: change "gndr-meal-tracker" below to your actual GitHub repo name.
// GitHub Pages serves the site at https://<username>.github.io/<repo-name>/,
// so Vite needs to know that sub-path when it builds asset URLs.
export default defineConfig({
  plugins: [react()],
  base: "/gndr-meal-tracker/",
});
