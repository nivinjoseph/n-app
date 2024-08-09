import { compileTemplate } from "@vue/compiler-sfc";
import { readFile } from "fs/promises";
import type { Plugin } from "vite";


const htmlViewFiles = /^(?!.*\/index\.html$).*\.html$/;


export function ViteNAppViewPlugin(options: { isDev: boolean; }): Plugin
{
    const { isDev } = options;

    return {
        name: "vite-n-app-view-plugin",
        enforce: "pre",
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        resolveId: async function (source, importer, options)
        {
            if (source.endsWith("-view.html"))
            {
                const resolution = await this.resolve(source, importer, options);

                if (resolution == null || resolution.external)
                    return resolution;

                return isDev ? `${resolution.id}` : `${resolution.id}.js`;
            }

            return null;
        },

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        load: async function (id, _)
        {
            console.log("load", id);
            if (isDev)
                return;

            if (!id.endsWith("-view.html.js"))
                return;

            const html = await readFile(id.substring(0, id.length - 3), "utf-8");
            const complied = createRenderFunction(id, html, isDev);

            return complied;
        },

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        transform: function (code, id, _)
        {
            console.log("transform", id);
            if (!isDev)
                return;

            if (!htmlViewFiles.test(id))
                return;

            return createRenderFunction(id, code, isDev);
        }
    };
}

function createRenderFunction(id: string, html: string, isDev: boolean): { code: string; map: any; }
{
    const compiledTemplate = compileTemplate({
        source: html,
        id,
        filename: id.split("/").takeLast().split("?").takeFirst(),
        isProd: !isDev
    });


    const code = `
${compiledTemplate.code}

export default render;
`;


    return {
        code,
        map: compiledTemplate.map
    };
}