"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pages = exports.pagesSymbol = void 0;
require("reflect-metadata");
const n_defensive_1 = require("@nivinjoseph/n-defensive");
exports.pagesSymbol = Symbol("pages");
// public
function pages(...pages) {
    n_defensive_1.given(pages, "pages").ensureHasValue().ensureIsArray().ensure(t => t.length > 0);
    return (target) => Reflect.defineMetadata(exports.pagesSymbol, pages, target);
}
exports.pages = pages;
//# sourceMappingURL=pages.js.map