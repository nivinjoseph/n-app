import "@nivinjoseph/n-ext";
import { given } from "@nivinjoseph/n-defensive";
import { ComponentViewModel } from "./component-view-model.js";
export const persistSymbol = Symbol.for("@nivinjoseph/n-app/persist");
// public
export function persist(_, context) {
    given(context, "context")
        // @ts-expect-error chill
        .ensure(t => t.kind === "class", "persist decorator should only be used on a class");
    const className = context.name;
    given(className, className).ensureHasValue().ensureIsString();
    context.metadata[persistSymbol] = true;
}
//# sourceMappingURL=persist.js.map