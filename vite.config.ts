import { defineConfig } from "vite";

export default defineConfig({
  base: "/garden-makeover/",
  server: { host: true }, // test on phone via LAN
  build: {
    target: "es2019",
    sourcemap: false,
  },
});
