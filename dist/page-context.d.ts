import type { ServiceLocator } from "@nivinjoseph/n-ject";
export type PageScope = ServiceLocator & {
    readonly __brand: "page";
};
export declare const PageContext: import("react").Context<PageScope | null>;
export declare function usePageContext(): PageScope;
//# sourceMappingURL=page-context.d.ts.map