import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
import { ComponentViewModel } from "./component-view-model.js";
export const templateSymbol = Symbol.for("@nivinjoseph/n-app/template");
// public
export function template(template) {
    given(template, "template").ensureHasValue();
    if (typeof template === "string")
        given(template, "template").ensureIsString();
    else
        given(template, "template").ensureIsFunction();
    const decorator = (_, context) => {
        given(context, "context")
            // @ts-expect-error chill
            .ensure(t => t.kind === "class", "template decorator should only be used on a class");
        const className = context.name;
        given(className, className).ensureHasValue().ensureIsString();
        context.metadata[templateSymbol] = template;
    };
    return decorator;
}
//# sourceMappingURL=template.js.map