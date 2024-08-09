import { ApplicationException } from "@nivinjoseph/n-exception";
import "@nivinjoseph/n-ext";
import { PropertyInfo } from "./property-info.js";
import { Utils } from "./utils.js";
export class Utilities {
    static _internal = ["ctx", "onCreate", "onMount", "onDestroy", "executeOnCreate", "executeOnDestroy",
        "watch", "unWatch", "bindings", "getBound", "getBoundModel", "setBoundModel", "pathArgs", "queryArgs", "onEnter", "onLeave"];
    static forbidden = ["do", "if", "for", "let", "new", "try", "var", "case", "else", "with", "await", "break",
        "catch", "class", "const", "super", "throw", "while", "yield", "delete", "export", "import", "return",
        "switch", "default", "extends", "finally", "continue", "debugger", "function", "arguments", "typeof", "void", "props"];
    static getPropertyInfos(val) {
        const propertyInfos = new Array();
        const prototype = Object.getPrototypeOf(val);
        if (prototype === undefined || prototype === null) // we are dealing with Object
            return propertyInfos;
        propertyInfos.push(...Utilities.getPropertyInfos(prototype));
        const propertyNames = Object.getOwnPropertyNames(val);
        for (let name of propertyNames) {
            name = name.trim();
            if (name === "constructor" || name.startsWith("_") || name.startsWith("$") || Utilities._internal.some(t => t === name))
                continue;
            if (Utilities.forbidden.some(t => t === name))
                throw new ApplicationException(`Class ${Utils.getTypeName(val)} has a member with the forbidden name '${name}'. The following names are forbidden: ${Utilities.forbidden}.`);
            const descriptor = Object.getOwnPropertyDescriptor(val, name);
            propertyInfos.push(new PropertyInfo(name, descriptor));
        }
        return propertyInfos;
    }
}
//# sourceMappingURL=utilities.js.map