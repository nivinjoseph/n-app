import { given } from "@nivinjoseph/n-defensive";
export const pagesSymbol = Symbol.for("@nivinjoseph/n-app/pages");
// public
export function pages(...pages) {
    given(pages, "pages").ensureHasValue().ensureIsArray().ensure(t => t.isNotEmpty);
    const decorator = (_, context) => {
        given(context, "context")
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .ensure(t => t.kind === "class", "pages decorator should only be used on a class");
        const className = context.name;
        given(className, className).ensureHasValue().ensureIsString();
        context.metadata[pagesSymbol] = pages;
    };
    return decorator;
}
//# sourceMappingURL=pages.js.map