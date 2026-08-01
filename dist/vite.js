import swc from "unplugin-swc";
// Shared SWC transform for Vitest across the client packages.
//
// The browser build (apps/*/vite.config.ts) runs unplugin-swc with the 2022-03
// stage-3 decorator transform + keepClassNames because class.name is load-bearing
// for n-ject / n-web / framework registration (see CLAUDE.md "Known stack
// quirks"). Tests must use the SAME transform: Vitest's default (esbuild/oxc)
// does not match SWC's decorator emit, so decorated view models and controllers
// would import incorrectly. We route every .ts/.tsx through SWC and let it handle
// JSX too (automatic runtime), so no separate React plugin is needed.
export function clientTestPlugins() {
    return [
        swc.vite({
            include: /\.tsx?$/,
            jsc: {
                parser: {
                    syntax: "typescript",
                    tsx: true,
                    decorators: true,
                },
                transform: {
                    decoratorVersion: "2022-03",
                    react: {
                        runtime: "automatic",
                    },
                },
                keepClassNames: true,
                target: "es2022",
            },
        }),
    ];
}
// Dev-only stub for server-only dependencies that leak into the client module
// graph.
//
// Some libraries (often pulled in transitively through a barrel re-export) reach
// for node builtins — `fs`/`path`/`url`/`source-map-js` and friends — at
// module-eval time. The production Rolldown build tree-shakes them away when no
// client code uses them, so prod is clean. The Vite *dev* server, however,
// serves native unbundled ESM and does no tree-shaking: it eagerly evaluates
// every statically (re-)exported module, used or not, so those node builtins get
// externalized for the browser and flood the console with "Module ... has been
// externalized for browser compatibility" warnings.
//
// `stubModulesInDev` swaps each named specifier for a stub in dev so the dev
// graph matches prod. The stub's default export throws if it is ever actually
// called, so stubbing a module the client genuinely uses fails loudly instead of
// silently no-op'ing. Three pieces make this robust against Vite's dep
// pre-bundler (which resolves imports on its own path, ahead of ordinary
// plugins):
//   - `apply: "serve"` scopes the whole plugin to dev — prod is untouched.
//   - `enforce: "pre"` runs the resolver before Vite's dep scanner can discover
//     the real (server-only) dependency tree through the specifier.
//   - the `config` hook adds each specifier to `optimizeDeps.exclude`, so the
//     pre-bundler never optimizes it into a chunk independently of the resolver.
export function stubModulesInDev(specifiers) {
    const targets = new Set(specifiers);
    const virtualPrefix = "\0virtual:dev-stub:";
    return {
        name: "framework:stub-modules-in-dev",
        apply: "serve",
        enforce: "pre",
        config() {
            return { optimizeDeps: { exclude: [...targets] } };
        },
        resolveId(id) {
            return targets.has(id) ? `${virtualPrefix}${id}` : null;
        },
        load(id) {
            if (!id.startsWith(virtualPrefix)) {
                return null;
            }
            const specifier = id.slice(virtualPrefix.length);
            const message = `"${specifier}" is stubbed out of the Vite dev client bundle by ` +
                "@nivinjoseph/n-app's stubModulesInDev plugin — it pulled " +
                "server-only code into the dev module graph. Use it on the server, " +
                "or drop it from the stub list if the client genuinely needs it.";
            return `export default function stubbed() { throw new Error(${JSON.stringify(message)}); }`;
        },
    };
}
//# sourceMappingURL=vite.js.map