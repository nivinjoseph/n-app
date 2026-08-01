// Workaround for https://github.com/yarnpkg/berry/issues/7191:
// Yarn <= 4.17.0 rewrites the `typescript` descriptor to apply the builtin
// PnP compat patch, whose hunks target JS-compiler files (lib/_tsc.js) that no
// longer exist in the TypeScript 7 native-compiler package, so `yarn install`
// fails. This repo uses `nodeLinker: node-modules`, so the PnP compat patch is
// semantically unnecessary — this plugin strips it from the descriptor.
// Remove once the repo's pinned Yarn includes yarnpkg/berry#7190
// (merged 2026-07-01, unreleased as of 4.17.0).
module.exports = {
    name: "plugin-disable-typescript-compat",
    factory: (require) => {
        const { structUtils } = require("@yarnpkg/core");

        return {
            hooks: {
                reduceDependency: async (dependency) => {
                    if (structUtils.stringifyIdent(dependency) !== "typescript")
                        return dependency;

                    if (!dependency.range.startsWith("patch:"))
                        return dependency;

                    const source = dependency.range.match(/^patch:([^#]+)/)?.[1];

                    if (!source)
                        return dependency;

                    return {
                        ...dependency,
                        range: structUtils.parseDescriptor(decodeURIComponent(source)).range,
                    };
                },
            },
        };
    },
};
