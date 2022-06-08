/* eslint-disable @typescript-eslint/no-unsafe-call */
// import { compileToFunctions } from "vue-template-compiler";
import * as Path from "path";
import * as Fs from "fs";
import { LoaderContext } from "webpack";
import { fs as MemFs } from "memfs";
import { given } from "@nivinjoseph/n-defensive";
import { populateGlobalElementTypeCache } from "./lib/element-type-cache";
import { combinedCompileConfig, compile, declarationCompileConfig } from "./lib/ts-compiler";
import { transformRenderFns } from "./lib/view-transformer";
const getOptions = require("loader-utils").getOptions;


module.exports = function (this: LoaderContext<any>, src: string): string
{    
    // console.log("Ts-check loading", this.resourcePath);
    // console.log(globalComponentElementTypeCache);
    
    // const callback = this.async();
    
    const options = (getOptions(this) || {}) as Record<string, unknown>;
    const isDebug = !!options.debug;
    let debugFiles = options.debugFiles as Array<string> | null ?? [];
    given(debugFiles, "debugFiles").ensureHasValue().ensureIsArray();
    debugFiles = debugFiles.map(t => Path.join(Path.dirname(t), Path.basename(t).split(".").takeFirst()));
    
    const filePath = this.resourcePath;
    const dir = Path.dirname(filePath);
    const file = Path.basename(filePath);
    const viewModelFile = file.replace("-view.html", "-view-model.ts");
    
    if (!dir.contains("node_modules"))
        compile(isDebug, debugFiles, [Path.join(dir, viewModelFile)], declarationCompileConfig, this);
    
    const declarationFile = file.replace("-view.html", "-view-model.d.ts");
    
    const declaration = dir.contains("node_modules")
        ? Fs.readFileSync(Path.join(dir, declarationFile), "utf8")
        : MemFs.readFileSync(Path.join(dir, declarationFile), "utf8");
    
    const className = file.replace("-view.html", "").split("-")
        .map(t => t.split("").takeFirst().toUpperCase() + t.split("").skip(1).join(""))
        .join("") + "ViewModel";
    
    const staticRenderFnsKey = "var staticRenderFns =";
    let [renderFn, staticRenderFns] = src.split(staticRenderFnsKey);
    staticRenderFns = staticRenderFnsKey + staticRenderFns;
    
    // console.log(renderFn);
    
    renderFn = transformRenderFns(renderFn, this, className);
    
        
    staticRenderFns = staticRenderFns
        .replaceAll(", arguments)", ", arguments as any)")
        .replace("render._withStripped", ";(<any>render)._withStripped");
    
    const combinedContents = `
    ${declaration}
    
    ${renderFn}
    
    ${staticRenderFns}
    `;
    
    const combinedFile = file.replace("-view.html", "-view-model.temp.ts");
    const combinedFilePath = Path.join(dir, combinedFile);
    if (!MemFs.existsSync(dir))
        MemFs.mkdirSync(dir, { recursive: true });
    MemFs.writeFileSync(combinedFilePath, combinedContents, { encoding: "utf-8" });
    if (isDebug)
    {
        if (debugFiles.contains(combinedFilePath.replace(".temp.ts", "")))
            Fs.writeFileSync(combinedFilePath, combinedContents, "utf8");
    }
    
    compile(isDebug, debugFiles, [combinedFilePath], combinedCompileConfig, this, true);
    
    // console.log("=====second-pass-end======");
    
    
    // const result = compileToFunctions(src);
    
    // console.log(JSON.stringify((<any>result.render)[0]));
    
    
    return src;
    
    
    // const done = this.async();
    // // @ts-expect-error: unsafe use of this
    // const options = getOptions(this) || {};
    // // @ts-expect-error: unsafe use of this
    // const publicPath = getPublicPath(options, this);
    // // @ts-expect-error: unsafe use of this
    // this.cacheable();

    // try
    // {
    //     console.log(src);
    //     done(null, await evalDependencyGraph({
    //         // @ts-expect-error: unsafe use of this
    //         loaderContext: this,
    //         src,
    //         // @ts-expect-error: unsafe use of this
    //         filename: this.resourcePath,
    //         publicPath
    //     }));
    // }
    // catch (error)
    // {
    //     done(error);
    // }
};

module.exports.pitch = function (this: LoaderContext<any>): void
{
    // console.log("Ts-check pitching", this.resourcePath);
    
    // if (this.mode !== "production")
    //     return;
    
    populateGlobalElementTypeCache(this);
};





// interface Foo
// {
//     num: number;
//     str: string;
//     bool: boolean;
//     func: Function;
//     array: Array<any>;
//     object: object;
// }

// type Foo = { a: string; b: number; };
// type Bar = { c: string; d: number; };
// type ParFoo = Partial<Foo>;

// const s: Partial<Foo> & Bar = {
//     a: "",
//     "s": 4,
    
// };

// const ["s"] = <{ "max-file-size": number; "multiple": boolean; } & { "id": string; "mime-types": string; }>{
//     id: "",
//     "mime-types": "",
//     "max-file-size": 5,
//     multiple: true,
//     foo: 4
// };