import { defineConfig } from "cypress";

export default defineConfig({
  viewportHeight: 720,
  viewportWidth: 1280,
  retries: {
    runMode: 2,
    openMode: 1,
  },
  e2e: {
    specPattern: "cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}",
    baseUrl: "http://localhost:4173",
  },
});
