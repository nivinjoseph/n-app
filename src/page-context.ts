import type { ServiceLocator } from "@nivinjoseph/n-ject";
import { createContext, useContext } from "react";

export type PageScope = ServiceLocator & { readonly __brand: "page" };

export const PageContext = createContext<PageScope | null>(null);

export function usePageContext(): PageScope {
    const ctx = useContext(PageContext);
    if (ctx == null)
        throw new Error("PageContext not provided <PageContext.Provider>");

    return ctx;
}
