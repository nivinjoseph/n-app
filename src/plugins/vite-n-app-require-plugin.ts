import generateRaw from "@babel/generator";
import { parse } from "@babel/parser";
import traverseRaw from "@babel/traverse";
import { identifier, importDeclaration, importDefaultSpecifier, stringLiteral, type BinaryExpression, type ExpressionStatement } from "@babel/types";
import type { Plugin, TransformResult } from "vite";
import { PluginHelpers } from "./plugin-helpers.js";


const traverse = (traverseRaw as any).default as typeof traverseRaw;
const generate = (generateRaw as any).default as typeof generateRaw;

export function ViteNAppRequirePlugin(opts?: {
    fileRegex?: RegExp;
    // log?(...arg: Array<any>): void;
    // 转换方式，默认用 import 方式替换，可使用 https://vitejs.cn/guide/assets.html#new-url-url-import-meta-url 方式
    // importMetaUrl | import
    translateType?: "importMetaUrl" | "import";
}): Plugin
{
    const { fileRegex = /-view-model\.(ts|js)$/, translateType = "import" } = opts || {};
    let sourcemap: boolean;
    return {
        name: "vite-plugin-n-app-require",
        configResolved(resolvedConfig: any): void
        {
            // dev model default true
            const isDev = resolvedConfig.env.MODE === "development";
            if (isDev)
            {
                sourcemap = true;
            }
            else
            {
                sourcemap = resolvedConfig.build.sourcemap as boolean;
            }
        },
        async transform(code: string, id: string): Promise<TransformResult | null>
        {
            const isNappViewModel = PluginHelpers.isNappViewModel(id);
            //  Exclude files in node_modules
            if (!isNappViewModel && /\/node_modules\//g.test(id))
            {
                return null;
            }

            let newCode = code;
            let newMap = null; // 没有更改源代码时为 null
            if (fileRegex.test(id) || isNappViewModel)
            {

                const ast = parse(code, {
                    sourceType: "module"
                    // 更新版本的 babel/parse 只能配置为二维数组，第二个选项为配置
                    // plugins: plugins as any
                }) as any;

                traverse(ast, {
                    enter(path)
                    {
                        if (path.isIdentifier({ name: "require" }))
                        {
                            const arg = (path.container as Record<string, any> | null)?.arguments?.[0];

                            if (arg)
                            {
                                let stringVal: string = "";
                                switch (arg?.type)
                                {
                                    case "StringLiteral":
                                        stringVal = arg.value;
                                        break;
                                    case "Identifier":
                                        // eslint-disable-next-line no-case-declarations
                                        const IdentifierName = arg.name;
                                        traverse(ast, {
                                            Identifier: (path) =>
                                            {
                                                // 这里不处理各种变量赋值，只考虑唯一变量
                                                if (path.node.name === IdentifierName)
                                                {
                                                    if (!Array.isArray(path.container) && (path.container as any).init?.type === "StringLiteral")
                                                    {
                                                        stringVal = (path.container as any).init.value;
                                                    }
                                                }
                                            }
                                        });
                                        break;
                                    case "BinaryExpression":
                                        // eslint-disable-next-line no-case-declarations
                                        const binaryExpressionLoopFn = (lOr: BinaryExpression["right"] | BinaryExpression["left"]): void =>
                                        {
                                            if (lOr.type === "BinaryExpression")
                                            {
                                                binaryExpressionLoopFn(lOr.left);
                                                binaryExpressionLoopFn(lOr.right);
                                            }
                                            else
                                            {
                                                // 只处理变量或者字符串
                                                if (lOr.type === "StringLiteral")
                                                {
                                                    stringVal += lOr.value;
                                                }
                                                else if (lOr.type === "Identifier")
                                                {
                                                    // 这里不处理各种变量赋值，只考虑唯一变量
                                                    const IdentifierName = lOr.name;
                                                    traverse(ast, {
                                                        Identifier: (path) =>
                                                        {
                                                            // 这里不处理各种变量赋值，只考虑唯一变量
                                                            if (path.node.name === IdentifierName)
                                                            {
                                                                // log(path);
                                                                if (!Array.isArray(path.container) && (path.container as any).init?.type === "StringLiteral")
                                                                {
                                                                    // log((path.container as any).init.value);
                                                                    stringVal += (path.container as any).init.value;
                                                                }
                                                            }
                                                        }
                                                    });
                                                }
                                                else if (lOr.type === "MemberExpression")
                                                {
                                                    // 这里不处理各种变量赋值，只考虑唯一变量
                                                    if (lOr.property.type === "Identifier")
                                                    {
                                                        const IdentifierName = lOr.property.name;
                                                        traverse(ast, {
                                                            Identifier: (path) =>
                                                            {
                                                                // 这里不处理各种变量赋值，只考虑唯一变量
                                                                if (path.node.name === IdentifierName)
                                                                {
                                                                    // log(path)
                                                                    if (!Array.isArray(path.container) && (path.container as any).init?.type === "StringLiteral")
                                                                    {
                                                                        // log((path.container as any).init.value);
                                                                        stringVal += (path.container as any).init.value;
                                                                    }
                                                                }
                                                            }
                                                        });
                                                    }
                                                }
                                                else
                                                {
                                                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
                                                    throw `不支持的: BinaryExpression 组成类型 ${lOr.type}`;
                                                }
                                            }
                                        };
                                        binaryExpressionLoopFn(arg.left);
                                        binaryExpressionLoopFn(arg.right);
                                        break;
                                    case "MemberExpression":
                                        // requre(new Url())
                                        break;
                                    default:
                                        // eslint-disable-next-line @typescript-eslint/no-throw-literal
                                        throw `Unsupported type: ${arg?.type}`;
                                }
                                path.node.name = "";
                                if (stringVal)
                                {
                                    // Insert import at the top to pack resources when vite packs
                                    const realPath: string | ExpressionStatement = `vitePluginRequire_${new Date().getTime()}_${parseInt(Math.random() * 100000000 + 100 + "")}`;
                                    if (translateType === "import")
                                    {
                                        const importAst = importDeclaration([importDefaultSpecifier(identifier(realPath))], stringLiteral(stringVal));
                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                                        ast.program.body.unshift(importAst as any);

                                        switch (arg?.type)
                                        {
                                            case "StringLiteral":
                                                (path.container as Record<string, any>).arguments[0].value = realPath;
                                                if ((path.container as Record<string, any>).arguments[0].extra)
                                                {
                                                    (path.container as Record<string, any>).arguments[0].extra.raw = realPath;
                                                    (path.container as Record<string, any>).arguments[0].extra.rawValue = realPath;
                                                }
                                                break;
                                            case "Identifier":
                                                (path.container as Record<string, any>).arguments[0].name = realPath;
                                                break;
                                            case "BinaryExpression":
                                                // 直接改成变量
                                                (path.container as Record<string, any>).arguments[0] = identifier(realPath);
                                                break;
                                            default:
                                                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                                                throw `Unsupported type: ${arg?.type}`;
                                        }
                                    }
                                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                    // else if (translateType === "importMetaUrl")
                                    // {
                                    //     // 改为 import.meta.url ...
                                    //     const metaObj = memberExpression(memberExpression(identifier("import"), identifier("meta")), identifier("url"));
                                    //     const importAst = newExpression(identifier("URL"), [stringLiteral(stringVal), metaObj]);
                                    //     const hrefObj = expressionStatement(memberExpression(importAst, identifier("href")));

                                    //     // eslint-disable-next-line no-useless-escape
                                    //     const strCode = generate(hrefObj as any, {}).code.replace(/\;$/, "");
                                    //     // log("importAst", strCode);

                                    //     switch (arg?.type)
                                    //     {
                                    //         case "StringLiteral":
                                    //             (path.container as Record<string, any>).arguments[0].value = strCode;
                                    //             if ((path.container as Record<string, any>).arguments[0].extra)
                                    //             {
                                    //                 (path.container as Record<string, any>).arguments[0].extra.raw = strCode;
                                    //                 (path.container as Record<string, any>).arguments[0].extra.rawValue = strCode;
                                    //             }
                                    //             break;
                                    //         case "Identifier":
                                    //             (path.container as Record<string, any>).arguments[0].name = strCode;
                                    //             break;
                                    //         case "BinaryExpression":
                                    //             // 直接改成变量
                                    //             (path.container as Record<string, any>).arguments[0] = identifier(strCode);
                                    //             break;
                                    //         default:
                                    //             // eslint-disable-next-line @typescript-eslint/no-throw-literal
                                    //             throw `Unsupported type: ${arg?.type}`;
                                    //     }
                                    // }
                                }
                            }
                        }
                    }
                });

                const output = generate(ast, {
                    sourceMaps: true,
                    //  sourceFileName: code
                    sourceFileName: id
                }, code);
                newCode = output.code;
                if (sourcemap)
                {
                    newMap = output.map;
                }
            }
            return {
                code: newCode,
                // https://rollupjs.org/guide/en/#thisgetcombinedsourcemap
                // @ts-expect-error chill
                map: newMap
            };
        }
    };
}