import type { ServiceLocator } from "@nivinjoseph/n-ject";
import { createContext, useContext } from "react";

export type RootScope = ServiceLocator & { readonly __brand: "root" };

export const RootContext = createContext<RootScope | null>(null);

export function useRootContext(): RootScope {
    const ctx = useContext(RootContext);
    if (ctx == null)
        throw new Error("RootContext not provided <RootContext.Provider>");

    return ctx;
}
