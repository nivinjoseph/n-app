import { defineConfig } from "vitest/config";
import { clientTestPlugins } from "./src/vite.js";

export default defineConfig({
    // unplugin-swc owns the TS + decorator transform; disable Vite's built-in
    // Oxc transform to avoid double-processing (matches apps/*/vite.config.ts).
    oxc: false,
    plugins: clientTestPlugins(),
    test: {
        environment: "node",
        include: ["test/**/*.test.ts"],
    },
});
