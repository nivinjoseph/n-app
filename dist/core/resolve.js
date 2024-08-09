import { given } from "@nivinjoseph/n-defensive";
import { Utils } from "./utils.js";
export const resolveSymbol = Symbol.for("@nivinjoseph/n-app/resolve");
// public
export function resolve(...resolvers) {
    given(resolvers, "resolvers").ensureHasValue().ensureIsArray().ensure(t => t.isNotEmpty);
    const mapped = resolvers.map(t => {
        return {
            name: Utils.getTypeName(t),
            value: t
        };
    });
    const decorator = (_, context) => {
        given(context, "context")
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .ensure(t => t.kind === "class", "resolve decorator should only be used on a class");
        const className = context.name;
        given(className, className).ensureHasValue().ensureIsString();
        context.metadata[resolveSymbol] = mapped;
    };
    return decorator;
}
//# sourceMappingURL=resolve.js.map