"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const vm = require("vm");
const path = require("path");
const getOptions = require("loader-utils").getOptions;
// const resolve = require("resolve");
const btoa = require("btoa");
const config = require(path.resolve(process.cwd(), "webpack.config.js"));
const resolve = require("enhanced-resolve").create.sync({ alias: config.resolve && config.resolve.alias || [] });
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
// tslint:disable-next-line: no-default-export
function extractLoader(src) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const done = this.async();
        const options = getOptions(this) || {};
        const publicPath = getPublicPath(options, this);
        this.cacheable();
        try {
            done(null, yield evalDependencyGraph({
                loaderContext: this,
                src,
                filename: this.resourcePath,
                publicPath,
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
        catch (error) {
            throw error;
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
                query: givenRelativePath.slice(indexOfQuery),
            };
        }
        return {
            relativePathWithoutQuery: givenRelativePath,
            query: "",
        };
    }
    function evalModule(src, filename) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const rndPlaceholder = "__EXTRACT_LOADER_PLACEHOLDER__" + rndNumber() + rndNumber();
            const rndPlaceholderPattern = new RegExp(rndPlaceholder, "g");
            const script = new vm.Script(src, {
                filename,
                displayErrors: true,
            });
            const newDependencies = [];
            const exports = {};
            const sandbox = Object.assign({}, global, {
                module: {
                    exports,
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
                    const absolutePath = resolve(path.dirname(filename), relativePath);
                    const ext = path.extname(absolutePath);
                    if (moduleCache.has(absolutePath)) {
                        return moduleCache.get(absolutePath);
                    }
                    // If the required file is a js file, we just require it with node's require.
                    // If the required file should be processed by a loader we do not touch it (even if it is a .js file).
                    if (loaders === "" && ext === ".js") {
                        // Mark the file as dependency so webpack's watcher is working for the css-loader helper.
                        // Other dependencies are automatically added by loadModule() below
                        loaderContext.addDependency(absolutePath);
                        const exports = require(absolutePath); // eslint-disable-line import/no-dynamic-require
                        moduleCache.set(absolutePath, exports);
                        return exports;
                    }
                    newDependencies.push({
                        absolutePath,
                        absoluteRequest: loaders + absolutePath + query,
                    });
                    return rndPlaceholder;
                },
            });
            script.runInNewContext(sandbox);
            const extractedDependencyContent = yield Promise.all(newDependencies.map(({ absolutePath, absoluteRequest }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const src = yield loadModule(absoluteRequest);
                return evalModule(src, absolutePath);
            })));
            const contentWithPlaceholders = extractExports(sandbox.module.exports);
            const extractedContent = contentWithPlaceholders.replace(rndPlaceholderPattern, () => extractedDependencyContent.shift());
            moduleCache.set(filename, extractedContent);
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
    if ("publicPath" in options) {
        return typeof options.publicPath === "function" ? options.publicPath(context) : options.publicPath;
    }
    if (context.options && context.options.output && "publicPath" in context.options.output) {
        return context.options.output.publicPath;
    }
    if (context._compilation && context._compilation.outputOptions && "publicPath" in context._compilation.outputOptions) {
        return context._compilation.outputOptions.publicPath;
    }
    return "";
}
/* eslint-enable complexity */
// For CommonJS interoperability
// module.exports = extractLoader;
// export default extractLoader;
//# sourceMappingURL=view-loader.js.map