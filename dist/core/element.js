import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
export const elementSymbol = Symbol.for("@nivinjoseph/n-app/element");
// public
export function element(elementName) {
    given(elementName, "elementName").ensureHasValue().ensureIsString();
    const decorator = (_, context) => {
        given(context, "context")
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .ensure(t => t.kind === "class", "element decorator should only be used on a class");
        const className = context.name;
        given(className, className).ensureHasValue().ensureIsString();
        context.metadata[elementSymbol] = elementName;
    };
    return decorator;
}
//# sourceMappingURL=element.js.map