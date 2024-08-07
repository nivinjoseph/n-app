import { type Plugin, type TransformResult } from "vite";
import babel from "@babel/core";


export function ViteNAppBabelPlugin(): Plugin
{
    return {
        name: "vite-n-app-babel-plugin",
        async transform(code, id, _): Promise<TransformResult | null>
        {
            if (! /\.(ts)$/.test(id))
                return null;

            if (id.split("/").some(t => t === "node_modules"))
                return null;

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