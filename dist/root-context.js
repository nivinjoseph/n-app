import { createContext, useContext } from "react";
export const RootContext = createContext(null);
export function useRootContext() {
    const ctx = useContext(RootContext);
    if (ctx == null)
        throw new Error("RootContext not provided <RootContext.Provider>");
    return ctx;
}
//# sourceMappingURL=root-context.js.map