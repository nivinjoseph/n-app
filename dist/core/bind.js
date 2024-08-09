import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
export const bindSymbol = Symbol.for("@nivinjoseph/n-app/bind");
// public
export function bind(schema) {
    given(schema, "schema").ensureHasValue().ensureIsObject();
    const decorator = (_, context) => {
        given(context, "context")
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .ensure(t => t.kind === "class", "bind decorator should only be used on a class");
        const className = context.name;
        given(className, className).ensureHasValue().ensureIsString();
        context.metadata[bindSymbol] = schema;
    };
    return decorator;
}
//# sourceMappingURL=bind.js.map