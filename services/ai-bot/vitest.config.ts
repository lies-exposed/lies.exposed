import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "ai-bot-spec",
    globals: true,
    watch: false,
    include: ["src/**/*.spec.ts"],
  },
});
