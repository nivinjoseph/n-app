import path from "node:path";
import { constants as zlibConstants } from "node:zlib";
import { ConfigurationManager } from "@nivinjoseph/n-config";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import swc from "unplugin-swc";
import { defineConfig } from "vite";
import { compression, defineAlgorithm } from "vite-plugin-compression2";
// Imported by relative source path rather than as "@nivinjoseph/n-app/vite".
// That specifier would resolve (the portal: dependency links the root here), but
// only to dist/ — which would make every `yarn dev` depend on the framework
// having been built first. Reading the source keeps the example runnable from a
// clean checkout. Note the alias below cannot help: it applies to the app's
// module graph, not to loading this config file.
import { stubModulesInDev } from "../src/vite.js";

const here = import.meta.dirname;
const frameworkRoot = path.resolve(here, "..");

const compressibleAssets = /\.(js|mjs|css|html|svg|json|txt|map)$/i;
const minCompressSize = 1024;

// unplugin-swc's Vite plugin injects a deprecated `esbuild: false` through its
// `config` hook. Under Vite 8 the built-in transform is Oxc (not esbuild), so
// that flag is a no-op — and `@vitejs/plugin-react` re-enables Oxc by setting
// `oxc` to an object (it runs its JSX + Fast Refresh transform through Oxc),
// which makes Vite warn that `esbuild: false` no longer has any effect. Strip
// the hook; the actual SWC transform runs in the plugin's `transform` hook,
// which is untouched. (Setting `oxc: false` here does nothing — plugin-react
// overwrites it — so we don't.)
const swcPlugin = swc.vite({
    // Also match the framework's own sources, which the alias below pulls in
    // from outside this package's src/ directory.
    include: /\.tsx?$/,
    jsc: {
        parser: {
            syntax: "typescript",
            tsx: true,
            decorators: true,
        },
        transform: {
            decoratorVersion: "2022-03",
        },
        keepClassNames: true,
        target: "es2022",
    },
});
delete swcPlugin.config;

export default defineConfig({
    root: "src",
    resolve: {
        // @example/common and @example/sdk resolve natively — they are portal:
        // dependencies whose package.json exports point straight at their .ts
        // source, so they need no alias.
        //
        // The framework does get one, pointing at its TypeScript source instead
        // of the dist/ that its exports map declares, so edits in ../src
        // hot-reload here. Exact-match regex matters: a prefix match would also
        // swallow the "/vite" subpath.
        alias: [
            {
                find: /^@nivinjoseph\/n-app$/,
                replacement: path.resolve(frameworkRoot, "src/index.ts"),
            },
        ],
        // Yarn hoists these to the repo root so there is only one copy, but the
        // alias above means the framework's own imports resolve from the root
        // directory — dedupe makes the single-instance guarantee explicit. Two
        // Reacts break hooks; two MobX instances break observability.
        dedupe: ["react", "react-dom", "react-router", "mobx"],
    },
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        rolldownOptions: {
            output: {
                // n-web/n-ext/n-ject key registrations on class.name, and
                // ComponentRegistration enforces ".endsWith(ViewModel)" on
                // registered view models. Without this, the minifier renames
                // class identifiers and registration breaks at runtime.
                keepNames: true,
            },
        },
    },
    plugins: [
        // n-util's barrel pulls sanitize-html (→ postcss → node builtins) into
        // the dev module graph, which Vite externalizes and warns about. Prod
        // tree-shakes it out; this stubs it in dev so the dev console stays clean.
        stubModulesInDev(["sanitize-html"]),
        swcPlugin,
        react(),
        tailwindcss(),
        compression({
            include: compressibleAssets,
            threshold: minCompressSize,
            algorithms: [
                defineAlgorithm("brotliCompress", {
                    params: {
                        [zlibConstants.BROTLI_PARAM_QUALITY]:
                            zlibConstants.BROTLI_MAX_QUALITY,
                        [zlibConstants.BROTLI_PARAM_MODE]:
                            zlibConstants.BROTLI_MODE_TEXT,
                    },
                }),
                defineAlgorithm("gzip", { level: 9 }),
            ],
        }),
    ],
    server: {
        port: ConfigurationManager.requireNumberConfig("PORT"),
        strictPort: true,
        // The framework source lives above this package's root.
        fs: { allow: [frameworkRoot] },
    },
    define: {
        // n-config's browser branch reads a bare APP_CONFIG global that the
        // bundler is expected to substitute. Without this define the bundle
        // throws ReferenceError at module-eval, before anything renders.
        // biome-ignore lint/style/useNamingConvention: Vite's define mechanism
        APP_CONFIG: JSON.stringify({
            env: ConfigurationManager.requireStringConfig("env"),
            owner: ConfigurationManager.requireStringConfig("owner"),
        }),
    },
});
