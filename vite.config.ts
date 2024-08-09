import { fileURLToPath, URL } from "node:url";

import { ConfigurationManager } from "@nivinjoseph/n-config";
import inject from "@rollup/plugin-inject";
import autoprefixer from "autoprefixer";
import { defineConfig, type PluginOption, type ViteDevServer } from "vite";
import Inspect from "vite-plugin-inspect";
import topLevelAwait from "vite-plugin-top-level-await";
import { ViteNAppBabelPlugin } from "./src/plugins/vite-n-app-babel-plugin.js";
import { ViteNAppViewPlugin } from "./src/plugins/vite-n-app-view-plugin.js";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import checker from "vite-plugin-checker";
import { ViteNAppRequirePlugin } from "./src/plugins/vite-n-app-require-plugin.js";



const env = ConfigurationManager.requireStringConfig("env");
console.log("VITE ENV", env);

const baseServerUrl = ConfigurationManager.requireStringConfig("baseUrl");

const isDev = env === "dev";


let devServer: ViteDevServer | null = null;

const serverPlugin: () => PluginOption = () =>
{
    return {
        name: "server-plugin",
        enforce: "pre",
        transformIndexHtml: {
            order: "pre",
            handler: async (html, _ctx): Promise<any> =>
            {
                if (!isDev)
                    return html;

                return {
                    html: html,
                    tags: [
                        {
                            injectTo: "head",
                            tag: "script",
                            attrs: {
                                type: "module",
                                src: "/@vite/client"
                            }
                        }
                    ]
                };
            }
        },
        // load: async (id): Promise<any> =>
        // {
        //     console.log("load", id);
        //     return;
        // },
        configureServer(server): void
        {
            devServer = server;

            server.middlewares.use(
                (req, _res, next) =>
                {
                    const fileExtensions = [".ts", ".js", "?import", ".html", ".scss", ".mjs", ".svg", ".png", ".css", ".ico"];
                    const url = new URL(req.url!, baseServerUrl);
                    const lastSegment = url.pathname.split("/").takeLast();

                    if (fileExtensions.every(t => !lastSegment.endsWith(t)) && !req.url!.contains("@vite")
                        && !req.url!.contains("/api"))
                    {
                        console.log("request ===", req.url, req.method, req.originalUrl, lastSegment);
                        req.url = `/fallbackIndexHtml${req.url}`;
                        // console.log("request ===", req.url, req.method, req.originalUrl);
                    }
                    next();
                }
            );
        }
    };
};


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
                secure: false,
                rewrite(path)
                {
                    // console.log("path to server", path);
                    return path;
                }
            },
            "^/fallbackIndexHtml/.*": {
                target: baseServerUrl,
                changeOrigin: true,
                secure: false,
                selfHandleResponse: true,
                configure: (proxy, _opt) =>
                {

                    // proxy.on("")
                    // opt.buffer

                    proxy.on("error", (err, _req, _res) =>
                    {
                        console.log("proxy error", err);
                    });
                    proxy.on("proxyReq", (_proxyReq, req, _res) =>
                    {
                        // proxyReq.on("")
                        console.log("Sending Request to the Target:", req.method, req.url);
                    });
                    proxy.on("proxyRes", (proxyRes, req, res) =>
                    {
                        console.log("Received Response from the Target:", proxyRes.statusCode, req.url);

                        const chunks: Array<Buffer> = [];
                        proxyRes.on("data", (chunk) =>
                        {
                            // console.log(chunks);
                            chunks.push(chunk);
                        });


                        proxyRes.on("end", () =>
                        {
                            const body = Buffer.concat(chunks).toString();
                            // this
                            devServer!.transformIndexHtml(req.url!, body).then(html =>
                            {
                                res.write(html);
                                res.end();
                            }).catch(e => console.error(e));
                        });



                        // const data = Buffer.concat(buffer);
                        // const data = res.on("")
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                        // console.log("data", data.toString("utf-8"));
                        // console.log(res.)
                    });
                },
                rewrite(path)
                {
                    const rewritten = path.replace(/^\/fallbackIndexHtml/, "");
                    console.log("fallback", path, rewritten);
                    return rewritten;
                }
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
                // @ts-expect-error chill
                autoprefixer()
            ]
        }
    },
    plugins: [
        serverPlugin(),
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
        ViteNAppRequirePlugin({
            translateType: "import"
        }),
        // VitePluginRequire({
        //     translateType: "import",
        //     fileRegex: /-view-model.ts$/,
        //     log: (a) => console.log(a)
        // }),
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
            "feather": "feather-icons/dist/feather-sprite.svg",
            "source-map-js": "source-map"
        }
    }
});
