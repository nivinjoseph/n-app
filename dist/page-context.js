import { createContext, useContext } from "react";
export const PageContext = createContext(null);
export function usePageContext() {
    const ctx = useContext(PageContext);
    if (ctx == null)
        throw new Error("PageContext not provided <PageContext.Provider>");
    return ctx;
}
//# sourceMappingURL=page-context.js.map