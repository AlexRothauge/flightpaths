/// <reference types="vitest/config" />
/* eslint import/no-unresolved: [2, { ignore: ["^node:url$"] }] */

import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import vuetify from "vite-plugin-vuetify";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vuetify()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    deps: {
      inline: ["vuetify"],
    },
    root: "src/",
    environment: "jsdom",
    coverage: {
      reporter: ["cobertura", "html"],
      reportsDirectory: "coverage",
    },
    outputFile: {
      junit: "vitest.junit.xml",
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:8080/",
    },
  },
});
