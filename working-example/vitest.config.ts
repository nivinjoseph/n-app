import path from "node:path";
import { defineConfig } from "vitest/config";
// Relative source path rather than "@nivinjoseph/n-app/vite" — see the note in
// vite.config.ts: that specifier resolves only to dist/, which would make the
// tests depend on the framework having been built first.
import { clientTestPlugins } from "../src/vite.js";

const here = import.meta.dirname;
const frameworkRoot = path.resolve(here, "..");

export default defineConfig({
    // unplugin-swc owns the TS + decorator transform; disable Vite's built-in
    // Oxc transform to avoid double-processing (matches vite.config.ts).
    oxc: false,
    plugins: clientTestPlugins(),
    resolve: {
        alias: [
            {
                find: /^@nivinjoseph\/n-app$/,
                replacement: path.resolve(frameworkRoot, "src/index.ts"),
            },
        ],
        dedupe: ["react", "react-dom", "react-router", "mobx"],
    },
    test: {
        // View-model tests need no DOM. The one component test opts into jsdom
        // with a `// @vitest-environment jsdom` docblock.
        environment: "node",
        include: ["test/**/*.test.{ts,tsx}"],
        setupFiles: ["./test/setup.ts"],
    },
});
