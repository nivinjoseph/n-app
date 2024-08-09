import {} from "vite";
import babel from "@babel/core";
import { PluginHelpers } from "./plugin-helpers.js";
export function ViteNAppBabelPlugin() {
    return {
        name: "vite-n-app-babel-plugin",
        async transform(code, id, _) {
            const isNappViewModel = PluginHelpers.isNappViewModel(id);
            if (!isNappViewModel) {
                if (!/\.(ts)$/.test(id))
                    return null;
                if (id.split("/").some(t => t === "node_modules"))
                    return null;
            }
            // console.log("transforming", id);
            // @ts-expect-error chill
            return babel.transform(code, {
                filename: id,
                babelrc: false,
                // include: [".js", ".html"],
                presets: [
                    ["@babel/preset-env", { "modules": false }]
                ],
                plugins: [
                    "@babel/plugin-transform-runtime",
                    ["@babel/plugin-proposal-decorators", { "version": "2023-05" }],
                    "@babel/plugin-transform-class-properties"
                ]
            });
        }
    };
}
//# sourceMappingURL=vite-n-app-babel-plugin.js.map