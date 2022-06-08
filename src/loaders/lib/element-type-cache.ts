import { LoaderContext } from "webpack";
import * as Path from "path";
import * as Fs from "fs";
import { given } from "@nivinjoseph/n-defensive";

export type ElementTypeInfo = {
    attrsSchema: string;
    hasRequiredAttrs: boolean;
    modelSchema: string;
    hasModel: boolean;
    filePath: string;
};

export let globalComponentElementTypeCache: Map<string, ElementTypeInfo> | null = null;


export function populateGlobalElementTypeCache(context: LoaderContext<any>): void
{
    if (globalComponentElementTypeCache == null)
    {
        globalComponentElementTypeCache = new Map<string, ElementTypeInfo>();

        const isPackage = __dirname.contains("node_modules");
        const paths = [Path.resolve(process.cwd(), "src")];
        if (isPackage)
            paths.push(Path.resolve(process.cwd(), "node_modules", "@nivinjoseph", "n-app", "src", "components"));
        else
            paths.push(Path.resolve(process.cwd(), "test-app"));

        const files = paths.reduce<Array<string>>((acc, path) =>
        {
            acc.push(...traverseAccumulateFiles(path));
            return acc;
        }, new Array<string>());

        files.forEach((filePath) => createBindingSchema(context, filePath));
    }

    createBindingSchema(context, context.resourcePath);
}

function traverseAccumulateFiles(dir: string): Array<string>
{
    given(dir, "dir").ensureHasValue().ensureIsString()
        .ensure(t => Fs.statSync(t).isDirectory(), "not directory");

    return Fs.readdirSync(dir).reduce((acc, path) =>
    {
        path = Path.resolve(dir, path);
        if (Fs.statSync(path).isDirectory())
            acc.push(...traverseAccumulateFiles(path));
        else if (path.endsWith("-view.html"))
            acc.push(path);

        return acc;
    }, new Array<string>());
}

function createBindingSchema(context: LoaderContext<any>, filePath: string): void
{
    const file = Path.basename(filePath);
    const dir = Path.dirname(filePath);

    const viewModelFile = file.replace("-view.html", "-view-model.ts");
    const viewModelFilePath = Path.join(dir, viewModelFile);
    if (!Fs.existsSync(viewModelFilePath))
        return;

    const viewModelContents = Fs.readFileSync(viewModelFilePath, "utf8");

    const elementDecorator = "@element(";
    const bindDecorator = "@bind(";
    const isComponent = viewModelContents.contains(elementDecorator); // && viewModelContents.contains(bindDecorator);
    if (!isComponent)
        return;

    context.addDependency(viewModelFilePath);

    let start = viewModelContents.indexOf(elementDecorator);
    let end = viewModelContents.indexOf(")", start);
    const element = viewModelContents.substring(start, end).replace(elementDecorator, "");
    // console.log(element);

    const elementInfo: ElementTypeInfo = {
        filePath: viewModelFilePath
    } as any;

    if (viewModelContents.contains(bindDecorator))
    {
        start = viewModelContents.indexOf(bindDecorator);
        end = viewModelContents.indexOf(")", start);
        let schema = viewModelContents.substring(start, end).replace(bindDecorator, "");
        // console.log(schema);
        schema = schemaToJson(schema);
        schema = schemaToType(context, viewModelFilePath, JSON.parse(schema), elementInfo);
        // console.log(schema);
    }

    globalComponentElementTypeCache!.set(element, elementInfo);
}

function schemaToJson(schema: string): string
{
    given(schema, "schema").ensureHasValue().ensureIsString();

    const splitSchema = schema.replaceAll("\r", "").replaceAll("\n", "").replaceAll("\r\n", "").replaceAll(" ", "")
        .replaceAll("'", "\"").split("");

    const formattedSchema = new Array<string>();

    // '{"foo?": "string", "bar": [], "baz": Nove, box: {b: "string"}'

    for (let i = 0; i < splitSchema.length; i++)
    {
        const char = splitSchema[i];
        if (i === 0)
        {
            formattedSchema.push(char);
            continue;
        }

        const charRe = /[A-Za-z0-9_$?]/;

        if (charRe.test(char))
        {
            const lastChar = splitSchema[i - 1];
            if (charRe.test(lastChar) || lastChar === "\"")
            {
                formattedSchema.push(char);
                continue;
            }
            else
            {
                formattedSchema.push("\"");
                formattedSchema.push(char);
                continue;
            }
        }
        else
        {
            if (char === "\"")
            {
                formattedSchema.push(char);
                continue;
            }

            const lastChar = splitSchema[i - 1];
            if (charRe.test(lastChar))
            {
                formattedSchema.push("\"");
                formattedSchema.push(char);
                continue;
            }
            else
            {
                formattedSchema.push(char);
                continue;
            }
        }
    }

    return formattedSchema.join("");

    // const schemaObj = JSON.parse(formattedSchema.join("")) as object;
}


function schemaToType(context: LoaderContext<any>, viewModelFilePath: string,
    schema: Record<string, any>, elementInfo?: ElementTypeInfo): string
{
    const isTopLevel = elementInfo != null;

    const typeDetails = Object.keys(schema)
        .map(key =>
        {
            const left = `"${isTopLevel ? key.split("").map(t => /[A-Z]/.test(t) ? `-${t.toLowerCase()}` : t).join("") : key}"`;
            const right = parseType(context, viewModelFilePath, schema[key]);
            const isOptional = left.contains("?");

            return { left, right, isOptional };
        });

    if (isTopLevel)
    {
        if (typeDetails.distinct(t => t.left.contains("?") ? t.left.replace("?", "") : t.left).length !== typeDetails.length)
        {
            context.emitError(new Error(`Duplicate binding declarations detected in ${viewModelFilePath} binding schema`));
        }
        if (typeDetails.some(t => t.left === `"model?"`))
        {
            context.emitError(new Error(`Model declared as optional in binding schema in ${viewModelFilePath}`));
        }
        if (typeDetails.some(t => t.left === `"value"` || t.left === `"value?"`))
        {
            context.emitError(new Error(`Using forbidden keyword 'value' in binding schema in ${viewModelFilePath}`));
        }


        const optionals = typeDetails.where(t => t.isOptional);
        let typedOptionals: string | null = null;
        if (optionals.isNotEmpty)
        {
            const flatOptionals = optionals
                .map(t =>
                {
                    t.left = t.left.replace("?", "");
                    return t.left + ": " + t.right;
                })
                .join(";");

            typedOptionals = `Partial<{ ${flatOptionals} }>`;
        }

        const model = typeDetails.find(t => t.left === `"model"`);
        let typedModel: string | null = null;
        if (model != null)
            typedModel = `{ value: ${model.right} }`;

        const requireds = typeDetails.where(t => t.left !== `"model"` && !t.isOptional);
        let typedRequireds: string | null = null;
        if (requireds.isNotEmpty)
        {
            const flatRequireds = requireds
                .map(t => t.left + ": " + t.right)
                .join(";");

            typedRequireds = `{ ${flatRequireds} }`;
        }

        let result = "";
        if (typedOptionals)
            result += typedOptionals;
        if (typedRequireds)
        {
            if (result.isNotEmptyOrWhiteSpace())
                result += "&";
            result += typedRequireds;
        }


        elementInfo.attrsSchema = result;
        elementInfo.hasRequiredAttrs = requireds.isNotEmpty;
        elementInfo.modelSchema = typedModel ?? "any";
        elementInfo.hasModel = model != null;

        return result;
    }

    return `{ ${typeDetails.map(t => t.left + ": " + t.right).join(";")} }`;
}

function parseType(context: LoaderContext<any>, viewModelFilePath: string, right: any): string
{
    if (typeof right === "string")
    {
        right = right.trim().toLowerCase();
        switch (right)
        {
            case "string":
                break;
            case "boolean":
                break;
            case "number":
                break;
            case "function":
                right = "Function";
                break;
            case "array":
                right = "ReadonlyArray<any>";
                break;
            case "object":
                break;
            default:
                right = "object";
                break;
        }
    }
    else if (Array.isArray(right))
    {
        if (right.isEmpty)
            right = "ReadonlyArray<any>";
        else
        {
            const arrayType = right[0];
            right = `ReadonlyArray<${parseType(context, viewModelFilePath, arrayType)}>`;
        }
    }
    else // {} object literal
    {
        right = schemaToType(context, viewModelFilePath, right);
    }

    return right as string;
}