import { fileURLToPath, URL } from "node:url";

import { ConfigurationManager } from "@nivinjoseph/n-config";
import inject from "@rollup/plugin-inject";
import autoprefixer from "autoprefixer";
import { defineConfig } from "vite";
import Inspect from "vite-plugin-inspect";
import vitePluginRequireRaw from "vite-plugin-require";
import topLevelAwait from "vite-plugin-top-level-await";
import { ViteNAppBabelPlugin } from "./src/plugins/vite-n-app-babel-plugin.js";
import { ViteNAppViewPlugin } from "./src/plugins/vite-n-app-view-plugin.js";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import checker from "vite-plugin-checker";


const VitePluginRequire: typeof vitePluginRequireRaw = (vitePluginRequireRaw as any).default;

const env = ConfigurationManager.requireStringConfig("env");
console.log("VITE ENV", env);

const baseServerUrl = ConfigurationManager.requireStringConfig("baseUrl");

const isDev = env === "dev";


export default defineConfig({
    appType: "spa",
    root: "./test-app/client/",
    esbuild: {
        drop: ["debugger"],
        keepNames: true,
        minifySyntax: true
    },
    build: {
        minify: "esbuild",
        cssMinify: true
        // This does not seem to be working.. 
        // 
        // terserOptions: {
        //     keep_fnames: true,
        //     keep_classnames: true,
        //     mangle: true,
        //     safari10: true,
        //     output: {
        //         comments: false
        //     }
        // }
    },
    server: {
        host: "0.0.0.0",
        port: 5173,
        proxy: {
            "/api": {

                target: baseServerUrl,
                changeOrigin: true,
                secure: false
            }
        }
    },
    optimizeDeps: {
        esbuildOptions: {
            tsconfig: "./tsconfig.client.json"
        }
    },
    css: {
        postcss: {
            plugins: [
                autoprefixer()
            ]
        }
    },
    plugins: [
        Inspect({
            build: true,
            outputDir: ".vite-inspect"
        }),
        // this is just so the warning are not thrown on the console. 
        // this is happening because of the n-config during import analysis 
        nodePolyfills({
            include: [
                "path",
                "fs",
                "url"
            ]
        }),
        ViteNAppBabelPlugin(),
        ViteNAppViewPlugin({ isDev }),
        topLevelAwait({
            // The export name of top-level await promise for each chunk module
            promiseExportName: "__tla",
            // The function to generate import names of top-level await promise in each chunk module
            promiseImportName: i => `__tla_${i}`
        }),
        VitePluginRequire({
            translateType: "import",
            fileRegex: /-view-model.ts$/,
            log: (a) => console.log(a)
        }),
        inject({
            $: "jquery"
        }),
        checker({
            typescript: {
                tsconfigPath: "./tsconfig.client.json"
            }
        })
    ],
    define: {
        APP_CONFIG: {},
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false

    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./test-app/client", import.meta.url)),
            // ...isDev ? { "vue": "vue/dist/vue.esm-bundler.js" } : {},
            "feather": "feather-icons/dist/feather-sprite.svg"
        }
    }
});
