"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-unsafe-call */
const vm = require("vm");
const path = require("path");
const getOptions = require("loader-utils").getOptions;
// const resolve = require("resolve");
const btoa = require("btoa");
// const config = require(path.resolve(process.cwd(), "webpack.config.js"));
// const resolve = require("enhanced-resolve").create.sync({ alias: config.resolve && config.resolve.alias || [] });
const enhancedResolve = require("enhanced-resolve");
/**
 * @typedef {Object} LoaderContext
 * @property {function} cacheable
 * @property {function} async
 * @property {function} addDependency
 * @property {function} loadModule
 * @property {string} resourcePath
 * @property {object} options
 */
/**
 * Executes the given module's src in a fake context in order to get the resulting string.
 *
 * @this LoaderContext
 * @param {string} src
 * @throws Error
 */
function extractLoader(src) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // @ts-expect-error: unsafe use of this
        const done = this.async();
        // @ts-expect-error: unsafe use of this
        const options = getOptions(this) || {};
        // @ts-expect-error: unsafe use of this
        const publicPath = getPublicPath(options, this);
        // @ts-expect-error: unsafe use of this
        this.cacheable();
        try {
            // console.log(src);
            done(null, yield evalDependencyGraph({
                // @ts-expect-error: unsafe use of this
                loaderContext: this,
                src,
                // @ts-expect-error: unsafe use of this
                filename: this.resourcePath,
                publicPath
            }));
        }
        catch (error) {
            done(error);
        }
    });
}
exports.default = extractLoader;
function evalDependencyGraph({ loaderContext, src, filename, publicPath = "" }) {
    const moduleCache = new Map();
    function loadModule(filename) {
        return new Promise((resolve, reject) => {
            // loaderContext.loadModule automatically calls loaderContext.addDependency for all requested modules
            loaderContext.loadModule(filename, (error, src) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(src);
                }
            });
        });
    }
    function extractExports(exports) {
        const hasBtoa = "btoa" in global;
        const previousBtoa = global.btoa;
        global.btoa = btoa;
        try {
            return exports.toString();
        }
        finally {
            if (hasBtoa) {
                global.btoa = previousBtoa;
            }
            else {
                delete global.btoa;
            }
        }
    }
    function extractQueryFromPath(givenRelativePath) {
        const indexOfLastExclMark = givenRelativePath.lastIndexOf("!");
        const indexOfQuery = givenRelativePath.lastIndexOf("?");
        if (indexOfQuery !== -1 && indexOfQuery > indexOfLastExclMark) {
            return {
                relativePathWithoutQuery: givenRelativePath.slice(0, indexOfQuery),
                query: givenRelativePath.slice(indexOfQuery)
            };
        }
        return {
            relativePathWithoutQuery: givenRelativePath,
            query: ""
        };
    }
    function evalModule(src, filename) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const script = new vm.Script(src, {
                filename,
                displayErrors: true
            });
            const newDependencies = [];
            const exports = {};
            const sandbox = Object.assign({}, global, {
                module: {
                    exports
                },
                exports,
                __webpack_public_path__: publicPath,
                require: (givenRelativePath) => {
                    const { relativePathWithoutQuery, query } = extractQueryFromPath(givenRelativePath);
                    const indexOfLastExclMark = relativePathWithoutQuery.lastIndexOf("!");
                    const loaders = givenRelativePath.slice(0, indexOfLastExclMark + 1);
                    const relativePath = relativePathWithoutQuery.slice(indexOfLastExclMark + 1);
                    // const absolutePath = resolve.sync(relativePath, {
                    //     basedir: path.dirname(filename),
                    // });
                    const resolveOptions = loaderContext._compilation.options.resolve;
                    const resolve = enhancedResolve.create.sync({ alias: resolveOptions && resolveOptions.alias || [] });
                    const absolutePath = resolve(path.dirname(filename), relativePath);
                    const ext = path.extname(absolutePath);
                    if (moduleCache.has(absolutePath)) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                        return moduleCache.get(absolutePath);
                    }
                    // If the required file is a js file, we just require it with node's require.
                    // If the required file should be processed by a loader we do not touch it (even if it is a .js file).
                    if (loaders === "" && ext === ".js") {
                        // Mark the file as dependency so webpack's watcher is working for the css-loader helper.
                        // Other dependencies are automatically added by loadModule() below
                        loaderContext.addDependency(absolutePath);
                        const exports = require(absolutePath);
                        moduleCache.set(absolutePath, exports);
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                        return exports;
                    }
                    const rndPlaceholder = "__EXTRACT_LOADER_PLACEHOLDER__" + rndNumber() + rndNumber();
                    newDependencies.push({
                        absolutePath,
                        absoluteRequest: loaders + absolutePath + query,
                        rndPlaceholder
                    });
                    return rndPlaceholder;
                }
            });
            script.runInNewContext(sandbox);
            const extractedDependencyContent = yield Promise.all(newDependencies.map(({ absolutePath, absoluteRequest }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const src = yield loadModule(absoluteRequest);
                return evalModule(src, absolutePath);
            })));
            const contentWithPlaceholders = extractExports(sandbox.module.exports);
            const extractedContent = extractedDependencyContent.reduce((content, dependencyContent, idx) => {
                const pattern = new RegExp(newDependencies[idx].rndPlaceholder, "g");
                return content.replace(pattern, dependencyContent);
            }, contentWithPlaceholders);
            moduleCache.set(filename, extractedContent);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return extractedContent;
        });
    }
    return evalModule(src, filename);
}
/**
 * @returns {string}
 */
function rndNumber() {
    return Math.random()
        .toString()
        .slice(2);
}
// getPublicPath() encapsulates the complexity of reading the publicPath from the current
// webpack config. Let's keep the complexity in this function.
/* eslint-disable complexity  */
/**
 * Retrieves the public path from the loader options, context.options (webpack <4) or context._compilation (webpack 4+).
 * context._compilation is likely to get removed in a future release, so this whole function should be removed then.
 * See: https://github.com/peerigon/extract-loader/issues/35
 *
 * @deprecated
 * @param {Object} options - Extract-loader options
 * @param {Object} context - Webpack loader context
 * @returns {string}
 */
function getPublicPath(options, context) {
    let publicPath = "";
    if ("publicPath" in options) {
        publicPath = typeof options.publicPath === "function" ? options.publicPath(context) : options.publicPath;
    }
    else if (context.options && context.options.output && "publicPath" in context.options.output) {
        publicPath = context.options.output.publicPath;
    }
    else if (context._compilation && context._compilation.outputOptions && "publicPath" in context._compilation.outputOptions) {
        publicPath = context._compilation.outputOptions.publicPath;
    }
    return publicPath === "auto" ? "" : publicPath;
}
/* eslint-enable complexity */
// For CommonJS interoperability
// module.exports = extractLoader;
// export default extractLoader;
//# sourceMappingURL=view-loader.js.map