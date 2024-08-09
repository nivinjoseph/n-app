import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
export const titleSymbol = Symbol.for("@nivinjoseph/n-app/title");
// public
export function title(title) {
    given(title, "title").ensureHasValue().ensureIsString();
    title = title.trim();
    const decorator = (_, context) => {
        given(context, "context")
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .ensure(t => t.kind === "class", "title decorator should only be used on a class");
        const className = context.name;
        given(className, className).ensureHasValue().ensureIsString();
        context.metadata[titleSymbol] = title;
    };
    return decorator;
}
//# sourceMappingURL=title.js.map