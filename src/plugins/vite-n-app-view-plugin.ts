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
            if (isDev)
            {
                if (source.endsWith("-view.html"))
                {
                    const resolution = await this.resolve(source, importer, options);

                    if (resolution == null || resolution.external)
                        return resolution;

                    return `${resolution.id}`;
                }

                return null;
            }

            if (source.endsWith("-view.html"))
            {
                const resolution = await this.resolve(source, importer, options);

                if (resolution == null || resolution.external)
                    return resolution;

                return `${resolution.id}.js`;
            }

            return null;
        },

        // @ts-expect-error chill
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        load: async function (id, _)
        {
            if (isDev)
                return;

            if (id.endsWith("-view.html.js"))
            {
                const html = await readFile(id.substring(0, id.length - 3), "utf-8");

                const compiledTemplate = compileTemplate({
                    source: html,
                    id,
                    filename: id,
                    isProd: true
                });


                compiledTemplate.code = `
${compiledTemplate.code}

export default render;
`;

                return compiledTemplate;
            }

            return null;
        },
        // @ts-expect-error chill
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        transform: function (code, id, _)
        {
            if (!isDev)
                return;

            if (!htmlViewFiles.test(id))
                return;

            const compiledTemplate = compileTemplate({
                source: code,
                id: "name.js",
                filename: "name.js",
                isProd: false
            });

            compiledTemplate.code = `
${compiledTemplate.code}

export default render;
`;

            return compiledTemplate;
        }
    };
}