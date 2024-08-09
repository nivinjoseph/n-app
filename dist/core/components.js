import { given } from "@nivinjoseph/n-defensive";
export const componentsSymbol = Symbol.for("@nivinjoseph/n-app/components");
// public
export function components(...components) {
    const decorator = (_, context) => {
        given(context, "context")
            // @ts-expect-error chill
            .ensure(t => t.kind === "class", "components decorator should only be used on a class");
        const className = context.name;
        given(className, className).ensureHasValue().ensureIsString();
        context.metadata[componentsSymbol] = components;
    };
    return decorator;
}
//# sourceMappingURL=components.js.map