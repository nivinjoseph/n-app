import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
export const metaSymbol = Symbol.for("@nivinjoseph/n-app/meta");
// public
export function meta(...metas) {
    given(metas, "metas").ensureHasValue().ensureIsArray()
        .ensure(t => t.isNotEmpty);
    const decorator = (_, context) => {
        given(context, "context")
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .ensure(t => t.kind === "class", "meta decorator should only be used on a class");
        const className = context.name;
        given(className, className).ensureHasValue().ensureIsString();
        context.metadata[metaSymbol] = metas;
    };
    return decorator;
}
//# sourceMappingURL=meta.js.map