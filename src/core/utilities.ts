import { ApplicationException } from "@nivinjoseph/n-exception";
import "@nivinjoseph/n-ext";
import { PropertyInfo } from "./property-info.js";
import { Utils } from "./utils.js";


export class Utilities
{
    private static readonly _internal = ["ctx", "onCreate", "onMount", "onDestroy", "executeOnCreate", "executeOnDestroy",
        "watch", "unWatch", "bindings", "getBound", "getBoundModel", "setBoundModel", "pathArgs", "queryArgs", "onEnter", "onLeave"];
    
    public static readonly forbidden = ["do", "if", "for", "let", "new", "try", "var", "case", "else", "with", "await", "break",
        "catch", "class", "const", "super", "throw", "while", "yield", "delete", "export", "import", "return",
        "switch", "default", "extends", "finally", "continue", "debugger", "function", "arguments", "typeof", "void", "props"];
    
    
    
    public static getPropertyInfos(val: unknown): Array<PropertyInfo>
    {
        const propertyInfos = new Array<PropertyInfo>();
        const prototype = Object.getPrototypeOf(val);
        if (prototype === undefined || prototype === null)  // we are dealing with Object
            return propertyInfos;
        
        propertyInfos.push(...Utilities.getPropertyInfos(prototype));
        
        const propertyNames = Object.getOwnPropertyNames(val);
        for (let name of propertyNames)
        {
            name = name.trim();
            if (name === "constructor" || name.startsWith("_") || name.startsWith("$") || Utilities._internal.some(t => t === name))
                continue;

            if (Utilities.forbidden.some(t => t === name))
                throw new ApplicationException(`Class ${Utils.getTypeName(val as Function)} has a member with the forbidden name '${name}'. The following names are forbidden: ${Utilities.forbidden}.`);
            
            const descriptor = Object.getOwnPropertyDescriptor(val, name)!;
            propertyInfos.push(new PropertyInfo(name, descriptor));
        }
        
        return propertyInfos;
    }
    
    // public static createRouteArgs(route: RouteInfo, ctx: any): Array<any>
    // {
    //     let pathParams = ctx.params ? ctx.params : {};
    //     let queryParams = ctx.query ? ctx.query : {};
    //     let model: { [index: string]: any } = {};

    //     for (let param of route.params)
    //     {
    //         let lookupKey = param.paramKey.trim().toLowerCase();
    //         let value = null;
    //         if (param.isQuery)
    //         {
    //             for (let key in queryParams)
    //             {
    //                 if (key.trim().toLowerCase() === lookupKey)
    //                 {
    //                     value = param.parseParam(queryParams[key]);
    //                     break;
    //                 }    
    //             }
                
    //             if (value === undefined || value === null)
    //             {
    //                 if (!param.isOptional)
    //                     throw new HttpException(404);
                    
    //                 value = null;
    //             }    
    //         }
    //         else
    //         {
    //             for (let key in pathParams)
    //             {
    //                 if (key.trim().toLowerCase() === lookupKey)
    //                 {
    //                     value = param.parseParam(pathParams[key]);
    //                     break;
    //                 }
    //             }

    //             if (value === undefined || value === null)
    //                 throw new HttpException(404);
    //         }
            
    //         model[param.paramKey] = value;
    //     }    

        
    //     // for (let key in queryParams)
    //     // {
    //     //     let routeParam = route.findRouteParam(key);
    //     //     if (!routeParam)
    //     //         continue;

    //     //     model[routeParam.paramKey] = routeParam.parseParam(queryParams[key]);
    //     // }

    //     // for (let key in pathParams) // this wont work in multi level nesting
    //     // {
    //     //     let routeParam = route.findRouteParam(key);
    //     //     if (!routeParam)
    //     //         throw new HttpException(404);

    //     //     model[routeParam.paramKey] = routeParam.parseParam(pathParams[key]);
    //     // }

    //     let result = [];
    //     for (let param of route.params.orderBy(t => t.order))
    //     {
    //         let value = model[param.paramKey];
    //         // if (value === undefined || value === null)
    //         // {
    //         //     if (!param.isOptional)
    //         //         throw new HttpException(404);

    //         //     value = null;
    //         // }
    //         result.push(value);
    //     }

    //     return result;
    // }
}






