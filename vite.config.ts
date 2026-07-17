import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/fitness-tracking-app/",
  plugins: [react()],
});
